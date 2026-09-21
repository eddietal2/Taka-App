import { Redirect, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, useColorScheme } from 'react-native';

import type { SessionUser } from '@/api/auth';
import { updateAccount } from '@/api/profile';
import { Button, PhotoPicker, Screen } from '@/components';
import { INTENT_COPY } from '@/constants/registration';
import { fontSize, getPalette, spacing } from '@/constants/theme';
import { getSessionUser, getToken, saveSessionUser } from '@/features/auth/session';
import { useI18n } from '@/features/i18n/context';

/**
 * The preview is a thumbnail on this screen rather than the main event, so it is
 * sized to 40% of the content width — a 60% reduction on the full-width default
 * the picker uses during sign-up.
 */
const PREVIEW_WIDTH = '40%';

/**
 * Standalone screen for replacing the account image — a profile picture for
 * residents and reporters, a business logo for commercial accounts, which is
 * what `INTENT_COPY` already names for each type.
 *
 * It sits outside the `(tabs)` group, so it opens over the tab bar as a focused
 * task rather than as another destination, and Done returns to the profile.
 *
 * Replacing the image is two steps that finish in different places. The picker
 * uploads the bytes to storage through the presign route and hands back the
 * object's public URL; that URL then goes to the account endpoint, which is what
 * makes the change stick for anyone else looking at this profile. Both halves
 * are needed — an upload nobody is told about is invisible to everyone but this
 * device.
 */
export default function EditPhotoScreen() {
  const router = useRouter();
  const theme = getPalette(useColorScheme());
  const { t } = useI18n();
  const [session, setSession] = useState<{
    token: string | null;
    user: SessionUser | null;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void Promise.all([getToken(), getSessionUser()]).then(([token, user]) => {
      if (!cancelled) setSession({ token, user });
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

  /** Writes the account into the session, which is what the profile screen reads. */
  const persist = (next: SessionUser) => {
    setSession((prev) => (prev ? { ...prev, user: next } : prev));
    void saveSessionUser(next);
  };

  /**
   * Stores the image the picker just uploaded.
   *
   * The response is preferred over the URL that was sent, because the server is
   * the authority on what it recorded.
   */
  const handleChange = async (url: string | null) => {
    const token = session?.token;
    if (!user || !token) return;

    setError(null);

    // Clearing has nowhere to go yet: both image columns are non-null, so the
    // API cannot be told "no picture". Rather than pretend otherwise by erasing
    // it only here, the removal stays on this device and the stored image is
    // left alone until the column can hold null.
    if (!url) {
      persist({ ...user, picture_url: undefined });
      return;
    }

    setSaving(true);
    try {
      const response = await updateAccount({ picture_url: url }, token);
      persist(response.user ?? { ...user, picture_url: url });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('profile.photoSaveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const isCommercial = user?.intent === 'COMMERCIAL';

  return (
    <Screen
      footer={
        <Button
          label={t('common.done')}
          onPress={() => router.back()}
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

      {/* The picker labels itself from the account type, so it doubles as the
          page heading rather than repeating it in a separate title above. */}
      {user ? (
        <PhotoPicker
          label={t(INTENT_COPY[user.intent].imageLabelKey)}
          value={user.picture_url ?? null}
          onChange={(url) => void handleChange(url)}
          purpose={isCommercial ? 'business_logo' : 'profile_picture'}
          token={session?.token}
          previewWidth={PREVIEW_WIDTH}
        />
      ) : null}

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
  error: {
    fontSize: fontSize.sm,
  },
});
