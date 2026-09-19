import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';

import { requestOtp } from '@/api/auth';
import { Button, Screen, StepHeader, TextField } from '@/components';
import { isValidTanzanianNumber, TANZANIA_COUNTRY_CODE, toE164 } from '@/constants/phone';
import { INTENT_COPY } from '@/constants/registration';
import { fontSize, getPalette, spacing } from '@/constants/theme';
import { useSignUp } from '@/features/signup/context';
import { SIGN_UP_STEPS, signUpProgress } from '@/features/signup/steps';

export default function PhoneScreen() {
  const router = useRouter();
  const theme = getPalette(useColorScheme());
  const { intent, setPhone } = useSignUp();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  if (!intent) {
    return <Redirect href="/sign-up" />;
  }

  const progress = signUpProgress(intent, SIGN_UP_STEPS.phone);

  const handleContinue = async () => {
    if (!isValidTanzanianNumber(value)) {
      setError('Enter a valid Tanzanian mobile number.');
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
      setError(cause instanceof Error ? cause.message : 'Could not send the code. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <StepHeader
        title="What's your phone number?"
        subtitle={`We'll text a one-time code to verify it. Signing up as ${INTENT_COPY[intent].title}.`}
        step={progress.step}
        totalSteps={progress.totalSteps}
        onBack={() => router.back()}
      />

      <View style={styles.form}>
        <TextField
          label="Phone number"
          value={value}
          onChangeText={setValue}
          prefix={TANZANIA_COUNTRY_CODE}
          placeholder="712 345 678"
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          returnKeyType="done"
          onSubmitEditing={handleContinue}
          error={error}
        />

        <Text style={[styles.note, { color: theme.textMuted }]}>
          You can also start with 0, e.g. 0712 345 678.
        </Text>

        <Button
          label="Send code"
          onPress={handleContinue}
          loading={submitting}
          fullWidth
          size="lg"
        />
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
