import { Redirect, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';

import type { SessionUser } from '@/api/auth';
import { fetchAccount } from '@/api/profile';
import { Button, LocationMap, Screen } from '@/components';
import { INTENT_COPY } from '@/constants/registration';
import { fontSize, getPalette, radius, spacing } from '@/constants/theme';
import { getSessionUser, getToken, saveSessionUser } from '@/features/auth/session';
import { useI18n } from '@/features/i18n/context';

const MAP_HEIGHT = 220;

/**
 * One line of the address card: a small caption above its value.
 *
 * Stacked rather than set side by side, because these values are the long ones —
 * a utility's registered owner, a pair of coordinates. Sharing a row with its
 * label leaves a value only part of the width, where it wraps into a narrow,
 * right-aligned column that reads as a block. Given the full width it wraps at
 * its words instead, and however far it runs the label stays legible above it.
 */
function SummaryRow({
  label,
  value,
  divider = false,
}: {
  label: string;
  value: string;
  divider?: boolean;
}) {
  const theme = getPalette(useColorScheme());

  return (
    <View style={[styles.row, divider && { borderTopWidth: 1, borderTopColor: theme.border }]}>
      <Text style={[styles.rowLabel, { color: theme.textMuted }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

/**
 * The account's service address, read-only: the pin on a map, then the ward, the
 * street and the meter it is billed through.
 *
 * It is a summary rather than the editor because these four are one answer to
 * "where do we collect from", and changing any of them means re-pinning the
 * address — which is a page of its own. `Update location` opens that page with
 * an empty form, so the address is entered there afresh instead of edited in
 * place, and this screen re-reads the account on focus so the change shows the
 * moment it is saved.
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

  /**
   * Re-reads on every focus rather than only on mount: the address is saved on
   * the update screen, and a summary that stayed mounted would otherwise go on
   * showing the pin it replaced.
   */
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      void (async () => {
        const [token, user] = await Promise.all([getToken(), getSessionUser()]);
        if (cancelled) return;

        setSession({ token, user });
        if (!token) return;

        // The stored account is what sign-in returned; the address may have
        // moved on since, so the server's copy is preferred when reachable.
        try {
          const fresh = await fetchAccount(token);
          if (cancelled || !fresh.user) return;
          await saveSessionUser(fresh.user);
          setSession({ token, user: fresh.user });
        } catch {
          // Offline: the cached account is still a reasonable thing to show.
        }
      })();

      return () => {
        cancelled = true;
      };
    }, [])
  );

  // Nothing stored, or the session was cleared: back to sign in.
  if (session && (!session.token || !session.user)) {
    return <Redirect href="/login" />;
  }

  const user = session?.user;

  // Reporters pin nothing and hold no meter, so this screen is not for them.
  if (user && !INTENT_COPY[user.intent].needsLocation) {
    return <Redirect href="/profile" />;
  }

  // A business may never have had a meter, so every value has a fallback rather
  // than leaving a blank line.
  const notSet = t('editLocation.notSet');
  const location = user?.location ?? null;
  const coordinates = location
    ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
    : null;

  return (
    <Screen
      footer={
        <Button
          label={t('editLocation.update')}
          onPress={() => router.push('/edit-location/update')}
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

      {user ? (
        <View style={styles.body}>
          {/* The pin leads, because it is the answer everything below qualifies. */}
          {location ? (
            <LocationMap value={location} height={MAP_HEIGHT} />
          ) : (
            <Text style={[styles.empty, { color: theme.textMuted }]}>
              {t('editLocation.noPin')}
            </Text>
          )}

          {/* User Location & LUKU Information */}
          <View
            style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <SummaryRow label={t('signUp.details.ward')} value={user.ward_kata || notSet} />

            <SummaryRow label={t('signUp.details.street')} value={user.street_mtaa || notSet} divider />

            <SummaryRow label={t('editLocation.meterLabel')} value={user.luku_meter || notSet} divider />

            {/* Only shown when the utility named an owner, so a resident is not
                left wondering who else is on their meter. */}
            {user.luku_owner_name ? (
              <SummaryRow
                label={t('signUp.review.lukuOwner')}
                value={user.luku_owner_name}
                divider
              />
            ) : null}

            {coordinates ? (
              <SummaryRow label={t('editLocation.locationLabel')} value={coordinates} divider />
            ) : null}
          </View>
        </View>
      ) : null}
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
    lineHeight: 20,
  },
  body: {
    gap: spacing.md,
  },
  empty: {
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  card: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderRadius: radius.lg,
    // Clips the first and last row's corners to the card's radius.
    overflow: 'hidden',
  },
  row: {
    gap: spacing.xs,
    // Keeps a one-line value in the same 52pt band as the rest of the card.
    minHeight: 52,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  rowLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    lineHeight: 16,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  /** The stored value, given the whole width so a long one wraps at its words. */
  rowValue: {
    fontSize: fontSize.md,
    lineHeight: 22,
  },
});
