import { useState, type ComponentProps } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { fontSize, getPalette, radius, spacing } from '@/constants/theme';

type TextInputProps = ComponentProps<typeof TextInput>;

export type TextFieldProps = Omit<
  TextInputProps,
  'style' | 'secureTextEntry' | 'placeholderTextColor' | 'editable'
> & {
  /** Label rendered above the input. */
  label?: string;
  /** Error message rendered below the input; also turns the border red. */
  error?: string;
  /** Helper text rendered below the input when there is no error. */
  hint?: string;
  /** Static text rendered inside the field before the input, e.g. a country code. */
  prefix?: string;
  /** Renders a password field with a show/hide toggle. */
  password?: boolean;
  editable?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<TextStyle>;
};

/**
 * Labelled, theme-aware text input with focus, error and password states.
 *
 * @example
 * <TextField label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
 * <TextField label="Password" value={password} onChangeText={setPassword} password />
 */
export function TextField({
  label,
  error,
  hint,
  prefix,
  password = false,
  editable = true,
  containerStyle,
  style,
  onFocus,
  onBlur,
  accessibilityLabel,
  ...rest
}: TextFieldProps) {
  const theme = getPalette(useColorScheme());
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const borderColor = error ? theme.danger : focused ? theme.primary : theme.border;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={[styles.label, { color: theme.text }]}>{label}</Text> : null}

      <View
        style={[
          styles.inputWrapper,
          { backgroundColor: theme.surface, borderColor },
          !editable && styles.disabled,
        ]}>
        {prefix ? <Text style={[styles.prefix, { color: theme.text }]}>{prefix}</Text> : null}

        <TextInput
          {...rest}
          editable={editable}
          placeholderTextColor={theme.textMuted}
          secureTextEntry={password && !revealed}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          accessibilityLabel={accessibilityLabel ?? label}
          style={[styles.input, { color: theme.text }, style]}
        />

        {password ? (
          <Pressable
            onPress={() => setRevealed((value) => !value)}
            hitSlop={spacing.sm}
            accessibilityRole="button"
            accessibilityLabel={revealed ? 'Hide password' : 'Show password'}
            style={styles.toggle}>
            <Text style={[styles.toggleText, { color: theme.primary }]}>
              {revealed ? 'Hide' : 'Show'}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <Text style={[styles.helper, { color: theme.danger }]}>{error}</Text>
      ) : hint ? (
        <Text style={[styles.helper, { color: theme.textMuted }]}>{hint}</Text>
      ) : null}
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderRadius: radius.md,
  },
  input: {
    flex: 1,
    fontSize: fontSize.md,
    paddingVertical: spacing.sm,
  },
  prefix: {
    fontSize: fontSize.md,
    marginRight: spacing.xs,
  },
  toggle: {
    paddingLeft: spacing.sm,
  },
  toggleText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
  helper: {
    fontSize: fontSize.xs,
  },
});
