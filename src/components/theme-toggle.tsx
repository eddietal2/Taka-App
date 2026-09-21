import { Pressable, StyleSheet, Text, useColorScheme } from 'react-native';

import { fontSize, getPalette, radius, spacing } from '@/constants/theme';
import { useI18n } from '@/features/i18n/context';
import { applyColorScheme, CAN_FORCE_SCHEME } from '@/features/theme/color-scheme';

/**
 * Compact light/dark switch. The glyph shows the scheme you would switch *to*,
 * which is why the moon appears while the app is light.
 */
export function ThemeToggle() {
  const scheme = useColorScheme();
  const theme = getPalette(scheme);
  const { t } = useI18n();

  if (!CAN_FORCE_SCHEME) return null;

  const isDark = scheme === 'dark';

  return (
    <Pressable
      onPress={() => applyColorScheme(isDark ? 'light' : 'dark')}
      accessibilityRole="button"
      accessibilityLabel={isDark ? t('login.themeLight') : t('login.themeDark')}
      hitSlop={spacing.xs}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: theme.surface, borderColor: theme.border },
        pressed && styles.pressed,
      ]}>
      <Text style={[styles.icon, { color: theme.text }]}>{isDark ? '☀' : '☾'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 32,
    minWidth: 42,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.pill,
  },
  icon: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.75,
  },
});
