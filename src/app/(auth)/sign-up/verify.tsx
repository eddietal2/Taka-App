import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';

import { requestOtp, verifyOtp } from '@/api/auth';
import { Button, Screen, StepHeader, TextField } from '@/components';
import { fontSize, getPalette, spacing } from '@/constants/theme';
import { useI18n } from '@/features/i18n/context';
import { useSignUp } from '@/features/signup/context';
import { postVerifyRouteFor, SIGN_UP_STEPS, signUpProgress } from '@/features/signup/steps';

const CODE_LENGTH = 6;

export default function VerifyPhoneScreen() {
  const router = useRouter();
  const theme = getPalette(useColorScheme());
  const { t } = useI18n();
  const { intent, phone, setVerified } = useSignUp();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  if (!intent || !phone) {
    return <Redirect href="/sign-up" />;
  }

  const progress = signUpProgress(intent, SIGN_UP_STEPS.verify);

  const handleVerify = async () => {
    if (code.length !== CODE_LENGTH) {
      setError(t('signUp.verify.enterDigits', { digits: CODE_LENGTH }));
      return;
    }

    setError(undefined);
    setMessage(null);
    setSubmitting(true);

    try {
      const response = await verifyOtp(phone, code);
      setVerified(response.verification_token ?? null);
      router.push(postVerifyRouteFor(intent));
    } catch (cause) {
      // Server messages arrive in English; only the fallback is translated.
      setError(cause instanceof Error ? cause.message : t('signUp.verify.incorrect'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError(undefined);
    setMessage(null);
    setResending(true);

    try {
      await requestOtp(phone);
      setMessage(t('signUp.verify.resent'));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('signUp.verify.resendFailed'));
    } finally {
      setResending(false);
    }
  };

  return (
    <Screen
      footer={
        <Button
          label={t('signUp.verify.submit')}
          onPress={handleVerify}
          loading={submitting}
          fullWidth
          size="lg"
        />
      }>
      <StepHeader
        title={t('signUp.verify.title')}
        subtitle={t('signUp.verify.subtitle', { digits: CODE_LENGTH, phone })}
        step={progress.step}
        totalSteps={progress.totalSteps}
        onBack={() => router.back()}
      />

      <View style={styles.form}>
        <TextField
          label={t('signUp.verify.label')}
          value={code}
          onChangeText={(value) => setCode(value.replace(/\D/g, ''))}
          placeholder="000000"
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
          maxLength={CODE_LENGTH}
          returnKeyType="done"
          onSubmitEditing={handleVerify}
          error={error}
        />

        {message ? (
          <Text style={[styles.message, { color: theme.textMuted }]}>{message}</Text>
        ) : null}

        <Pressable
          onPress={handleResend}
          disabled={resending}
          accessibilityRole="button"
          hitSlop={spacing.sm}
          style={styles.resend}>
          <Text style={[styles.resendText, { color: theme.primary }]}>
            {resending ? t('signUp.verify.resending') : t('signUp.verify.resend')}
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  message: {
    fontSize: fontSize.sm,
  },
  resend: {
    alignSelf: 'center',
  },
  resendText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});
