import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';

import { Screen } from '@/components';
import { fontSize, getPalette, radius, spacing } from '@/constants/theme';
import { useI18n } from '@/features/i18n/context';
import type { LegalSection } from '@/features/legal/content';

export type LegalPageProps = {
  title: string;
  /** Revision date rendered under the title. */
  updated: string;
  sections: readonly LegalSection[];
};

/**
 * Shared layout for the Terms of Service and Privacy Policy screens, so both
 * documents keep the same structure and the routes stay thin.
 */
export function LegalPage({ title, updated, sections }: LegalPageProps) {
  const router = useRouter();
  const theme = getPalette(useColorScheme());
  const { t } = useI18n();

  // Reachable from anywhere in the app, so there may be nothing to go back to.
  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/login');
  };

  return (
    <Screen>
      <Pressable
        onPress={goBack}
        accessibilityRole="button"
        accessibilityLabel={t('common.goBack')}
        hitSlop={spacing.sm}
        style={styles.back}>
        <Text style={[styles.backText, { color: theme.textMuted }]}>{t('common.back')}</Text>
      </Pressable>

      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.updated, { color: theme.textMuted }]}>
          {t('legal.updatedLabel', { date: updated })}
        </Text>
      </View>

      <View style={[styles.notice, { borderColor: theme.danger, backgroundColor: theme.surface }]}>
        <Text style={[styles.noticeText, { color: theme.danger }]}>
          {t('legal.placeholderNotice')}
        </Text>
      </View>

      {sections.map((section) => (
        <View key={section.heading} style={styles.section}>
          <Text style={[styles.heading, { color: theme.text }]}>{section.heading}</Text>
          <Text style={[styles.body, { color: theme.textMuted }]}>{section.body}</Text>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: {
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  header: {
    gap: spacing.xs,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  updated: {
    fontSize: fontSize.sm,
  },
  notice: {
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: radius.md,
  },
  noticeText: {
    fontSize: fontSize.xs,
  },
  section: {
    gap: spacing.xs,
  },
  heading: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  body: {
    fontSize: fontSize.sm,
    lineHeight: 21,
  },
});
