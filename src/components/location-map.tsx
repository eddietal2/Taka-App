import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import MapView, { Marker, type Region } from 'react-native-maps';

import type { LocationMapProps } from '@/components/location-map.types';
import { fontSize, getPalette, radius, spacing } from '@/constants/theme';
import { useI18n } from '@/features/i18n/context';

/**
 * Every span is widened by this factor, which is a 15% zoom-out: a larger
 * delta covers more ground, so the frame sits further back.
 */
const ZOOM_OUT = 1.20;

/** Country-wide view shown before the user has captured anything. */
const TANZANIA_REGION: Region = {
  latitude: -6.369028,
  longitude: 34.888822,
  latitudeDelta: 9 * ZOOM_OUT,
  longitudeDelta: 9 * ZOOM_OUT,
};

/** Roughly a neighbourhood, so the dropped pin is clearly readable. */
const PINNED_DELTA = 0.008 * ZOOM_OUT;

const ANIMATION_MS = 900;

/** How far the camera may drift before we offer a way back to the pin. */
const DRIFT_FRACTION = 0.25;

function regionFor(point: { latitude: number; longitude: number }): Region {
  return {
    latitude: point.latitude,
    longitude: point.longitude,
    latitudeDelta: PINNED_DELTA,
    longitudeDelta: PINNED_DELTA,
  };
}

/**
 * Map of Tanzania that flies into the captured point once one exists.
 *
 * Panning and pinch/double-tap zooming stay enabled so the user can check what
 * is around them. If they drag the frame far enough that the pin is no longer
 * near the middle, a Recentre control appears to bring it back. Rotation and
 * tilt are left off, so the frame cannot end up sideways with no obvious way to
 * level it again.
 */
export function LocationMap({ value, error, height = 220 }: LocationMapProps) {
  const theme = getPalette(useColorScheme());
  const { t } = useI18n();
  const mapRef = useRef<MapView>(null);
  const [drifted, setDrifted] = useState(false);

  useEffect(() => {
    if (!value) return;
    mapRef.current?.animateToRegion(regionFor(value), ANIMATION_MS);
  }, [value]);

  const handleRegionChangeComplete = useCallback(
    (region: Region) => {
      if (!value) return;

      const latitudeOffset = Math.abs(region.latitude - value.latitude);
      const longitudeOffset = Math.abs(region.longitude - value.longitude);

      // Compare against the visible span so the threshold holds at any zoom.
      setDrifted(
        latitudeOffset > region.latitudeDelta * DRIFT_FRACTION ||
          longitudeOffset > region.longitudeDelta * DRIFT_FRACTION
      );
    },
    [value]
  );

  const recentre = () => {
    if (!value) return;
    mapRef.current?.animateToRegion(regionFor(value), ANIMATION_MS);
  };

  return (
    <View style={[styles.frame, { height, borderColor: error ? theme.danger : theme.border }]}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={value ? regionFor(value) : TANZANIA_REGION}
        onRegionChangeComplete={handleRegionChangeComplete}
        toolbarEnabled={false}
        accessibilityLabel={
          value
            ? t('signUp.location.mapCentered', {
                coordinates: `${value.latitude.toFixed(5)}, ${value.longitude.toFixed(5)}`,
              })
            : t('signUp.location.mapTanzania')
        }>
        {value ? <Marker coordinate={value} /> : null}
      </MapView>

      {value && drifted ? (
        <Pressable
          onPress={recentre}
          accessibilityRole="button"
          accessibilityLabel={t('signUp.location.recentreLabel')}
          style={({ pressed }) => [
            styles.recentre,
            { backgroundColor: theme.surface, borderColor: theme.border },
            pressed && styles.pressed,
          ]}>
          <Text style={[styles.recentreText, { color: theme.text }]}>
            {t('signUp.location.recentre')}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderWidth: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  recentre: {
    position: 'absolute',
    right: spacing.sm,
    bottom: spacing.sm,
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderRadius: radius.pill,
  },
  recentreText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.75,
  },
});
