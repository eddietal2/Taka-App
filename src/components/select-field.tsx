import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';

import { fontSize, getPalette, radius, spacing } from '@/constants/theme';
import { useI18n } from '@/features/i18n/context';

export type SelectOption<T extends string> = {
  value: T;
  label: string;
};

export type SelectFieldProps<T extends string> = {
  label?: string;
  value: T | '';
  options: readonly SelectOption<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
};

/** Labelled, theme-aware single-select that opens a modal list. */
export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
  placeholder,
  error,
  hint,
  disabled = false,
}: SelectFieldProps<T>) {
  const theme = getPalette(useColorScheme());
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);
  const placeholderText = placeholder ?? t('common.selectPlaceholder');

  return (
    <View style={styles.container}>
      {label ? <Text style={[styles.label, { color: theme.text }]}>{label}</Text> : null}

      <Pressable
        onPress={() => setOpen(true)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ expanded: open, disabled }}
        style={({ pressed }) => [
          styles.field,
          {
            backgroundColor: theme.surface,
            borderColor: error ? theme.danger : theme.border,
          },
          pressed && !disabled && styles.pressed,
          disabled && styles.disabled,
        ]}>
        <Text style={[styles.value, { color: selected ? theme.text : theme.textMuted }]}>
          {selected ? selected.label : placeholderText}
        </Text>
        <Text style={[styles.chevron, { color: theme.textMuted }]}>▾</Text>
      </Pressable>

      {error ? (
        <Text style={[styles.helper, { color: theme.danger }]}>{error}</Text>
      ) : hint ? (
        <Text style={[styles.helper, { color: theme.textMuted }]}>{hint}</Text>
      ) : null}

      <Modal
        visible={open}
        animationType="fade"
        transparent
        onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={[styles.sheet, { backgroundColor: theme.background }]} onPress={() => {}}>
            <Text style={[styles.sheetTitle, { color: theme.text }]}>
              {label ?? t('common.select')}
            </Text>
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  style={({ pressed }) => [
                    styles.option,
                    { borderColor: theme.border },
                    pressed && styles.pressed,
                  ]}>
                  <Text style={[styles.optionLabel, { color: theme.text }]}>{option.label}</Text>
                  {isSelected ? (
                    <Text style={[styles.check, { color: theme.primary }]}>✓</Text>
                  ) : null}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderRadius: radius.md,
  },
  value: {
    flex: 1,
    fontSize: fontSize.md,
    paddingVertical: spacing.sm,
  },
  chevron: {
    fontSize: fontSize.md,
  },
  helper: {
    fontSize: fontSize.xs,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  sheetTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderRadius: radius.md,
  },
  optionLabel: {
    flex: 1,
    fontSize: fontSize.md,
  },
  check: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.75,
  },
  disabled: {
    opacity: 0.5,
  },
});
