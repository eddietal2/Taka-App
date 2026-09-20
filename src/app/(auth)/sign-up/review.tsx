import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';

import { registerCommercial, registerReporter, registerResident } from '@/api/auth';
import { ApiError } from '@/api/client';
import type { GeoPoint } from '@/api/schemas';
import { Button, Checkbox, Screen, StepHeader } from '@/components';
import { INTENT_COPY, WASTE_TIER_LABEL_KEYS, type UserIntent } from '@/constants/registration';
import { fontSize, getPalette, radius, spacing } from '@/constants/theme';
import { saveToken } from '@/features/auth/session';
import { useI18n, type Translator } from '@/features/i18n/context';
import { buildRegisterPayload } from '@/features/signup/build-payload';
import { useSignUp } from '@/features/signup/context';
import { SIGN_UP_STEPS, signUpProgress } from '@/features/signup/steps';
import type { SignUpForm } from '@/features/signup/types';

type SummaryRow = { label: string; value: string };

function formatLocation(point: GeoPoint | null): string {
  return point ? `${point.latitude.toFixed(5)}, ${point.longitude.toFixed(5)}` : '—';
}

function summaryRows(
  intent: UserIntent,
  form: SignUpForm,
  phone: string,
  t: Translator
): SummaryRow[] {
  const rows: SummaryRow[] = [
    { label: t('signUp.review.accountType'), value: t(INTENT_COPY[intent].titleKey) },
    { label: t('signUp.review.phone'), value: phone },
  ];

  if (intent === 'COMMERCIAL') {
    rows.push(
      { label: t('signUp.review.business'), value: form.business_name || '—' },
      { label: t('signUp.details.ward'), value: form.ward_kata || '—' },
      { label: t('signUp.details.street'), value: form.street_mtaa || '—' },
      {
        label: t('signUp.details.wasteTier'),
        value: form.waste_tier ? t(WASTE_TIER_LABEL_KEYS[form.waste_tier]) : '—',
      },
      { label: t('signUp.details.taxId'), value: form.tax_id || '—' },
      { label: t('signUp.review.location'), value: formatLocation(form.location) },
      {
        label: t('signUp.review.logo'),
        value: form.business_logo ? t('common.uploaded') : '—',
      }
    );
    return rows;
  }

  rows.push({
    label: t('signUp.review.name'),
    value: `${form.first_name} ${form.last_name}`.trim() || '—',
  });

  if (intent === 'RESIDENT') {
    rows.push(
      { label: t('signUp.details.ward'), value: form.ward_kata || '—' },
      { label: t('signUp.details.street'), value: form.street_mtaa || '—' },
      { label: t('signUp.review.unit'), value: form.unit_number || '—' },
      { label: t('signUp.review.luku'), value: form.luku_meter || '—' },
      { label: t('signUp.review.location'), value: formatLocation(form.location) }
    );
  }

  rows.push({
    label: t(INTENT_COPY[intent].imageLabelKey),
    value: form.profile_picture ? t('common.uploaded') : '—',
  });
  return rows;
}

export default function ReviewScreen() {
  const router = useRouter();
  const theme = getPalette(useColorScheme());
  const { t } = useI18n();
  const { intent, phone, phoneVerified, verificationToken, form } = useSignUp();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  if (!intent || !phoneVerified) {
    return <Redirect href="/sign-up" />;
  }

  const progress = signUpProgress(intent, SIGN_UP_STEPS.review);
  const rows = summaryRows(intent, form, phone, t);

  const handleSubmit = async () => {
    const result = buildRegisterPayload(intent, phone, form);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }

    if (!acceptedTerms) {
      setErrors({ terms: t('signUp.review.termsError') });
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
          form: cause instanceof Error ? cause.message : t('signUp.review.failed'),
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen
      footer={
        <Button
          label={t('signUp.review.submit')}
          onPress={handleSubmit}
          loading={submitting}
          fullWidth
          size="lg"
          color={theme.primary}
          textColor={theme.onPrimary}
        />
      }>
      <StepHeader
        title={t('signUp.review.title')}
        subtitle={t('signUp.review.subtitle')}
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
        {t('signUp.review.terms')}
      </Checkbox>

      {errors.form ? (
        <Text style={[styles.formError, { color: theme.danger }]}>{errors.form}</Text>
      ) : null}
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
