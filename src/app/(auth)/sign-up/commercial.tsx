import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { TAX_ID_PATTERN } from '@/api/schemas';
import { Button, Screen, SelectField, StepHeader, TextField } from '@/components';
import { WASTE_TIER_LABEL_KEYS, WASTE_TIERS } from '@/constants/registration';
import { spacing } from '@/constants/theme';
import { useI18n } from '@/features/i18n/context';
import { useSignUp } from '@/features/signup/context';
import { postDetailsRouteFor, SIGN_UP_STEPS, signUpProgress } from '@/features/signup/steps';

type Errors = Partial<
  Record<'business_name' | 'ward_kata' | 'street_mtaa' | 'waste_tier' | 'tax_id', string>
>;

export default function CommercialDetailsScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { intent, phoneVerified, form, updateForm } = useSignUp();
  const [errors, setErrors] = useState<Errors>({});

  if (intent !== 'COMMERCIAL' || !phoneVerified) {
    return <Redirect href="/sign-up" />;
  }

  const progress = signUpProgress(intent, SIGN_UP_STEPS.details);
  const wasteTierOptions = WASTE_TIERS.map((tier) => ({
    value: tier,
    label: t(WASTE_TIER_LABEL_KEYS[tier]),
  }));

  const handleContinue = () => {
    const next: Errors = {};
    if (form.business_name.trim().length < 2) {
      next.business_name = t('signUp.details.businessNameError');
    }
    if (form.ward_kata.trim().length < 2) next.ward_kata = t('signUp.details.wardError');
    if (form.street_mtaa.trim().length < 2) next.street_mtaa = t('signUp.details.streetError');
    if (!form.waste_tier) next.waste_tier = t('signUp.details.wasteTierError');
    if (!TAX_ID_PATTERN.test(form.tax_id)) next.tax_id = t('signUp.details.taxIdError');

    setErrors(next);
    if (Object.keys(next).length > 0) return;
    router.push(postDetailsRouteFor(intent));
  };

  return (
    <Screen>
      <StepHeader
        title={t('signUp.commercial.title')}
        subtitle={t('signUp.commercial.subtitle')}
        step={progress.step}
        totalSteps={progress.totalSteps}
        onBack={() => router.back()}
      />

      <View style={styles.form}>
        <TextField
          label={t('signUp.details.businessName')}
          value={form.business_name}
          onChangeText={(value) => updateForm({ business_name: value })}
          placeholder="Dodoma Fresh Grocers Ltd"
          autoCapitalize="words"
          autoComplete="organization"
          returnKeyType="next"
          error={errors.business_name}
        />
        <TextField
          label={t('signUp.details.ward')}
          value={form.ward_kata}
          onChangeText={(value) => updateForm({ ward_kata: value })}
          placeholder="Nzuguni"
          returnKeyType="next"
          error={errors.ward_kata}
        />
        <TextField
          label={t('signUp.details.street')}
          value={form.street_mtaa}
          onChangeText={(value) => updateForm({ street_mtaa: value })}
          placeholder="Sokoni Area"
          returnKeyType="next"
          error={errors.street_mtaa}
        />

        <SelectField
          label={t('signUp.details.wasteTier')}
          value={form.waste_tier}
          options={wasteTierOptions}
          onChange={(value) => updateForm({ waste_tier: value })}
          placeholder={t('signUp.details.wasteTierPlaceholder')}
          error={errors.waste_tier}
        />

        <TextField
          label={t('signUp.details.taxId')}
          value={form.tax_id}
          onChangeText={(value) => updateForm({ tax_id: value })}
          placeholder="100-234-567"
          keyboardType="number-pad"
          maxLength={11}
          hint={t('signUp.details.taxIdHint')}
          returnKeyType="done"
          onSubmitEditing={handleContinue}
          error={errors.tax_id}
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
