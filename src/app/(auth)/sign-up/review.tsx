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
      { label: t('signUp.review.luku'), value: form.luku_meter || '—' },
      { label: t('signUp.review.lukuOwner'), value: form.luku_owner_name || '—' },
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
      { label: t('signUp.review.lukuOwner'), value: form.luku_owner_name || '—' },
      { label: t('signUp.review.location'), value: formatLocation(form.location) }
    );
  }

  rows.push({
    label: t(INTENT_COPY[intent].imageLabelKey),
    value: form.profile_picture ? t('common.uploaded') : '—',
  });
  return rows;
}

/**
 * Turns a field key from the payload builder or the API into a readable label.
 * Unknown keys fall through to `undefined` so the raw message still shows.
 */
function fieldLabel(key: string, intent: UserIntent, t: Translator): string | undefined {
  switch (key) {
    case 'phone':
      return t('signUp.review.phone');
    case 'first_name':
      return t('signUp.details.firstName');
    case 'last_name':
      return t('signUp.details.lastName');
    case 'ward_kata':
      return t('signUp.details.ward');
    case 'street_mtaa':
      return t('signUp.details.street');
    case 'unit_number':
      return t('signUp.details.unitNumber');
    case 'luku_meter':
      return t('signUp.review.luku');
    case 'business_name':
      return t('signUp.review.business');
    case 'waste_tier':
      return t('signUp.details.wasteTier');
    case 'tax_id':
      return t('signUp.details.taxId');
    case 'location':
      return t('signUp.review.location');
    case 'profile_picture':
    case 'business_logo':
      return t(INTENT_COPY[intent].imageLabelKey);
    default:
      return undefined;
  }
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

  // `form` and `terms` are rendered in their own places. Everything else is a
  // field-level message from the payload builder or the API, and has to be shown
  // here — otherwise the rejection is stored and never displayed, which makes
  // the button look like it did nothing at all.
  const fieldErrors = Object.entries(errors).filter(
    ([key]) => key !== 'form' && key !== 'terms'
  );

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
          disabled={!acceptedTerms}
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

      <Checkbox checked={acceptedTerms} onChange={setAcceptedTerms} error={errors.terms}>
        <Text>{t('signUp.review.termsPrefix')}</Text>
        <Text
          accessibilityRole="link"
          onPress={() => router.push('/terms')}
          style={[styles.termsLink, { color: theme.primary }]}>
          {t('legal.termsTitle')}
        </Text>
        <Text>{t('signUp.review.termsAnd')}</Text>
        <Text
          accessibilityRole="link"
          onPress={() => router.push('/privacy')}
          style={[styles.termsLink, { color: theme.primary }]}>
          {t('legal.privacyTitle')}
        </Text>
        <Text>{t('signUp.review.termsSuffix')}</Text>
      </Checkbox>

      {fieldErrors.length > 0 ? (
        <View
          style={[styles.errorBox, { borderColor: theme.danger, backgroundColor: theme.surface }]}>
          {fieldErrors.map(([key, message]) => {
            const label = fieldLabel(key, intent, t);
            return (
              <Text key={key} style={[styles.formError, { color: theme.danger }]}>
                {label ? `${label}: ${message}` : message}
              </Text>
            );
          })}
        </View>
      ) : null}

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
  errorBox: {
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: radius.md,
    gap: spacing.xs,
  },
  termsLink: {
    fontWeight: '600',
  },
});
