import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Redirect, useRouter } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { Alert, Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { SessionUser } from '@/api/auth';
import { Screen, SegmentedControl } from '@/components';
import { TAB_BAR_CLEARANCE } from '@/constants/tabs';
import { fontSize, getPalette, radius, spacing } from '@/constants/theme';
import { clearSession, getSessionUser, getToken } from '@/features/auth/session';
import { useI18n } from '@/features/i18n/context';
import { LANGUAGE_LABELS, LANGUAGES } from '@/features/i18n/translations';
import {
  applyColorScheme,
  CAN_FORCE_SCHEME,
  type ColorSchemePreference,
} from '@/features/theme/color-scheme';

const AVATAR_SIZE = 96;
const ROW_ICON_SIZE = 18;

/** Rendered as endonyms, so neither label needs translating itself. */
const LANGUAGE_OPTIONS = LANGUAGES.map((value) => ({ value, label: LANGUAGE_LABELS[value] }));

/**
 * One line of the settings card: a label on the left, a control on the right.
 *
 * The label takes the remaining width and wraps rather than pushing the control
 * past the card's edge, so a long translation stays inside the card instead of
 * overflowing it.
 */
function SettingsRow({
  label,
  divider = false,
  children,
}: {
  label: string;
  divider?: boolean;
  children: ReactNode;
}) {
  const theme = getPalette(useColorScheme());

  return (
    <View style={[styles.row, divider && { borderTopWidth: 1, borderTopColor: theme.border }]}>
      <Text style={[styles.rowLabel, { color: theme.text }]}>{label}</Text>
      {children}
    </View>
  );
}

/**
 * The resident's account tab: their picture and greeting above a settings card
 * holding appearance, language and sign out.
 *
 * The two preferences are applied immediately rather than behind a save button,
 * because both change the whole app on the spot and the result is its own
 * confirmation.
 */
export default function ProfileScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = getPalette(scheme);
  const insets = useSafeAreaInsets();
  const { language, setLanguage, t } = useI18n();
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
    // `replace`, so Back cannot walk into a screen that expects a session. The
    // flag tells the login screen that a sign-out just happened.
    router.replace({ pathname: '/login', params: { loggedOut: '1' } });
  };

  /** Getting back in needs a fresh code, so confirm before clearing the session. */
  const confirmLogout = () => {
    Alert.alert(t('home.logoutTitle'), t('home.logoutMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('home.logout'), onPress: () => void handleLogout() },
    ]);
  };

  const themeOptions = [
    { value: 'light' as const, label: t('profile.themeLight') },
    { value: 'dark' as const, label: t('profile.themeDark') },
  ];

  // A view of the scheme the system currently reports, rather than local state:
  // `applyColorScheme` feeds straight back through `useColorScheme()`, so the
  // toggle can never disagree with what the app is actually painted in.
  const schemeValue: ColorSchemePreference = scheme === 'dark' ? 'dark' : 'light';

  return (
    <Screen
      centered
      // The tab bar floats over the page, so the content has to clear it.
      contentContainerStyle={{ paddingBottom: insets.bottom + TAB_BAR_CLEARANCE }}>
      {user ? (
        <View style={styles.content}>
          <View style={styles.header}>
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
          </View>

          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {/* Absent on the web build, where the scheme cannot be forced. The
                language row then becomes the first row and drops its divider. */}
            {CAN_FORCE_SCHEME ? (
              <SettingsRow label={t('profile.appearanceLabel')}>
                <SegmentedControl
                  options={themeOptions}
                  value={schemeValue}
                  onChange={applyColorScheme}
                  accessibilityLabel={t('profile.appearanceLabel')}
                />
              </SettingsRow>
            ) : null}

            <SettingsRow label={t('profile.languageLabel')} divider={CAN_FORCE_SCHEME}>
              <SegmentedControl
                options={LANGUAGE_OPTIONS}
                value={language}
                onChange={setLanguage}
                accessibilityLabel={t('profile.languageLabel')}
              />
            </SettingsRow>

            {/* Laid out as one more row rather than a filled button, so the card
                reads as a single list. */}
            <Pressable
              onPress={confirmLogout}
              accessibilityRole="button"
              accessibilityLabel={t('home.logout')}
              style={({ pressed }) => [
                styles.row,
                { borderTopWidth: 1, borderTopColor: theme.border },
                pressed && styles.pressed,
              ]}>
              <Text style={[styles.rowLabel, { color: theme.danger }]}>{t('home.logout')}</Text>
              <Ionicons name="log-out-outline" size={ROW_ICON_SIZE} color={theme.danger} />
            </Pressable>
          </View>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  /** Stretches, so the card spans the page while the header stays centred. */
  content: {
    alignSelf: 'stretch',
    gap: spacing.xl,
  },
  header: {
    alignItems: 'center',
    gap: spacing.md,
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
  card: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderRadius: radius.lg,
    // Clips the first and last row's corners to the card's radius.
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    minHeight: 52,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  rowLabel: {
    flex: 1,
    fontSize: fontSize.md,
  },
  pressed: {
    opacity: 0.6,
  },
});
