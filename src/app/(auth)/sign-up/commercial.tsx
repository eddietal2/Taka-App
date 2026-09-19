import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { TAX_ID_PATTERN } from '@/api/schemas';
import { Button, Screen, SelectField, StepHeader, TextField } from '@/components';
import { WASTE_TIERS, WASTE_TIER_LABELS } from '@/constants/registration';
import { spacing } from '@/constants/theme';
import { useSignUp } from '@/features/signup/context';
import { SIGN_UP_STEPS, SIGN_UP_TOTAL_STEPS } from '@/features/signup/steps';

type Errors = Partial<
  Record<'business_name' | 'ward_kata' | 'street_mtaa' | 'waste_tier' | 'tax_id', string>
>;

const WASTE_TIER_OPTIONS = WASTE_TIERS.map((tier) => ({
  value: tier,
  label: WASTE_TIER_LABELS[tier],
}));

export default function CommercialDetailsScreen() {
  const router = useRouter();
  const { intent, phoneVerified, form, updateForm } = useSignUp();
  const [errors, setErrors] = useState<Errors>({});

  if (intent !== 'COMMERCIAL' || !phoneVerified) {
    return <Redirect href="/sign-up" />;
  }

  const handleContinue = () => {
    const next: Errors = {};
    if (form.business_name.trim().length < 2) next.business_name = 'Enter the business name.';
    if (form.ward_kata.trim().length < 2) next.ward_kata = 'Enter your ward (kata).';
    if (form.street_mtaa.trim().length < 2) next.street_mtaa = 'Enter your street (mtaa).';
    if (!form.waste_tier) next.waste_tier = 'Choose a waste tier.';
    if (!TAX_ID_PATTERN.test(form.tax_id)) next.tax_id = 'Use the 123-456-789 format.';

    setErrors(next);
    if (Object.keys(next).length > 0) return;
    router.push('/sign-up/media');
  };

  return (
    <Screen>
      <StepHeader
        title="Business details"
        subtitle="Tell us about the business and how much waste we should expect."
        step={SIGN_UP_STEPS.details}
        totalSteps={SIGN_UP_TOTAL_STEPS}
        onBack={() => router.back()}
      />

      <View style={styles.form}>
        <TextField
          label="Business name"
          value={form.business_name}
          onChangeText={(value) => updateForm({ business_name: value })}
          placeholder="Dodoma Fresh Grocers Ltd"
          autoCapitalize="words"
          autoComplete="organization"
          returnKeyType="next"
          error={errors.business_name}
        />
        <TextField
          label="Ward / Kata"
          value={form.ward_kata}
          onChangeText={(value) => updateForm({ ward_kata: value })}
          placeholder="Nzuguni"
          returnKeyType="next"
          error={errors.ward_kata}
        />
        <TextField
          label="Street / Mtaa"
          value={form.street_mtaa}
          onChangeText={(value) => updateForm({ street_mtaa: value })}
          placeholder="Sokoni Area"
          returnKeyType="next"
          error={errors.street_mtaa}
        />

        <SelectField
          label="Waste tier"
          value={form.waste_tier}
          options={WASTE_TIER_OPTIONS}
          onChange={(value) => updateForm({ waste_tier: value })}
          placeholder="Choose a tier"
          error={errors.waste_tier}
        />

        <TextField
          label="TIN / Tax ID"
          value={form.tax_id}
          onChangeText={(value) => updateForm({ tax_id: value })}
          placeholder="100-234-567"
          keyboardType="number-pad"
          maxLength={11}
          hint="Format: 123-456-789."
          returnKeyType="done"
          onSubmitEditing={handleContinue}
          error={errors.tax_id}
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
