import { Redirect, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';

import type { SessionUser } from '@/api/auth';
import { lookupLuku, type LukuLookupResponse } from '@/api/luku';
import { fetchAccount, updateSite, type SitePatch } from '@/api/profile';
import { LUKU_METER_PATTERN, type GeoPoint } from '@/api/schemas';
import {
  Button,
  LocationCapture,
  LocationMap,
  Screen,
  SegmentedControl,
  TextField,
} from '@/components';
import { INTENT_COPY } from '@/constants/registration';
import { fontSize, getPalette, radius, spacing } from '@/constants/theme';
import { getSessionUser, getToken, saveSessionUser } from '@/features/auth/session';
import { useI18n } from '@/features/i18n/context';

const LUKU_LENGTH = 11;
const MAP_HEIGHT = 220;

/** Which address to keep when a new meter already has one on file. */
type AddressChoice = 'mine' | 'saved';

/**
 * Edits the account's service address: its pin, its ward and street, and the
 * meter it is billed through.
 *
 * These are one answer to "where do we collect from", so they are edited and
 * saved together. The meter is the coupling: a meter carries an address on the
 * server, and a later sign-up for it is seeded from that address. Keeping a
 * single form means the profile and the meter can never disagree about where the
 * account is.
 *
 * Changing the meter runs the same enquiry as sign-up — the server now accepts
 * the session token for it — and a meter that already has an address asks which
 * address to keep rather than guessing.
 *
 * Sits outside the `(tabs)` group like the name and phone screens, so it opens
 * over the tab bar and returns to the profile when done.
 */
export default function EditLocationScreen() {
  const router = useRouter();
  const theme = getPalette(useColorScheme());
  const { t } = useI18n();
  const [session, setSession] = useState<{
    token: string | null;
    user: SessionUser | null;
  } | null>(null);
  const [location, setLocation] = useState<GeoPoint | null>(null);
  const [ward, setWard] = useState('');
  const [street, setStreet] = useState('');
  const [meter, setMeter] = useState('');
  /** The meter the account is on now, so a change can be told apart. */
  const [currentMeter, setCurrentMeter] = useState('');
  /** The meter that last came back from a successful enquiry. */
  const [resolvedMeter, setResolvedMeter] = useState<string | null>(null);
  const [lookup, setLookup] = useState<LukuLookupResponse | null>(null);
  const [addressChoice, setAddressChoice] = useState<AddressChoice>('mine');
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [finding, setFinding] = useState(false);
  const [saving, setSaving] = useState(false);

  /** Seeds the form from an account, so the fields start on the stored values. */
  const seed = (user: SessionUser) => {
    setLocation(user.location ?? null);
    setWard(user.ward_kata ?? '');
    setStreet(user.street_mtaa ?? '');
    setMeter(user.luku_meter ?? '');
    setCurrentMeter(user.luku_meter ?? '');
    // The meter already on the account is valid by definition, so it does not
    // need an enquiry before it can be saved again.
    setResolvedMeter(user.luku_meter ?? null);
  };

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const [token, user] = await Promise.all([getToken(), getSessionUser()]);
      if (cancelled) return;

      setSession({ token, user });
      if (user) seed(user);
      if (!token) return;

      // The stored account is what sign-in returned; the address may have moved
      // on since, so the server's copy is preferred when it can be reached.
      try {
        const fresh = await fetchAccount(token);
        if (cancelled || !fresh.user) return;
        await saveSessionUser(fresh.user);
        setSession({ token, user: fresh.user });
        seed(fresh.user);
      } catch {
        // Offline: the cached account is still a reasonable seed.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Nothing stored, or the session was cleared: back to sign in.
  if (session && (!session.token || !session.user)) {
    return <Redirect href="/login" />;
  }

  const user = session?.user;
  const isCommercial = user?.intent === 'COMMERCIAL';

  // Reporters pin nothing and hold no meter, so this screen is not for them.
  if (user && !INTENT_COPY[user.intent].needsLocation) {
    return <Redirect href="/profile" />;
  }

  const meterChanged = meter !== currentMeter;
  const meterRemoved = meter === '';
  // A changed meter must be confirmed with the utility before it can be saved;
  // removing one needs no confirmation.
  const needsResolution = meterChanged && !meterRemoved;
  const claimed = lookup?.luku_meter === meter && lookup?.state === 'claimed';
  const hasSavedAddress =
    lookup?.luku_meter === meter && lookup?.state === 'mapped' && Boolean(lookup.saved_address);
  // The owner comes from the enquiry when one was run, and from the account
  // itself for the meter it is already on — which is never re-enquired, because
  // it is valid by definition and the server would report it as claimed.
  const lookupOwner = lookup?.luku_meter === meter ? lookup.owner_name : null;
  const currentOwner = meter === currentMeter ? user?.luku_owner_name ?? null : null;
  const owner = lookupOwner ?? currentOwner;

  const canSave =
    Boolean(location) &&
    ward.trim().length >= 2 &&
    (isCommercial || !meterRemoved) &&
    (!needsResolution || (resolvedMeter === meter && !claimed));

  const handleMeterChange = (next: string) => {
    const digits = next.replace(/\D/g, '');
    setError(undefined);
    setNotice(null);
    setLookup(null);
    setAddressChoice('mine');
    setMeter(digits);
    setResolvedMeter(digits === currentMeter ? currentMeter : null);
  };

  const handleFind = async () => {
    const token = session?.token;
    if (!user || !token) return;

    // The meter the account is already on needs no enquiry: it is valid by
    // definition. The keyboard's Done key lands here too, so this also stops a
    // pre-populated meter from being re-checked and reported as in use.
    if (meter === currentMeter) return;

    if (!LUKU_METER_PATTERN.test(meter)) {
      setError(t('editLocation.meterFormat', { digits: LUKU_LENGTH }));
      return;
    }

    setError(undefined);
    setNotice(null);
    setFinding(true);

    try {
      const result = await lookupLuku({ phone: user.phone, luku_meter: meter }, token);
      setLookup(result);

      if (result.status === 'rejected') {
        setResolvedMeter(null);
        setError(t('editLocation.meterNotFound'));
        return;
      }

      if (result.state === 'claimed') {
        // On someone else's account, so the change cannot be saved.
        setResolvedMeter(null);
        return;
      }

      setResolvedMeter(meter);
      setAddressChoice('mine');

      // The utility not answering is a normal outcome, so it does not block.
      if (result.status === 'unconfirmed') setNotice(t('signUp.luku.unconfirmed'));
    } catch (cause) {
      setResolvedMeter(null);
      setError(cause instanceof Error ? cause.message : t('editLocation.meterFailed'));
    } finally {
      setFinding(false);
    }
  };

  /**
   * Applying the address on file is a client-side prefill: the choice decides
   * what this form sends, and the server stores whatever it is given.
   */
  const handleAddressChoice = (choice: AddressChoice) => {
    setAddressChoice(choice);

    const saved = lookup?.saved_address;
    if (choice === 'saved' && saved) {
      setLocation(saved.location);
      if (saved.ward_kata) setWard(saved.ward_kata);
      if (saved.street_mtaa) setStreet(saved.street_mtaa);
    }
  };

  const handleSave = async () => {
    const token = session?.token;
    if (!token || !location) return;

    if (ward.trim().length < 2) {
      setError(t('signUp.details.wardError'));
      return;
    }

    if (needsResolution && (resolvedMeter !== meter || claimed)) {
      setError(t('editLocation.resolveFirst'));
      return;
    }

    setError(undefined);
    setSaving(true);

    try {
      const site: SitePatch = {
        ward_kata: ward.trim(),
        street_mtaa: street.trim(),
        location,
      };
      // Omitted when unchanged, which tells the server to keep the current one.
      if (meterChanged) site.luku_meter = meter;

      const response = await updateSite(site, token);
      if (response.user) await saveSessionUser(response.user);
      router.back();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('editLocation.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const addressChoices = [
    { value: 'mine' as const, label: t('editLocation.keepMine') },
    { value: 'saved' as const, label: t('editLocation.useSaved') },
  ];

  return (
    <Screen
      footer={
        <Button
          label={t('common.save')}
          onPress={handleSave}
          loading={saving}
          disabled={!canSave}
          fullWidth
          size="lg"
        />
      }>
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel={t('common.goBack')}
        hitSlop={spacing.sm}
        style={styles.back}>
        <Text style={[styles.backText, { color: theme.textMuted }]}>{t('common.back')}</Text>
      </Pressable>

      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>{t('editLocation.title')}</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>
          {t('editLocation.subtitle')}
        </Text>
      </View>

      <View style={styles.form}>
        {/* Leads the form because the meter decides the address: it is what a
            lookup is run against, and what the address-on-file choice rewrites. */}
        <TextField
          label={t('editLocation.meterLabel')}
          value={meter}
          onChangeText={handleMeterChange}
          placeholder="14100000000"
          keyboardType="number-pad"
          maxLength={LUKU_LENGTH}
          hint={t('editLocation.meterHint')}
          returnKeyType="done"
          onSubmitEditing={() => void handleFind()}
        />

        {needsResolution ? (
          <Button
            label={t('editLocation.find')}
            onPress={handleFind}
            loading={finding}
            variant="outline"
            color={theme.primary}
            fullWidth
          />
        ) : null}

        {owner ? (
          <View style={[styles.result, { backgroundColor: theme.primary }]}>
            <Text style={[styles.resultLabel, { color: theme.onPrimary }]}>
              {t('signUp.luku.owner')}
            </Text>
            <Text style={[styles.resultValue, { color: theme.onPrimary }]}>{owner}</Text>
          </View>
        ) : null}

        {claimed ? (
          <View
            style={[styles.noticeBox, { borderColor: theme.danger, backgroundColor: theme.surface }]}>
            <Text style={[styles.noticeTitle, { color: theme.danger }]}>
              {t('signUp.luku.claimedTitle')}
            </Text>
            <Text style={[styles.noticeBody, { color: theme.textMuted }]}>
              {t('signUp.luku.claimedBody', { meter })}
            </Text>
          </View>
        ) : null}

        {hasSavedAddress ? (
          <View
            style={[
              styles.noticeBox,
              { borderColor: theme.secondary, backgroundColor: theme.surface },
            ]}>
            <Text style={[styles.noticeTitle, { color: theme.text }]}>
              {t('editLocation.onFileTitle')}
            </Text>
            <Text style={[styles.noticeBody, { color: theme.textMuted }]}>
              {t('editLocation.onFileBody', { meter })}
            </Text>
            <SegmentedControl
              options={addressChoices}
              value={addressChoice}
              onChange={handleAddressChoice}
              accessibilityLabel={t('editLocation.addressChoiceLabel')}
              style={styles.choice}
            />
          </View>
        ) : null}

        <LocationMap value={location} error={Boolean(error)} height={MAP_HEIGHT} />

        <LocationCapture
          value={location}
          onChange={(next) => {
            setError(undefined);
            // Editing the pin is a choice to keep this address, not the one on
            // file for the meter.
            setAddressChoice('mine');
            setLocation(next);
          }}
          error={error}
        />

        <TextField
          label={t('signUp.details.ward')}
          value={ward}
          onChangeText={(next) => {
            setError(undefined);
            setWard(next);
          }}
          placeholder="Ihumwa"
          returnKeyType="next"
        />

        <TextField
          label={t('signUp.details.street')}
          value={street}
          onChangeText={setStreet}
          placeholder="Mlimani"
          hint={t('signUp.details.streetHint')}
          returnKeyType="next"
        />

        {notice ? (
          <Text style={[styles.noticeText, { color: theme.textMuted }]}>{notice}</Text>
        ) : null}

        {error ? <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text> : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: {
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  header: {
    gap: spacing.xs,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: fontSize.sm,
  },
  form: {
    gap: spacing.md,
  },
  result: {
    padding: spacing.md,
    borderRadius: radius.md,
    gap: spacing.xs,
  },
  resultLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    opacity: 0.85,
  },
  resultValue: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  noticeBox: {
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  noticeTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  noticeBody: {
    fontSize: fontSize.sm,
  },
  choice: {
    alignSelf: 'stretch',
  },
  noticeText: {
    fontSize: fontSize.sm,
  },
  errorText: {
    fontSize: fontSize.sm,
  },
});
