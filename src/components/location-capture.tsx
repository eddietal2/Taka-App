import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';

import type { GeoPoint } from '@/api/schemas';
import { fontSize, getPalette, radius, spacing } from '@/constants/theme';
import { useI18n } from '@/features/i18n/context';

export type LocationCaptureProps = {
  value: GeoPoint | null;
  onChange: (value: GeoPoint | null) => void;
  error?: string;
};

/**
 * Builds one short line from the parts Expo returns, e.g.
 * "Ihumwa, Dodoma, Tanzania". Repeated values are dropped so the line never
 * reads "Mlimani, Mlimani", and the list is capped so it stays readable.
 */
function formatPlace(address: Location.LocationGeocodedAddress): string {
  const parts = [
    address.name,
    address.street,
    address.district,
    address.city,
    address.region,
    address.country,
  ];
  const seen = new Set<string>();
  const unique: string[] = [];

  for (const part of parts) {
    const text = part?.trim();
    if (!text || seen.has(text.toLowerCase())) continue;
    seen.add(text.toLowerCase());
    unique.push(text);
  }

  return unique.slice(0, 3).join(', ');
}

/** Requests foreground location permission and captures a GPS point. */
export function LocationCapture({ value, onChange, error }: LocationCaptureProps) {
  const theme = getPalette(useColorScheme());
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [place, setPlace] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);

  const latitude = value?.latitude;
  const longitude = value?.longitude;

  // Raw coordinates mean little to most people, so the point is looked up and
  // the nearest place name is shown alongside them.
  useEffect(() => {
    if (latitude === undefined || longitude === undefined) {
      setPlace(null);
      setResolving(false);
      return;
    }

    let cancelled = false;
    setResolving(true);

    // Wrapped in an async function so a platform without a geocoder (web) throws
    // into the catch rather than out of the effect body.
    const lookup = async () => {
      try {
        const results = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (cancelled) return;
        const [nearest] = results;
        setPlace(nearest ? formatPlace(nearest) : null);
      } catch {
        // Offline, permission pulled, or no geocoder: coordinates still show.
        if (!cancelled) setPlace(null);
      } finally {
        if (!cancelled) setResolving(false);
      }
    };

    void lookup();

    return () => {
      cancelled = true;
    };
  }, [latitude, longitude]);

  const capture = async () => {
    setLocalError(null);
    setBusy(true);

    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        setLocalError(t('signUp.location.permission'));
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
      setLocalError(t('signUp.location.failed'));
    } finally {
      setBusy(false);
    }
  };

  const message = localError ?? error;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.text }]}>{t('signUp.location.captureLabel')}</Text>

      <View
        style={[
          styles.card,
          {
            borderColor: message ? theme.danger : theme.border,
            backgroundColor: theme.surface,
          },
        ]}>
        {value ? (
          <View style={styles.details}>
            {resolving ? (
              <Text style={[styles.place, { color: theme.textMuted }]}>
                {t('signUp.location.resolving')}
              </Text>
            ) : place ? (
              <Text style={[styles.place, { color: theme.text }]}>{place}</Text>
            ) : null}

            <Text style={[styles.coords, { color: theme.textMuted }]}>
              {`${value.latitude.toFixed(6)}, ${value.longitude.toFixed(6)}`}
            </Text>
          </View>
        ) : (
          <Text style={[styles.value, { color: theme.textMuted }]}>
            {t('signUp.location.empty')}
          </Text>
        )}

        <Pressable
          onPress={capture}
          disabled={busy}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.action,
            { backgroundColor: theme.primary },
            pressed && styles.pressed,
            busy && styles.disabled,
          ]}>
          {busy ? (
            <ActivityIndicator color={theme.onPrimary} />
          ) : (
            <Text style={[styles.actionText, { color: theme.onPrimary }]}>
              {value ? t('signUp.location.update') : t('signUp.location.capture')}
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
  details: {
    gap: spacing.xs,
  },
  place: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  coords: {
    fontSize: fontSize.xs,
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
