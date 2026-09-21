import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';

import { requestOtp } from '@/api/auth';
import { Button, Screen, StepHeader, TextField } from '@/components';
import {
  isValidTanzanianNumber,
  TANZANIA_COUNTRY_CODE,
  TANZANIA_MAX_NATIONAL_DIGITS,
  toE164,
} from '@/constants/phone';
import { INTENT_COPY } from '@/constants/registration';
import { fontSize, getPalette, radius, spacing } from '@/constants/theme';
import { useI18n } from '@/features/i18n/context';
import { useSignUp } from '@/features/signup/context';
import { SIGN_UP_STEPS, signUpProgress } from '@/features/signup/steps';

export default function PhoneScreen() {
  const router = useRouter();
  const theme = getPalette(useColorScheme());
  const { t } = useI18n();
  const { intent, setPhone } = useSignUp();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  // E.164 of a number the API says already has an account, held while the notice
  // is on screen so the handoff to login can carry it.
  const [registeredPhone, setRegisteredPhone] = useState<string | null>(null);

  if (!intent) {
    return <Redirect href="/sign-up" />;
  }

  const progress = signUpProgress(intent, SIGN_UP_STEPS.phone);
  const intentTitle = t(INTENT_COPY[intent].titleKey);

  // The field is digits-only so `maxLength` counts exactly the digits that
  // matter — separators such as spaces would otherwise eat into that budget and
  // stop the user halfway through their number.
  const handleChange = (next: string) => {
    setError(undefined);
    // Editing the number is the only way past the notice, so it clears with it.
    setRegisteredPhone(null);
    setValue(next.replace(/\D/g, ''));
  };

  const handleContinue = async () => {
    if (!isValidTanzanianNumber(value)) {
      setError(t('common.invalidPhone'));
      return;
    }

    setError(undefined);
    setRegisteredPhone(null);
    setSubmitting(true);
    try {
      const phone = toE164(value);
      const response = await requestOtp(phone);

      // The code was sent, but this number already has an account and a second
      // one cannot be created for it, so the flow stops here. Carrying on would
      // only collect details that registration would refuse at the end.
      if (response.registered) {
        setRegisteredPhone(phone);
        return;
      }

      setPhone(phone);
      router.push('/sign-up/verify');
    } catch (cause) {
      // Server messages arrive in English; only the fallback is translated.
      setError(cause instanceof Error ? cause.message : t('signUp.phone.failed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen
      footer={
        <Button
          label={t('signUp.phone.submit')}
          onPress={handleContinue}
          loading={submitting}
          // Resending for the same number only trips the resend cooldown, so the
          // notice has to be dismissed by editing the field first.
          disabled={registeredPhone !== null}
          fullWidth
          size="lg"
        />
      }>
      <StepHeader
        title={t('signUp.phone.title')}
        subtitle={t('signUp.phone.subtitle', { intent: intentTitle })}
        step={progress.step}
        totalSteps={progress.totalSteps}
        onBack={() => router.back()}
      />

      <View style={styles.form}>
        <TextField
          label={t('signUp.phone.label')}
          value={value}
          onChangeText={handleChange}
          prefix={TANZANIA_COUNTRY_CODE}
          placeholder="712345678"
          maxLength={TANZANIA_MAX_NATIONAL_DIGITS}
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          returnKeyType="done"
          onSubmitEditing={handleContinue}
          error={error}
        />

        {registeredPhone ? (
          // Not a typo to fix in a field, so it gets its own notice with the one
          // action that resolves it, mirroring the duplicate handling on review.
          <View
            style={[
              styles.registered,
              { borderColor: theme.danger, backgroundColor: theme.surface },
            ]}>
            <Text style={[styles.registeredTitle, { color: theme.danger }]}>
              {t('signUp.phone.registeredTitle')}
            </Text>
            <Text style={[styles.registeredBody, { color: theme.textMuted }]}>
              {t('signUp.phone.registeredBody', { phone: registeredPhone })}
            </Text>
            <Button
              label={t('signUp.phone.registeredAction')}
              onPress={() =>
                router.replace({ pathname: '/login', params: { phone: registeredPhone } })
              }
              fullWidth
            />
          </View>
        ) : null}

        <Text style={[styles.note, { color: theme.textMuted }]}>{t('signUp.phone.note')}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  note: {
    fontSize: fontSize.xs,
  },
  registered: {
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  registeredTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  registeredBody: {
    fontSize: fontSize.sm,
  },
});
