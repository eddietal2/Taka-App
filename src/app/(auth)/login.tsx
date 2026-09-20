import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';

import { requestOtp } from '@/api/auth';
import { Button, Screen, SegmentedControl, TextField, ThemeToggle } from '@/components';
import {
  isValidTanzanianNumber,
  TANZANIA_COUNTRY_CODE,
  TANZANIA_MAX_NATIONAL_DIGITS,
  toE164,
} from '@/constants/phone';
import { fontSize, getPalette, spacing } from '@/constants/theme';
import { useI18n } from '@/features/i18n/context';
import { LANGUAGE_LABELS, LANGUAGES, type TranslationKey } from '@/features/i18n/translations';

/** Rendered as endonyms, so neither label needs translating itself. */
const LANGUAGE_OPTIONS = LANGUAGES.map((value) => ({ value, label: LANGUAGE_LABELS[value] }));

type FieldErrors = {
  /** Held as a key, not text, so the message follows the active language. */
  phone?: TranslationKey;
};

export default function LoginScreen() {
  const router = useRouter();
  const theme = getPalette(useColorScheme());
  const { language, setLanguage, t } = useI18n();
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  // Digits only, so `maxLength` counts the digits that matter rather than any
  // spaces the keypad can insert.
  const handleChange = (next: string) => {
    setError(undefined);
    setPhone(next.replace(/\D/g, ''));
  };

  const handleSubmit = async () => {
    const nextErrors: FieldErrors = {};
    if (!isValidTanzanianNumber(phone)) {
      nextErrors.phone = 'common.invalidPhone';
    }
    setErrors(nextErrors);
    setError(undefined);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      // The verification screen owns the sign-in itself: it needs the number to
      // send the code to, and to identify the account afterwards.
      const e164 = toE164(phone);
      await requestOtp(e164);
      router.push({ pathname: '/verify', params: { phone: e164 } });
    } catch (cause) {
      // Server copy arrives in English; only the fallback is translated.
      setError(cause instanceof Error ? cause.message : t('login.sendFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      {/* Pinned above the centred block so it reads as a page-level control. */}
      <View style={styles.controlsRow}>
        <SegmentedControl
          options={LANGUAGE_OPTIONS}
          value={language}
          onChange={setLanguage}
          accessibilityLabel={t('login.languageLabel')}
        />
        <ThemeToggle />
      </View>

      <View style={styles.main}>
        <View style={styles.header}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.logo}
            contentFit="contain"
          />
          <Text style={[styles.title, { color: theme.text }]}>{t('login.title')}</Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>{t('login.subtitle')}</Text>
        </View>

        <View style={styles.form}>
          <TextField
            label={t('login.phoneLabel')}
            value={phone}
            onChangeText={handleChange}
            prefix={TANZANIA_COUNTRY_CODE}
            placeholder="712345678"
            maxLength={TANZANIA_MAX_NATIONAL_DIGITS}
            keyboardType="phone-pad"
            autoComplete="tel"
            textContentType="telephoneNumber"
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            error={errors.phone ? t(errors.phone) : undefined}
          />

          {error ? (
            <Text style={[styles.apiError, { color: theme.danger }]}>{error}</Text>
          ) : null}

          <Button
            label={t('common.continue')}
            onPress={handleSubmit}
            loading={submitting}
            fullWidth
            size="lg"
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.textMuted }]}>{t('login.noAccount')}</Text>
        <Link href="/sign-up" asChild>
          <Pressable accessibilityRole="link" hitSlop={spacing.sm}>
            <Text style={[styles.link, { color: theme.primary }]}>{t('login.signUp')}</Text>
          </Pressable>
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  /**
   * Grows into the free space so the header and form stay vertically centred
   * while the switcher sits at the top and the footer at the bottom.
   */
  main: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  header: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.md,
    textAlign: 'center',
  },
  form: {
    gap: spacing.md,
  },
  apiError: {
    fontSize: fontSize.sm,
  },
  link: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: fontSize.sm,
  },
});
