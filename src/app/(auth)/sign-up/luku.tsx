import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { LUKU_METER_PATTERN } from '@/api/schemas';
import { Button, Screen, StepHeader, TextField } from '@/components';
import { spacing } from '@/constants/theme';
import { useSignUp } from '@/features/signup/context';
import { SIGN_UP_STEPS, signUpProgress } from '@/features/signup/steps';

const LUKU_LENGTH = 11;

/**
 * Meter number step. Only residents carry a LUKU meter — commercial accounts
 * are billed on their TIN — so anyone else landing here is sent away.
 */
export default function LukuScreen() {
  const router = useRouter();
  const { intent, phoneVerified, form, updateForm } = useSignUp();
  const [error, setError] = useState<string | undefined>();

  if (intent !== 'RESIDENT' || !phoneVerified) {
    return <Redirect href="/sign-up" />;
  }

  const progress = signUpProgress(intent, SIGN_UP_STEPS.luku);

  const handleContinue = () => {
    if (!LUKU_METER_PATTERN.test(form.luku_meter)) {
      setError(`Enter the ${LUKU_LENGTH}-digit number printed on your meter.`);
      return;
    }

    setError(undefined);
    router.push('/sign-up/location');
  };

  return (
    <Screen>
      <StepHeader
        title="Your LUKU meter"
        subtitle="We link your household to its meter so collections are billed to the right place."
        step={progress.step}
        totalSteps={progress.totalSteps}
        onBack={() => router.back()}
      />

      <View style={styles.form}>
        <TextField
          label="LUKU meter number"
          value={form.luku_meter}
          onChangeText={(value) => {
            setError(undefined);
            updateForm({ luku_meter: value.replace(/\D/g, '') });
          }}
          placeholder="14100000000"
          keyboardType="number-pad"
          maxLength={LUKU_LENGTH}
          hint="11 digits, printed on your meter."
          returnKeyType="done"
          onSubmitEditing={handleContinue}
          error={error}
        />

        <Button label="Continue" onPress={handleContinue} fullWidth size="lg" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
});
