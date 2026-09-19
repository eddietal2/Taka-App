import { Pressable, StyleSheet, Text, View, useColorScheme, type StyleProp, type ViewStyle } from 'react-native';

import { fontSize, getPalette, radius, spacing } from '@/constants/theme';

export type OptionCardProps = {
  title: string;
  description?: string;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

/** Single-select card used for choosing an account type. */
export function OptionCard({
  title,
  description,
  selected = false,
  disabled = false,
  onPress,
  style,
}: OptionCardProps) {
  const theme = getPalette(useColorScheme());

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled }}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: selected ? theme.primary : theme.border,
          borderWidth: selected ? 2 : 1,
        },
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}>
      <View style={styles.textBlock}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        {description ? (
          <Text style={[styles.description, { color: theme.textMuted }]}>{description}</Text>
        ) : null}
      </View>

      <View style={[styles.indicator, { borderColor: selected ? theme.primary : theme.border }]}>
        {selected ? <View style={[styles.dot, { backgroundColor: theme.primary }]} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  textBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  description: {
    fontSize: fontSize.sm,
  },
  indicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  pressed: {
    opacity: 0.75,
  },
  disabled: {
    opacity: 0.5,
  },
});
