import * as Location from 'expo-location';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';

import type { GeoPoint } from '@/api/schemas';
import { fontSize, getPalette, radius, spacing } from '@/constants/theme';

export type LocationCaptureProps = {
  value: GeoPoint | null;
  onChange: (value: GeoPoint | null) => void;
  error?: string;
};

/** Requests foreground location permission and captures a GPS point. */
export function LocationCapture({ value, onChange, error }: LocationCaptureProps) {
  const theme = getPalette(useColorScheme());
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const capture = async () => {
    setLocalError(null);
    setBusy(true);

    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        setLocalError('Location access is required. Enable it in Settings and try again.');
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      onChange({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    } catch {
      setLocalError('Could not get your location. Make sure GPS is on and try again.');
    } finally {
      setBusy(false);
    }
  };

  const message = localError ?? error;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.text }]}>Location</Text>

      <View
        style={[
          styles.card,
          {
            borderColor: message ? theme.danger : theme.border,
            backgroundColor: theme.surface,
          },
        ]}>
        <Text style={[styles.value, { color: value ? theme.text : theme.textMuted }]}>
          {value
            ? `${value.latitude.toFixed(6)}, ${value.longitude.toFixed(6)}`
            : 'We use your location to route collections to your address.'}
        </Text>

        <Pressable
          onPress={capture}
          disabled={busy}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.action,
            { backgroundColor: theme.secondary },
            pressed && styles.pressed,
            busy && styles.disabled,
          ]}>
          {busy ? (
            <ActivityIndicator color={theme.onSecondary} />
          ) : (
            <Text style={[styles.actionText, { color: theme.onSecondary }]}>
              {value ? 'Update location' : 'Use my current location'}
            </Text>
          )}
        </Pressable>
      </View>

      {message ? <Text style={[styles.helper, { color: theme.danger }]}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  card: {
    gap: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: radius.md,
  },
  value: {
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  action: {
    minHeight: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  actionText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  helper: {
    fontSize: fontSize.xs,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.6,
  },
});
