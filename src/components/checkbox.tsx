import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';

import { fontSize, getPalette, radius, spacing } from '@/constants/theme';

export type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children?: ReactNode;
  error?: string;
  disabled?: boolean;
};

export function Checkbox({ checked, onChange, children, error, disabled = false }: CheckboxProps) {
  const theme = getPalette(useColorScheme());

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => onChange(!checked)}
        disabled={disabled}
        accessibilityRole="checkbox"
        accessibilityState={{ checked, disabled }}
        hitSlop={spacing.xs}
        style={({ pressed }) => [styles.row, pressed && !disabled && styles.pressed]}>
        <View
          style={[
            styles.box,
            {
              borderColor: checked ? theme.primary : error ? theme.danger : theme.border,
              backgroundColor: checked ? theme.primary : 'transparent',
            },
          ]}>
          {checked ? <Text style={[styles.tick, { color: theme.onPrimary }]}>✓</Text> : null}
        </View>
        {children ? (
          <Text style={[styles.label, { color: theme.textMuted }]}>{children}</Text>
        ) : null}
      </Pressable>

      {error ? <Text style={[styles.error, { color: theme.danger }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: radius.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tick: {
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  label: {
    flex: 1,
    fontSize: fontSize.sm,
  },
  error: {
    fontSize: fontSize.xs,
  },
  pressed: {
    opacity: 0.75,
  },
});
