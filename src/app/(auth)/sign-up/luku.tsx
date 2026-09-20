import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';

import { lookupLuku } from '@/api/luku';
import { LUKU_METER_PATTERN } from '@/api/schemas';
import { Button, Screen, StepHeader, TextField } from '@/components';
import { fontSize, getPalette, radius, spacing } from '@/constants/theme';
import { useI18n } from '@/features/i18n/context';
import { useSignUp } from '@/features/signup/context';
import { SIGN_UP_STEPS, signUpProgress } from '@/features/signup/steps';

const LUKU_LENGTH = 11;

/**
 * Second step of sign-up, after the phone number is verified.
 *
 * The meter is resolved against the utility — the enquiry carries the verified
 * phone number so the server can assert it — and a confirmed meter becomes a
 * LUKU record the later steps (and future sign-ups for the same meter) build on.
 * The registered owner is shown so the resident can confirm the meter is theirs
 * before it is tied to their address.
 *
 * Reporters have no meter, so anyone else landing here is sent away.
 */
export default function LukuScreen() {
  const router = useRouter();
  const theme = getPalette(useColorScheme());
  const { t } = useI18n();
  const { intent, phone, phoneVerified, verificationToken, form, updateForm } = useSignUp();
  const [error, setError] = useState<string | undefined>();
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // A resolved meter lets Continue move on without spending another enquiry.
  const [resolved, setResolved] = useState(Boolean(form.luku_owner_name));

  if (!intent || intent === 'REPORTER' || !phoneVerified) {
    return <Redirect href="/sign-up" />;
  }

  const progress = signUpProgress(intent, SIGN_UP_STEPS.luku);

  const handleFind = async () => {
    if (!LUKU_METER_PATTERN.test(form.luku_meter)) {
      setError(t('signUp.luku.error', { digits: LUKU_LENGTH }));
      return;
    }

    setError(undefined);
    setNotice(null);
    setSubmitting(true);

    try {
      const result = await lookupLuku(
        { phone, luku_meter: form.luku_meter },
        verificationToken
      );

      // An address already pinned to this meter is reused instead of asked for a
      // second time: it seeds the location map and pre-fills the ward. The street
      // is left for the resident to type — a geocoded street name is often wrong.
      updateForm({
        luku_owner_name: result.owner_name,
        location: result.location ?? form.location,
        ward_kata:
          result.ward_kata && form.ward_kata.trim().length === 0 ? result.ward_kata : form.ward_kata,
      });

      if (result.status === 'rejected') {
        setResolved(false);
        setError(t('signUp.luku.notFound'));
        return;
      }

      if (result.status === 'unconfirmed') {
        // The utility did not answer. nTZS documents that as a normal outcome, so
        // it must not block sign-up — the meter can be confirmed later.
        setResolved(true);
        setNotice(t('signUp.luku.unconfirmed'));
        return;
      }

      setResolved(true);
    } catch (cause) {
      // Server messages arrive in English; only the fallback is translated.
      setResolved(false);
      setError(cause instanceof Error ? cause.message : t('signUp.luku.failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleContinue = () => {
    if (resolved) {
      router.push('/sign-up/location');
      return;
    }
    void handleFind();
  };

  const owner = form.luku_owner_name;

  return (
    <Screen
      footer={
        <Button
          label={resolved ? t('common.continue') : t('signUp.luku.lookup')}
          onPress={handleContinue}
          loading={submitting}
          fullWidth
          size="lg"
        />
      }>
      <StepHeader
        title={t('signUp.luku.title')}
        subtitle={t('signUp.luku.subtitle')}
        step={progress.step}
        totalSteps={progress.totalSteps}
        onBack={() => router.back()}
      />

      <View style={styles.form}>
        <TextField
          label={t('signUp.luku.label')}
          value={form.luku_meter}
          onChangeText={(value) => {
            setError(undefined);
            setNotice(null);
            setResolved(false);
            // Editing the meter invalidates everything derived from the old one,
            // so a stale owner or address can never be attached to a new number.
            updateForm({
              luku_meter: value.replace(/\D/g, ''),
              luku_owner_name: null,
              location: null,
              ward_kata: '',
              street_mtaa: '',
            });
          }}
          placeholder="14100000000"
          keyboardType="number-pad"
          maxLength={LUKU_LENGTH}
          hint={t('signUp.luku.hint')}
          returnKeyType="done"
          onSubmitEditing={() => void handleFind()}
          error={error}
        />

        {resolved && owner ? (
          // Confirmation card: the meter is on the utility's books, so it is
          // styled as a success rather than as neutral information.
          <View style={[styles.result, { backgroundColor: theme.primary }]}>
            <View style={[styles.resultBadge, { backgroundColor: theme.onPrimary }]}>
              <Text style={[styles.resultBadgeText, { color: theme.primary }]}>✓</Text>
            </View>

            <Text style={[styles.resultLabel, { color: theme.onPrimary }]}>
              {t('signUp.luku.owner')}
            </Text>
            <Text style={[styles.resultValue, { color: theme.onPrimary }]}>{owner}</Text>
          </View>
        ) : null}

        {notice ? <Text style={[styles.notice, { color: theme.textMuted }]}>{notice}</Text> : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  result: {
    padding: spacing.md,
    borderRadius: radius.md,
    gap: spacing.xs,
  },
  resultBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  resultBadgeText: {
    // An explicit line height keeps the glyph centred on Android, where a bare
    // Text is aligned to the font's baseline box rather than its visual centre.
    fontSize: fontSize.md,
    lineHeight: 20,
    fontWeight: '700',
  },
  resultLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    // Tones the label down against the solid primary without a second colour.
    opacity: 0.85,
  },
  resultValue: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  notice: {
    fontSize: fontSize.sm,
  },
});
