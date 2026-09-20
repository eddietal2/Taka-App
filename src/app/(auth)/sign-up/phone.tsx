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
import { fontSize, getPalette, spacing } from '@/constants/theme';
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
    setValue(next.replace(/\D/g, ''));
  };

  const handleContinue = async () => {
    if (!isValidTanzanianNumber(value)) {
      setError(t('common.invalidPhone'));
      return;
    }

    setError(undefined);
    setSubmitting(true);
    try {
      const phone = toE164(value);
      await requestOtp(phone);
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
});
