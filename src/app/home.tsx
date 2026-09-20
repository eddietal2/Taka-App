import { Image } from 'expo-image';
import { Redirect, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';

import type { SessionUser } from '@/api/auth';
import { Button, Screen } from '@/components';
import { fontSize, getPalette, spacing } from '@/constants/theme';
import { clearSession, getSessionUser, getToken } from '@/features/auth/session';
import { useI18n } from '@/features/i18n/context';

const AVATAR_SIZE = 96;

/**
 * Landing screen for a signed-in user: their picture and a greeting. Everything
 * past this point is still to be built.
 */
export default function HomeScreen() {
  const router = useRouter();
  const theme = getPalette(useColorScheme());
  const { t } = useI18n();
  const [session, setSession] = useState<{
    token: string | null;
    user: SessionUser | null;
  } | null>(null);

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
  // Commercial accounts are greeted by their business, everyone else by name.
  const name = user?.business_name ?? user?.first_name ?? '';

  const handleLogout = async () => {
    await clearSession();
    // `replace`, so Back cannot walk into a screen that expects a session.
    router.replace('/login');
  };

  return (
    <Screen centered>
      {user ? (
        <View style={styles.content}>
          {user.picture_url ? (
            <Image
              source={{ uri: user.picture_url }}
              style={[styles.avatar, { borderColor: theme.border }]}
              contentFit="cover"
            />
          ) : null}

          <Text style={[styles.greeting, { color: theme.text }]}>
            {t('home.greeting', { name })}
          </Text>

          <Button
            label={t('home.logout')}
            onPress={() => void handleLogout()}
            variant="outline"
            color={theme.danger}
            fullWidth
            size="lg"
          />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  /**
   * Circular, so it reads as an avatar for both a profile picture and a business
   * logo — and the bundled default avatar is already drawn as a circle.
   */
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 1,
  },
  greeting: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    textAlign: 'center',
  },
});
