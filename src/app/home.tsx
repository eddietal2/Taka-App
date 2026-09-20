import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, useColorScheme } from 'react-native';

import type { SessionUser } from '@/api/auth';
import { Screen } from '@/components';
import { fontSize, getPalette, spacing } from '@/constants/theme';
import { getSessionUser, getToken } from '@/features/auth/session';
import { useI18n } from '@/features/i18n/context';

/**
 * Placeholder landing screen for a signed-in user. Everything past this point is
 * still to be built, so it greets them by name and nothing more.
 */
export default function HomeScreen() {
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

  return (
    <Screen centered>
      {user ? (
        <Text style={[styles.greeting, { color: theme.text }]}>
          {t('home.greeting', { name })}
        </Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  greeting: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
});
