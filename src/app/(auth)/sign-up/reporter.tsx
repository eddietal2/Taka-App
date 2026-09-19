import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, Screen, StepHeader, TextField } from '@/components';
import { spacing } from '@/constants/theme';
import { useI18n } from '@/features/i18n/context';
import { useSignUp } from '@/features/signup/context';
import { postDetailsRouteFor, SIGN_UP_STEPS, signUpProgress } from '@/features/signup/steps';

type Errors = Partial<Record<'first_name' | 'last_name', string>>;

export default function ReporterDetailsScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { intent, phoneVerified, form, updateForm } = useSignUp();
  const [errors, setErrors] = useState<Errors>({});

  if (intent !== 'REPORTER' || !phoneVerified) {
    return <Redirect href="/sign-up" />;
  }

  const progress = signUpProgress(intent, SIGN_UP_STEPS.details);

  const handleContinue = () => {
    const next: Errors = {};
    if (form.first_name.trim().length < 2) next.first_name = t('signUp.details.firstNameError');
    if (form.last_name.trim().length < 2) next.last_name = t('signUp.details.lastNameError');

    setErrors(next);
    if (Object.keys(next).length > 0) return;
    router.push(postDetailsRouteFor(intent));
  };

  return (
    <Screen>
      <StepHeader
        title={t('signUp.reporter.title')}
        subtitle={t('signUp.reporter.subtitle')}
        step={progress.step}
        totalSteps={progress.totalSteps}
        onBack={() => router.back()}
      />

      <View style={styles.form}>
        <TextField
          label={t('signUp.details.firstName')}
          value={form.first_name}
          onChangeText={(value) => updateForm({ first_name: value })}
          placeholder="Amina"
          autoCapitalize="words"
          autoComplete="given-name"
          textContentType="givenName"
          returnKeyType="next"
          error={errors.first_name}
        />
        <TextField
          label={t('signUp.details.lastName')}
          value={form.last_name}
          onChangeText={(value) => updateForm({ last_name: value })}
          placeholder="Said"
          autoCapitalize="words"
          autoComplete="family-name"
          textContentType="familyName"
          returnKeyType="done"
          onSubmitEditing={handleContinue}
          error={errors.last_name}
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
