import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fontSize, getPalette, radius, spacing } from '@/constants/theme';

export type ToastVariant = 'neutral' | 'success';

export type ToastProps = {
  message: string;
  /** Called once the toast has been shown for `duration`. */
  onDismiss: () => void;
  /** How long to show for, in milliseconds. */
  duration?: number;
  /** `success` paints the brand colour; `neutral` stays a plain surface. */
  variant?: ToastVariant;
};

/**
 * Brief confirmation banner pinned to the bottom of the screen, above the
 * content.
 *
 * The parent decides whether it is mounted; this only owns the timeout. Render it
 * as the last child of the page so it overlays the shell rather than being
 * painted over by it.
 */
export function Toast({ message, onDismiss, duration = 3000, variant = 'neutral' }: ToastProps) {
  const theme = getPalette(useColorScheme());
  const insets = useSafeAreaInsets();

  // Held in a ref so an inline `onDismiss` from the parent does not restart the
  // timer every time that parent re-renders.
  const dismiss = useRef(onDismiss);
  dismiss.current = onDismiss;

  useEffect(() => {
    const timer = setTimeout(() => dismiss.current(), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  const tone =
    variant === 'success'
      ? { backgroundColor: theme.primary, borderColor: theme.primary, text: theme.onPrimary }
      : { backgroundColor: theme.surface, borderColor: theme.border, text: theme.text };

  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[
        styles.container,
        {
          bottom: insets.bottom + spacing.md,
          backgroundColor: tone.backgroundColor,
          borderColor: tone.borderColor,
        },
      ]}>
      <Text style={[styles.message, { color: tone.text }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderRadius: radius.md,
    /**
     * A single line sits at roughly 36pt with the padding above; this makes it
     * about 20% taller, and matches the app's other 44pt touch targets. Wrapped
     * messages simply grow past it.
     */
    minHeight: 44,
    justifyContent: 'center',
    // Lifts it clear of whatever it is covering.
    elevation: 4,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  message: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
});
