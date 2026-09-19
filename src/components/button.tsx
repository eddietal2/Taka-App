import type { ComponentProps, ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ColorValue,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { palette } from '@/constants/theme';

export const BUTTON_VARIANTS = ['solid', 'outline', 'ghost'] as const;
export type ButtonVariant = (typeof BUTTON_VARIANTS)[number];

export const BUTTON_SIZES = ['sm', 'md', 'lg'] as const;
export type ButtonSize = (typeof BUTTON_SIZES)[number];

/**
 * The brand's default button colour is `secondary` — most actions use it.
 * Pass `color` (for example `theme.primary`) to opt into a different accent.
 */
const DEFAULT_COLOR = palette.light.secondary;
const SOLID_LABEL_COLOR = palette.light.onSecondary;

type SizeTokens = {
  container: ViewStyle;
  label: TextStyle;
  gap: number;
  indicatorSize: number;
};

const SIZE_TOKENS: Record<ButtonSize, SizeTokens> = {
  sm: {
    container: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, minHeight: 32 },
    label: { fontSize: 14, lineHeight: 20 },
    gap: 6,
    indicatorSize: 16,
  },
  md: {
    container: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 10, minHeight: 44 },
    label: { fontSize: 16, lineHeight: 24 },
    gap: 8,
    indicatorSize: 20,
  },
  lg: {
    container: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, minHeight: 52 },
    label: { fontSize: 18, lineHeight: 26 },
    gap: 10,
    indicatorSize: 24,
  },
};

export type ButtonProps = Omit<
  ComponentProps<typeof Pressable>,
  'children' | 'style' | 'disabled'
> & {
  /** Text rendered inside the button. */
  label: string;
  /**
   * Visual treatment:
   * - `solid` – filled background
   * - `outline` – transparent background with a border
   * - `ghost` – no background and no border
   *
   * Defaults to `solid`.
   */
  variant?: ButtonVariant;
  /** Size preset. Defaults to `md`. */
  size?: ButtonSize;
  /**
   * Accent color used for the background (solid) or border/text (outline & ghost).
   * Defaults to the brand `secondary` color; pass `theme.primary` for primary actions.
   */
  color?: ColorValue;
  /** Explicit label and spinner color, overriding the color derived from `variant`. */
  textColor?: ColorValue;
  /** Optional element rendered before the label. */
  icon?: ReactNode;
  /** Shows a spinner and blocks interaction. */
  loading?: boolean;
  /** Disables the button and dims it. */
  disabled?: boolean;
  /** Stretches the button to fill the available width. */
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
};

/**
 * Themed, multi-variant button that works on iOS, Android and web.
 *
 * @example
 * <Button label="Save" onPress={save} />
 * <Button label="Cancel" variant="outline" color="#EF4444" />
 * <Button label="Learn more" variant="ghost" size="sm" />
 */
export function Button({
  label,
  onPress,
  variant = 'solid',
  size = 'md',
  color = DEFAULT_COLOR,
  textColor,
  icon,
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  labelStyle,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const tokens = SIZE_TOKENS[size];
  const resolvedLabelColor = textColor ?? (variant === 'solid' ? SOLID_LABEL_COLOR : color);

  return (
    <Pressable
      {...rest}
      disabled={isDisabled}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        tokens.container,
        fullWidth && styles.fullWidth,
        variant === 'solid' && { backgroundColor: color },
        variant === 'outline' && { borderWidth: 1, borderColor: color },
        variant === 'ghost' && styles.ghost,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}>
      <View style={[styles.content, { gap: tokens.gap }]}>
        {loading ? (
          <ActivityIndicator size={tokens.indicatorSize} color={resolvedLabelColor} />
        ) : (
          <>
            {icon}
            <Text
              numberOfLines={1}
              style={[styles.label, tokens.label, { color: resolvedLabelColor }, labelStyle]}>
              {label}
            </Text>
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.7,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '600',
    textAlign: 'center',
  },
});
