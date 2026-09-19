import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';

import { Button, Screen, SegmentedControl, TextField } from '@/components';
import { isValidTanzanianNumber, TANZANIA_COUNTRY_CODE } from '@/constants/phone';
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
  const theme = getPalette(useColorScheme());
  const { language, setLanguage, t } = useI18n();
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const nextErrors: FieldErrors = {};
    if (!isValidTanzanianNumber(phone)) {
      nextErrors.phone = 'common.invalidPhone';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      // TODO: send a one-time code to the number in E.164 form, then route to the
      // verification step: router.push('/verify').
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen centered>
      <SegmentedControl
        options={LANGUAGE_OPTIONS}
        value={language}
        onChange={setLanguage}
        accessibilityLabel={t('login.languageLabel')}
        style={styles.language}
      />

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
          onChangeText={setPhone}
          prefix={TANZANIA_COUNTRY_CODE}
          placeholder="712 345 678"
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
          error={errors.phone ? t(errors.phone) : undefined}
        />

        <Button
          label={t('common.continue')}
          onPress={handleSubmit}
          loading={submitting}
          fullWidth
          size="lg"
        />
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
  language: {
    alignSelf: 'flex-end',
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
