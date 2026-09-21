import { Redirect, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';

import type { SessionUser } from '@/api/auth';
import { updateAccount, type AccountPatch } from '@/api/profile';
import { Button, Screen, TextField } from '@/components';
import { fontSize, getPalette, spacing } from '@/constants/theme';
import { getSessionUser, getToken, saveSessionUser } from '@/features/auth/session';
import { useI18n } from '@/features/i18n/context';

/**
 * Matches the server's `nameSchema`. Checked here so a name that is too short is
 * refused before a round trip, rather than coming back as a field error.
 */
const MIN_NAME_LENGTH = 2;

type Errors = Partial<Record<'first_name' | 'last_name' | 'business_name', string>>;

/**
 * Edits the account's name: a first and last name for a resident or reporter, a
 * business name for a commercial account. Which pair applies comes from the
 * stored intent, and the server enforces the same split — sending the wrong one
 * is refused rather than silently dropped.
 *
 * Sits outside the `(tabs)` group like the photo screen, so it opens over the
 * tab bar as a focused task and Save returns to the profile.
 */
export default function EditNameScreen() {
  const router = useRouter();
  const theme = getPalette(useColorScheme());
  const { t } = useI18n();
  const [session, setSession] = useState<{
    token: string | null;
    user: SessionUser | null;
  } | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void Promise.all([getToken(), getSessionUser()]).then(([token, user]) => {
      if (cancelled) return;

      setSession({ token, user });
      // Seeded once from the stored account. The fields belong to the user from
      // here, so nothing re-reads them and overwrites what they have typed.
      setFirstName(user?.first_name ?? '');
      setLastName(user?.last_name ?? '');
      setBusinessName(user?.business_name ?? '');
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
  const isCommercial = user?.intent === 'COMMERCIAL';

  const handleSave = async () => {
    const token = session?.token;
    if (!user || !token) return;

    const next: Errors = {};
    if (isCommercial) {
      if (businessName.trim().length < MIN_NAME_LENGTH) {
        next.business_name = t('editName.nameError');
      }
    } else {
      if (firstName.trim().length < MIN_NAME_LENGTH) next.first_name = t('editName.nameError');
      if (lastName.trim().length < MIN_NAME_LENGTH) next.last_name = t('editName.nameError');
    }

    setErrors(next);
    setError(null);
    if (Object.keys(next).length > 0) return;

    const patch: AccountPatch = isCommercial
      ? { business_name: businessName.trim() }
      : { first_name: firstName.trim(), last_name: lastName.trim() };

    setSaving(true);
    try {
      const response = await updateAccount(patch, token);
      // The server is the authority on what it stored, so its record wins over
      // the values sent.
      await saveSessionUser(response.user ?? { ...user, ...patch });
      router.back();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('editName.saveFailed'));
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

      <View style={styles.form}>
        {isCommercial ? (
          <TextField
            label={t('profile.businessNameLabel')}
            value={businessName}
            onChangeText={setBusinessName}
            placeholder="Dodoma Fresh Grocers Ltd"
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={handleSave}
            error={errors.business_name}
          />
        ) : (
          <>
            <TextField
              label={t('editName.firstName')}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Juma"
              autoCapitalize="words"
              autoComplete="given-name"
              textContentType="givenName"
              returnKeyType="next"
              error={errors.first_name}
            />
            <TextField
              label={t('editName.lastName')}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Hassan"
              autoCapitalize="words"
              autoComplete="family-name"
              textContentType="familyName"
              returnKeyType="done"
              onSubmitEditing={handleSave}
              error={errors.last_name}
            />
          </>
        )}
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
  form: {
    gap: spacing.lg,
  },
  error: {
    fontSize: fontSize.sm,
  },
});
