import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';

import { registerCommercial, registerReporter, registerResident } from '@/api/auth';
import { ApiError } from '@/api/client';
import type { GeoPoint } from '@/api/schemas';
import { Button, Checkbox, Screen, StepHeader } from '@/components';
import { INTENT_COPY, WASTE_TIER_LABELS, type UserIntent } from '@/constants/registration';
import { fontSize, getPalette, radius, spacing } from '@/constants/theme';
import { saveToken } from '@/features/auth/session';
import { buildRegisterPayload } from '@/features/signup/build-payload';
import { useSignUp } from '@/features/signup/context';
import { SIGN_UP_STEPS, signUpProgress } from '@/features/signup/steps';
import type { SignUpForm } from '@/features/signup/types';

type SummaryRow = { label: string; value: string };

function formatLocation(point: GeoPoint | null): string {
  return point ? `${point.latitude.toFixed(5)}, ${point.longitude.toFixed(5)}` : '—';
}

function summaryRows(intent: UserIntent, form: SignUpForm, phone: string): SummaryRow[] {
  const rows: SummaryRow[] = [
    { label: 'Account type', value: INTENT_COPY[intent].title },
    { label: 'Phone', value: phone },
  ];

  if (intent === 'COMMERCIAL') {
    rows.push(
      { label: 'Business', value: form.business_name || '—' },
      { label: 'Ward / Kata', value: form.ward_kata || '—' },
      { label: 'Street / Mtaa', value: form.street_mtaa || '—' },
      {
        label: 'Waste tier',
        value: form.waste_tier ? WASTE_TIER_LABELS[form.waste_tier] : '—',
      },
      { label: 'TIN', value: form.tax_id || '—' },
      { label: 'Location', value: formatLocation(form.location) },
      { label: 'Logo', value: form.business_logo ? 'Uploaded' : '—' }
    );
    return rows;
  }

  rows.push({ label: 'Name', value: `${form.first_name} ${form.last_name}`.trim() || '—' });

  if (intent === 'RESIDENT') {
    rows.push(
      { label: 'Ward / Kata', value: form.ward_kata || '—' },
      { label: 'Street / Mtaa', value: form.street_mtaa || '—' },
      { label: 'Unit', value: form.unit_number || '—' },
      { label: 'LUKU meter', value: form.luku_meter || '—' },
      { label: 'Location', value: formatLocation(form.location) }
    );
  }

  rows.push({
    label: INTENT_COPY[intent].imageLabel,
    value: form.profile_picture ? 'Uploaded' : '—',
  });
  return rows;
}

export default function ReviewScreen() {
  const router = useRouter();
  const theme = getPalette(useColorScheme());
  const { intent, phone, phoneVerified, verificationToken, form } = useSignUp();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  if (!intent || !phoneVerified) {
    return <Redirect href="/sign-up" />;
  }

  const progress = signUpProgress(intent, SIGN_UP_STEPS.review);
  const rows = summaryRows(intent, form, phone);

  const handleSubmit = async () => {
    const result = buildRegisterPayload(intent, phone, form);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }

    if (!acceptedTerms) {
      setErrors({ terms: 'Please accept the terms to continue.' });
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const response =
        result.payload.intent === 'RESIDENT'
          ? await registerResident(result.payload, verificationToken)
          : result.payload.intent === 'REPORTER'
            ? await registerReporter(result.payload, verificationToken)
            : await registerCommercial(result.payload, verificationToken);

      if (response.token) {
        await saveToken(response.token);
      }

      router.replace({
        pathname: '/sign-up/success',
        params: { pending: response.token ? '0' : '1' },
      });
    } catch (cause) {
      if (cause instanceof ApiError && cause.fieldErrors) {
        setErrors(cause.fieldErrors);
      } else {
        setErrors({
          form: cause instanceof Error ? cause.message : 'Registration failed. Please try again.',
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <StepHeader
        title="Check everything"
        subtitle="We use these details to set up your Taka account."
        step={progress.step}
        totalSteps={progress.totalSteps}
        onBack={() => router.back()}
      />

      <View style={[styles.card, { borderColor: theme.border, backgroundColor: theme.surface }]}>
        {rows.map((row) => (
          <View key={row.label} style={styles.row}>
            <Text style={[styles.label, { color: theme.textMuted }]}>{row.label}</Text>
            <Text style={[styles.value, { color: theme.text }]}>{row.value}</Text>
          </View>
        ))}
      </View>

      <Checkbox
        checked={acceptedTerms}
        onChange={setAcceptedTerms}
        error={errors.terms}>
        I agree to the Terms of Service and Privacy Policy.
      </Checkbox>

      {errors.form ? (
        <Text style={[styles.formError, { color: theme.danger }]}>{errors.form}</Text>
      ) : null}

      <Button
        label="Create account"
        onPress={handleSubmit}
        loading={submitting}
        fullWidth
        size="lg"
        color={theme.primary}
        textColor={theme.onPrimary}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    flexShrink: 0,
  },
  value: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '600',
    textAlign: 'right',
  },
  formError: {
    fontSize: fontSize.sm,
  },
});
