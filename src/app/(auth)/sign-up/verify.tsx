import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';

import { requestOtp, verifyOtp } from '@/api/auth';
import { Button, Screen, StepHeader, TextField } from '@/components';
import { fontSize, getPalette, spacing } from '@/constants/theme';
import { useSignUp } from '@/features/signup/context';
import { detailsRouteFor, SIGN_UP_STEPS, SIGN_UP_TOTAL_STEPS } from '@/features/signup/steps';

const CODE_LENGTH = 6;

export default function VerifyPhoneScreen() {
  const router = useRouter();
  const theme = getPalette(useColorScheme());
  const { intent, phone, setVerified } = useSignUp();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  if (!intent || !phone) {
    return <Redirect href="/sign-up" />;
  }

  const handleVerify = async () => {
    if (code.length !== CODE_LENGTH) {
      setError(`Enter the ${CODE_LENGTH}-digit code.`);
      return;
    }

    setError(undefined);
    setMessage(null);
    setSubmitting(true);

    try {
      const response = await verifyOtp(phone, code);
      setVerified(response.verification_token ?? null);
      router.push(detailsRouteFor(intent));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'That code did not work. Try again.');
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
      setMessage('A new code is on its way.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not resend the code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <Screen>
      <StepHeader
        title="Enter your code"
        subtitle={`We sent a ${CODE_LENGTH}-digit code to ${phone}.`}
        step={SIGN_UP_STEPS.verify}
        totalSteps={SIGN_UP_TOTAL_STEPS}
        onBack={() => router.back()}
      />

      <View style={styles.form}>
        <TextField
          label="Verification code"
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

        <Button label="Verify" onPress={handleVerify} loading={submitting} fullWidth size="lg" />

        <Pressable
          onPress={handleResend}
          disabled={resending}
          accessibilityRole="button"
          hitSlop={spacing.sm}
          style={styles.resend}>
          <Text style={[styles.resendText, { color: theme.primary }]}>
            {resending ? 'Sending…' : 'Resend code'}
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
