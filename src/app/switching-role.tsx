import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';

import { updateAccount } from '@/api/profile';
import { Button, Screen } from '@/components';
import { INTENT_COPY, USER_INTENTS, type UserIntent } from '@/constants/registration';
import { fontSize, getPalette, spacing } from '@/constants/theme';
import { getToken, saveSessionUser } from '@/features/auth/session';
import { useI18n } from '@/features/i18n/context';

const LOGO_SIZE = 96;

/**
 * The moment the account changes role.
 *
 * Switching rewrites which profile every other screen reads its fields from, so
 * it is given a screen of its own rather than a row that quietly turns into
 * something else: the icon holds the app's identity while the work happens, and a
 * failure can be retried in place instead of being stranded behind a closed tab.
 *
 * The switch is driven from here rather than by the caller, so the request and
 * the screen describing it cannot get out of step.
 */
export default function SwitchingRoleScreen() {
  const router = useRouter();
  const theme = getPalette(useColorScheme());
  const { t } = useI18n();
  const params = useLocalSearchParams<{ intent?: string }>();
  const intent: UserIntent | undefined = USER_INTENTS.find((value) => value === params.intent);

  const [error, setError] = useState<string | null>(null);
  /** Bumped to run the switch again after a failure. */
  const [attempt, setAttempt] = useState(0);
  /**
   * The attempt already started. Guards against React's development double
   * invocation firing two switches, while still letting a retry run.
   */
  const startedAttempt = useRef<number | null>(null);

  useEffect(() => {
    if (startedAttempt.current === attempt) return;
    startedAttempt.current = attempt;

    let cancelled = false;

    void (async () => {
      const token = await getToken();
      if (cancelled) return;

      if (!token) {
        router.replace('/login');
        return;
      }

      // An unknown role is a stale link rather than a failure worth reporting.
      if (!intent) {
        router.replace('/profile');
        return;
      }

      setError(null);
      try {
        const response = await updateAccount({ intent }, token);
        if (cancelled) return;
        if (response.user) await saveSessionUser(response.user);
        router.replace('/profile');
      } catch (cause) {
        if (cancelled) return;
        setError(cause instanceof Error ? cause.message : t('switchRole.failed'));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [attempt, intent, router, t]);

  const roleName = intent ? t(INTENT_COPY[intent].titleKey) : '';

  return (
    <Screen centered>
      <View style={styles.content}>
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logo}
          contentFit="contain"
        />

        {error ? (
          <>
            <Text style={[styles.title, { color: theme.text }]}>
              {t('switchRole.failedTitle')}
            </Text>
            <Text style={[styles.message, { color: theme.textMuted }]}>{error}</Text>
            <Button
              label={t('switchRole.retry')}
              onPress={() => setAttempt((current) => current + 1)}
              fullWidth
            />
            <Pressable
              onPress={() => router.replace('/profile')}
              accessibilityRole="button"
              hitSlop={spacing.sm}
              style={styles.back}>
              <Text style={[styles.backText, { color: theme.primary }]}>{t('common.back')}</Text>
            </Pressable>
          </>
        ) : (
          <>
            <ActivityIndicator color={theme.primary} />
            <Text style={[styles.title, { color: theme.text }]}>{t('switchRole.title')}</Text>
            <Text style={[styles.message, { color: theme.textMuted }]}>
              {t('switchRole.message', { role: roleName })}
            </Text>
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  /** Centred as a block: the icon, the spinner and the two lines read as one. */
  content: {
    alignItems: 'center',
    gap: spacing.md,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    fontSize: fontSize.md,
    textAlign: 'center',
  },
  back: {
    alignSelf: 'center',
    marginTop: spacing.xs,
  },
  backText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});
