import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { LUKU_METER_PATTERN } from '@/api/schemas';
import { Button, Screen, StepHeader, TextField } from '@/components';
import { spacing } from '@/constants/theme';
import { useSignUp } from '@/features/signup/context';
import { SIGN_UP_STEPS, SIGN_UP_TOTAL_STEPS } from '@/features/signup/steps';

type Errors = Partial<
  Record<'first_name' | 'last_name' | 'ward_kata' | 'street_mtaa' | 'luku_meter', string>
>;

export default function ResidentDetailsScreen() {
  const router = useRouter();
  const { intent, phoneVerified, form, updateForm } = useSignUp();
  const [errors, setErrors] = useState<Errors>({});

  if (intent !== 'RESIDENT' || !phoneVerified) {
    return <Redirect href="/sign-up" />;
  }

  const handleContinue = () => {
    const next: Errors = {};
    if (form.first_name.trim().length < 2) next.first_name = 'Enter your first name.';
    if (form.last_name.trim().length < 2) next.last_name = 'Enter your last name.';
    if (form.ward_kata.trim().length < 2) next.ward_kata = 'Enter your ward (kata).';
    if (form.street_mtaa.trim().length < 2) next.street_mtaa = 'Enter your street (mtaa).';
    if (!LUKU_METER_PATTERN.test(form.luku_meter)) next.luku_meter = 'LUKU meters are 11 digits.';

    setErrors(next);
    if (Object.keys(next).length > 0) return;
    router.push('/sign-up/media');
  };

  return (
    <Screen>
      <StepHeader
        title="Your details"
        subtitle="Tell us who you are and where we should collect from."
        step={SIGN_UP_STEPS.details}
        totalSteps={SIGN_UP_TOTAL_STEPS}
        onBack={() => router.back()}
      />

      <View style={styles.form}>
        <TextField
          label="First name"
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
          label="Last name"
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
          label="Ward / Kata"
          value={form.ward_kata}
          onChangeText={(value) => updateForm({ ward_kata: value })}
          placeholder="Ihumwa"
          returnKeyType="next"
          error={errors.ward_kata}
        />
        <TextField
          label="Street / Mtaa"
          value={form.street_mtaa}
          onChangeText={(value) => updateForm({ street_mtaa: value })}
          placeholder="Mlimani"
          returnKeyType="next"
          error={errors.street_mtaa}
        />
        <TextField
          label="Unit number"
          value={form.unit_number}
          onChangeText={(value) => updateForm({ unit_number: value })}
          placeholder="Room 4"
          hint="Optional — apartment, house or room."
          returnKeyType="next"
        />
        <TextField
          label="LUKU meter number"
          value={form.luku_meter}
          onChangeText={(value) => updateForm({ luku_meter: value.replace(/\D/g, '') })}
          placeholder="14100000000"
          keyboardType="number-pad"
          maxLength={11}
          hint="11 digits, printed on your meter."
          returnKeyType="done"
          onSubmitEditing={handleContinue}
          error={errors.luku_meter}
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
