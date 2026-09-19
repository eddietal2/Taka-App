import { StyleSheet, Text, View, useColorScheme } from 'react-native';

import type { LocationMapProps } from '@/components/location-map.types';
import { fontSize, getPalette, radius, spacing } from '@/constants/theme';
import { useI18n } from '@/features/i18n/context';

/**
 * Web counterpart of `location-map.tsx`.
 *
 * react-native-maps has no web build, so Metro serves this file to the browser
 * and the coordinates stand in for the map instead of breaking the bundle.
 */
export function LocationMap({ value, error, height = 220 }: LocationMapProps) {
  const theme = getPalette(useColorScheme());
  const { t } = useI18n();

  return (
    <View
      style={[
        styles.frame,
        {
          height,
          borderColor: error ? theme.danger : theme.border,
          backgroundColor: theme.surface,
        },
      ]}>
      <Text style={[styles.text, { color: value ? theme.text : theme.textMuted }]}>
        {value
          ? `${value.latitude.toFixed(6)}, ${value.longitude.toFixed(6)}`
          : t('signUp.location.mapUnavailable')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderWidth: 1,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  text: {
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
});
