import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Redirect, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState, type ReactNode } from 'react';
import { Alert, Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { SessionUser } from '@/api/auth';
import { updateAccount, type AccountPatch } from '@/api/profile';
import { Screen, SegmentedControl } from '@/components';
import { INTENT_COPY } from '@/constants/registration';
import { TAB_BAR_CLEARANCE } from '@/constants/tabs';
import { fontSize, getPalette, radius, spacing } from '@/constants/theme';
import { clearSession, getSessionUser, getToken } from '@/features/auth/session';
import { useI18n } from '@/features/i18n/context';
import { LANGUAGE_LABELS, LANGUAGES, type Language } from '@/features/i18n/translations';
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
  /** Set when a preference reached this device but not the account. */
  const [saveError, setSaveError] = useState<string | null>(null);

  /**
   * Re-reads on every focus rather than only on mount: the picture is replaced
   * on another screen, and a tab that stayed mounted would otherwise go on
   * showing the old one.
   */
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      void Promise.all([getToken(), getSessionUser()]).then(([token, user]) => {
        if (!cancelled) setSession({ token, user });
      });

      return () => {
        cancelled = true;
      };
    }, [])
  );

  // Nothing stored, or the session was cleared: back to sign in.
  if (session && (!session.token || !session.user)) {
    return <Redirect href="/login" />;
  }

  const user = session?.user;
  const isCommercial = user?.intent === 'COMMERCIAL';
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

  /**
   * Mirrors a preference onto the account, so it follows the user to another
   * device. Best-effort by design: the local change has already taken effect, so
   * a failure is reported without undoing what was just chosen.
   */
  const pushPreference = async (patch: AccountPatch) => {
    const token = session?.token;
    if (!token) return;

    setSaveError(null);
    try {
      await updateAccount(patch, token);
    } catch {
      setSaveError(t('profile.settingsSaveFailed'));
    }
  };

  const handleSchemeChange = (next: ColorSchemePreference) => {
    // Also records the choice on this device, so it survives a reload.
    applyColorScheme(next);
    void pushPreference({ theme_preference: next });
  };

  const handleLanguageChange = (next: Language) => {
    setLanguage(next);
    void pushPreference({ language: next });
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
            {/* Leads the card, so it carries no divider. The label follows the
                account type: a profile picture or a business logo. */}
            <Pressable
              onPress={() => router.push('/edit-photo')}
              accessibilityRole="button"
              accessibilityLabel={t(INTENT_COPY[user.intent].imageLabelKey)}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
              <Text style={[styles.rowLabel, { color: theme.text }]}>
                {t(INTENT_COPY[user.intent].imageLabelKey)}
              </Text>
              <Ionicons name="chevron-forward" size={ROW_ICON_SIZE} color={theme.textMuted} />
            </Pressable>

            {/* A person's name or a business's, matching whichever the edit
                screen behind it will offer to change. */}
            <Pressable
              onPress={() => router.push('/edit-name')}
              accessibilityRole="button"
              accessibilityLabel={t(
                isCommercial ? 'profile.businessNameLabel' : 'profile.nameLabel'
              )}
              style={({ pressed }) => [
                styles.row,
                { borderTopWidth: 1, borderTopColor: theme.border },
                pressed && styles.pressed,
              ]}>
              <Text style={[styles.rowLabel, { color: theme.text }]}>
                {t(isCommercial ? 'profile.businessNameLabel' : 'profile.nameLabel')}
              </Text>
              <Ionicons name="chevron-forward" size={ROW_ICON_SIZE} color={theme.textMuted} />
            </Pressable>

            {/* The number the account signs in with. Shown in full so it is
                recognisable at a glance; changing it sends a code to the new
                number first, because a number may only join an account once it
                is proven reachable. */}
            <Pressable
              onPress={() => router.push('/edit-phone')}
              accessibilityRole="button"
              accessibilityLabel={t('profile.phoneLabel')}
              style={({ pressed }) => [
                styles.row,
                { borderTopWidth: 1, borderTopColor: theme.border },
                pressed && styles.pressed,
              ]}>
              <Text style={[styles.rowLabel, { color: theme.text }]}>
                {t('profile.phoneLabel')}
              </Text>
              <Text style={[styles.rowValue, { color: theme.textMuted }]}>{user.phone}</Text>
              <Ionicons name="chevron-forward" size={ROW_ICON_SIZE} color={theme.textMuted} />
            </Pressable>

            {/* Absent on the web build, where the scheme cannot be forced. */}
            {CAN_FORCE_SCHEME ? (
              <SettingsRow label={t('profile.appearanceLabel')} divider>
                <SegmentedControl
                  options={themeOptions}
                  value={schemeValue}
                  onChange={handleSchemeChange}
                  accessibilityLabel={t('profile.appearanceLabel')}
                />
              </SettingsRow>
            ) : null}

            <SettingsRow label={t('profile.languageLabel')} divider>
              <SegmentedControl
                options={LANGUAGE_OPTIONS}
                value={language}
                onChange={handleLanguageChange}
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

          {saveError ? (
            <Text style={[styles.saveError, { color: theme.danger }]}>{saveError}</Text>
          ) : null}
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
  /** The setting's current value, shown before the row's chevron. */
  rowValue: {
    flexShrink: 1,
    fontSize: fontSize.md,
  },
  pressed: {
    opacity: 0.6,
  },
  saveError: {
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
});
