import { Redirect, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';

import type { SessionUser } from '@/api/auth';
import { updateAccount, type AccountPatch } from '@/api/profile';
import { TAX_ID_PATTERN } from '@/api/schemas';
import { Button, Screen, TextField } from '@/components';
import { formatTaxId, TAX_ID_MAX_LENGTH } from '@/constants/tax-id';
import { fontSize, getPalette, spacing } from '@/constants/theme';
import { getSessionUser, getToken, saveSessionUser } from '@/features/auth/session';
import { useI18n } from '@/features/i18n/context';

/**
 * Edits the business's TIN — the tax number it is invoiced under.
 *
 * Commercial accounts only. A resident or reporter has no TIN and the server
 * refuses the field for them, so anyone else who lands here is sent back to the
 * profile rather than shown a field that could never be saved. A business always
 * has one: sign-up requires it, so the field opens on the stored number rather
 * than empty.
 *
 * Sits outside the `(tabs)` group like the name and phone screens, so it opens
 * over the tab bar and Save returns to the profile.
 */
export default function EditTaxIdScreen() {
  const router = useRouter();
  const theme = getPalette(useColorScheme());
  const { t } = useI18n();
  const [session, setSession] = useState<{
    token: string | null;
    user: SessionUser | null;
  } | null>(null);
  const [taxId, setTaxId] = useState('');
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void Promise.all([getToken(), getSessionUser()]).then(([token, user]) => {
      if (cancelled) return;

      setSession({ token, user });
      // Seeded once from the stored account. The field belongs to the user from
      // here, so nothing re-reads it and overwrites what they have typed.
      setTaxId(user?.tax_id ?? '');
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // Nothing stored, or the session was cleared: back to sign in.
  if (session && (!session.token || !session.user)) {
    return <Redirect href="/login" />;
  }

  const user = session?.user;

  // The TIN is a commercial field, so there is nothing here for anyone else.
  if (user && user.intent !== 'COMMERCIAL') {
    return <Redirect href="/profile" />;
  }

  const handleSave = async () => {
    const token = session?.token;
    if (!user || !token) return;

    // Checked here so an incomplete TIN is refused before a round trip, rather
    // than coming back as a server field error on a form with one field.
    if (!TAX_ID_PATTERN.test(taxId)) {
      setFieldError(t('signUp.details.taxIdError'));
      setError(null);
      return;
    }

    setFieldError(undefined);
    setError(null);
    setSaving(true);

    try {
      const patch: AccountPatch = { tax_id: taxId };
      const response = await updateAccount(patch, token);
      // The server is the authority on what it stored, so its record wins over
      // the value sent.
      await saveSessionUser(response.user ?? { ...user, ...patch });
      router.back();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('editTaxId.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen
      footer={
        <Button
          label={t('common.save')}
          onPress={handleSave}
          loading={saving}
          fullWidth
          size="lg"
        />
      }>
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel={t('common.goBack')}
        hitSlop={spacing.sm}
        style={styles.back}>
        <Text style={[styles.backText, { color: theme.textMuted }]}>{t('common.back')}</Text>
      </Pressable>

      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>{t('editTaxId.title')}</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>
          {t('editTaxId.subtitle')}
        </Text>
      </View>

      <View style={styles.form}>
        <TextField
          label={t('signUp.details.taxId')}
          value={taxId}
          onChangeText={(value) => {
            setFieldError(undefined);
            setTaxId(formatTaxId(value));
          }}
          placeholder="100-234-567"
          keyboardType="number-pad"
          maxLength={TAX_ID_MAX_LENGTH}
          hint={t('signUp.details.taxIdHint')}
          returnKeyType="done"
          onSubmitEditing={handleSave}
          error={fieldError}
        />
      </View>

      {error ? <Text style={[styles.error, { color: theme.danger }]}>{error}</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: {
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  header: {
    gap: spacing.xs,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  form: {
    gap: spacing.lg,
  },
  error: {
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
});
