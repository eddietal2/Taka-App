import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';

import { Button, Screen } from '@/components';
import { fontSize, getPalette, spacing } from '@/constants/theme';
import { useI18n } from '@/features/i18n/context';

export default function SignUpSuccessScreen() {
  const router = useRouter();
  const theme = getPalette(useColorScheme());
  const { t } = useI18n();
  const params = useLocalSearchParams();
  const pendingApproval = params.pending === '1';

  const handleDone = () => {
    // TODO: route into the authenticated app group once it exists.
    router.replace('/login');
  };

  return (
    <Screen centered>
      <View style={styles.content}>
        <View style={[styles.badge, { backgroundColor: theme.surface }]}>
          <Text style={[styles.badgeMark, { color: theme.primary }]}>✓</Text>
        </View>

        <Text style={[styles.title, { color: theme.text }]}>
          {pendingApproval ? t('signUp.success.pendingTitle') : t('signUp.success.title')}
        </Text>

        <Text style={[styles.subtitle, { color: theme.textMuted }]}>
          {pendingApproval
            ? t('signUp.success.pendingSubtitle')
            : t('signUp.success.subtitle')}
        </Text>

        <Button label={t('common.done')} onPress={handleDone} fullWidth size="lg" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    gap: spacing.md,
  },
  badge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  badgeMark: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.md,
    textAlign: 'center',
  },
});
