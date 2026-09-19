import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';

import { fontSize, getPalette, radius, spacing } from '@/constants/theme';
import { useI18n } from '@/features/i18n/context';

export type StepHeaderProps = {
  title: string;
  subtitle?: string;
  /** 1-based position in the flow. */
  step: number;
  totalSteps: number;
  onBack?: () => void;
};

/** Back affordance, progress bar and titles shared by each sign-up step. */
export function StepHeader({ title, subtitle, step, totalSteps, onBack }: StepHeaderProps) {
  const theme = getPalette(useColorScheme());
  const { t } = useI18n();
  const progress = Math.min(Math.max(step / totalSteps, 0), 1);

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel={t('common.goBack')}
            hitSlop={spacing.sm}>
            <Text style={[styles.back, { color: theme.textMuted }]}>{t('common.back')}</Text>
          </Pressable>
        ) : (
          <View />
        )}
        <Text style={[styles.counter, { color: theme.textMuted }]}>
          {t('common.stepCounter', { step, total: totalSteps })}
        </Text>
      </View>

      <View style={[styles.track, { backgroundColor: theme.border }]}>
        <View
          style={[styles.fill, { backgroundColor: theme.primary, width: `${progress * 100}%` }]}
        />
      </View>

      <View style={styles.titles}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>{subtitle}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  back: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  counter: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    letterSpacing: 1,
  },
  track: {
    height: 4,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  titles: {
    gap: spacing.xs,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: fontSize.sm,
  },
});
