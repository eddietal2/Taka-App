import {
    Pressable,
    StyleSheet,
    Text,
    View,
    useColorScheme,
    type StyleProp,
    type ViewStyle,
} from 'react-native';

import { fontSize, getPalette, radius, spacing } from '@/constants/theme';

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
};

export type SegmentedControlProps<T extends string> = {
  options: readonly SegmentedOption<T>[];
  /** Currently selected value; the control is controlled, not self-managed. */
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * Compact single-select toggle, e.g. switching the app language.
 *
 * Generic over the value type so callers keep a narrow union instead of a
 * plain string, and every option is always visible so the choice is a tap
 * rather than a discoverable menu.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
  style,
}: SegmentedControlProps<T>) {
  const theme = getPalette(useColorScheme());

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.track,
        { backgroundColor: theme.surface, borderColor: theme.border },
        style,
      ]}>
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            style={({ pressed }) => [
              styles.segment,
              selected && { backgroundColor: theme.primary },
              pressed && !selected && styles.pressed,
            ]}>
            <Text
              style={[styles.label, { color: selected ? theme.onPrimary : theme.textMuted }]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    padding: 2,
    borderWidth: 1,
    borderRadius: radius.pill,
  },
  segment: {
    minHeight: 32,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.75,
  },
});
