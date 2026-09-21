import { StyleSheet, Text, useColorScheme, View } from 'react-native';

import { fontSize, getPalette } from '@/constants/theme';
import { useI18n } from '@/features/i18n/context';

/**
 * Placeholder. The recycling wallet lives here: the TZS balance, the drop-off
 * QR code and the ledger of rebates and cashouts.
 */
export default function RecycleScreen() {
  const theme = getPalette(useColorScheme());
  const { t } = useI18n();

  return (
    <View style={[styles.page, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>{t('tabs.recycle')}</Text>
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
