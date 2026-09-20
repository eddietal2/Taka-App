import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, Screen, StepHeader, TextField } from '@/components';
import { spacing } from '@/constants/theme';
import { useI18n } from '@/features/i18n/context';
import { useSignUp } from '@/features/signup/context';
import { postDetailsRouteFor, SIGN_UP_STEPS, signUpProgress } from '@/features/signup/steps';

type Errors = Partial<Record<'first_name' | 'last_name' | 'ward_kata' | 'street_mtaa', string>>;

export default function ResidentDetailsScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { intent, phoneVerified, form, updateForm } = useSignUp();
  const [errors, setErrors] = useState<Errors>({});

  if (intent !== 'RESIDENT' || !phoneVerified) {
    return <Redirect href="/sign-up" />;
  }

  const progress = signUpProgress(intent, SIGN_UP_STEPS.details);

  const handleContinue = () => {
    const next: Errors = {};
    if (form.first_name.trim().length < 2) next.first_name = t('signUp.details.firstNameError');
    if (form.last_name.trim().length < 2) next.last_name = t('signUp.details.lastNameError');
    if (form.ward_kata.trim().length < 2) next.ward_kata = t('signUp.details.wardError');
    if (form.street_mtaa.trim().length < 2) next.street_mtaa = t('signUp.details.streetError');

    setErrors(next);
    if (Object.keys(next).length > 0) return;
    router.push(postDetailsRouteFor(intent));
  };

  return (
    <Screen
      footer={
        <Button label={t('common.continue')} onPress={handleContinue} fullWidth size="lg" />
      }>
      <StepHeader
        title={t('signUp.resident.title')}
        subtitle={t('signUp.resident.subtitle')}
        step={progress.step}
        totalSteps={progress.totalSteps}
        onBack={() => router.back()}
      />

      <View style={styles.form}>
        <TextField
          label={t('signUp.details.firstName')}
          value={form.first_name}
          onChangeText={(value) => updateForm({ first_name: value })}
          placeholder="Juma"
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
          placeholder="Hassan"
          autoCapitalize="words"
          autoComplete="family-name"
          textContentType="familyName"
          returnKeyType="next"
          error={errors.last_name}
        />
        <TextField
          label={t('signUp.details.ward')}
          value={form.ward_kata}
          onChangeText={(value) => updateForm({ ward_kata: value })}
          placeholder="Ihumwa"
          returnKeyType="next"
          error={errors.ward_kata}
        />
        <TextField
          label={t('signUp.details.street')}
          value={form.street_mtaa}
          onChangeText={(value) => updateForm({ street_mtaa: value })}
          placeholder="Mlimani"
          returnKeyType="next"
          error={errors.street_mtaa}
        />
        <TextField
          label={t('signUp.details.unitNumber')}
          value={form.unit_number}
          onChangeText={(value) => updateForm({ unit_number: value })}
          placeholder={t('signUp.details.unitPlaceholder')}
          hint={t('signUp.details.unitHint')}
          returnKeyType="done"
          onSubmitEditing={handleContinue}
        />

      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
});
