import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { LUKU_METER_PATTERN } from '@/api/schemas';
import { Button, Screen, StepHeader, TextField } from '@/components';
import { spacing } from '@/constants/theme';
import { useI18n } from '@/features/i18n/context';
import { useSignUp } from '@/features/signup/context';
import { SIGN_UP_STEPS, signUpProgress } from '@/features/signup/steps';

const LUKU_LENGTH = 11;

/**
 * Meter number step. Only residents carry a LUKU meter — commercial accounts
 * are billed on their TIN — so anyone else landing here is sent away.
 */
export default function LukuScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { intent, phoneVerified, form, updateForm } = useSignUp();
  const [error, setError] = useState<string | undefined>();

  if (intent !== 'RESIDENT' || !phoneVerified) {
    return <Redirect href="/sign-up" />;
  }

  const progress = signUpProgress(intent, SIGN_UP_STEPS.luku);

  const handleContinue = () => {
    if (!LUKU_METER_PATTERN.test(form.luku_meter)) {
      setError(t('signUp.luku.error', { digits: LUKU_LENGTH }));
      return;
    }

    setError(undefined);
    router.push('/sign-up/location');
  };

  return (
    <Screen>
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
            updateForm({ luku_meter: value.replace(/\D/g, '') });
          }}
          placeholder="14100000000"
          keyboardType="number-pad"
          maxLength={LUKU_LENGTH}
          hint={t('signUp.luku.hint')}
          returnKeyType="done"
          onSubmitEditing={handleContinue}
          error={error}
        />

        <Button label={t('common.continue')} onPress={handleContinue} fullWidth size="lg" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
});
