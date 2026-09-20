import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  useColorScheme,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getPalette, spacing } from '@/constants/theme';

export type ScreenProps = {
  children: ReactNode;
  /** Vertically centre the content when it is shorter than the viewport. */
  centered?: boolean;
  /** Extra styles merged into the scrollable content container. */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /**
   * Pinned below the scrolling content, at the bottom of the page, so a primary
   * action stays put instead of trailing the last form field.
   */
  footer?: ReactNode;
};

/**
 * Page shell that handles safe areas, keyboard avoidance and scrolling.
 * Use it as the outermost element of a screen.
 */
export function Screen({ children, centered = false, contentContainerStyle, footer }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const theme = getPalette(useColorScheme());

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.flex}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.xl },
          contentContainerStyle,
        ]}>
        <View style={[styles.body, centered && styles.centered]}>{children}</View>
        {footer}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  /** Grows to fill the page so a `footer` is pushed to the bottom. */
  body: {
    flexGrow: 1,
    gap: spacing.lg,
  },
  centered: {
    justifyContent: 'center',
  },
});
