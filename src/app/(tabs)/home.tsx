import { StyleSheet, Text, useColorScheme, View } from 'react-native';

import { fontSize, getPalette } from '@/constants/theme';
import { useI18n } from '@/features/i18n/context';

/**
 * Placeholder. The residential collection schedule, subscription status and the
 * assigned CBO truck's position land here.
 */
export default function HomeScreen() {
  const theme = getPalette(useColorScheme());
  const { t } = useI18n();

  return (
    <View style={[styles.page, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>{t('tabs.home')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
});
