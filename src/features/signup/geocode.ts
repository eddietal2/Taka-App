import * as Location from 'expo-location';

import type { GeoPoint } from '@/api/schemas';

function firstNonEmpty(...values: (string | null | undefined)[]): string | null {
  for (const value of values) {
    const text = value?.trim();
    if (text) return text;
  }
  return null;
}

/**
 * Best-effort ward (kata) for a GPS point, so the details step can pre-fill it
 * instead of making the resident retype what we already know.
 *
 * Tanzania has no single geocoder field for a ward, so the first populated
 * district/subregion/city is used. Geocoding is unavailable on web and can fail
 * offline; a null result simply leaves the field for the user to fill in.
 *
 * Only the ward is resolved, deliberately. The reverse geocoder's street is
 * frequently wrong — an unnamed road, a highway, or the ward's own name echoed
 * back — so the street is the resident's to type.
 */
export async function resolveWard(point: GeoPoint): Promise<string | null> {
  try {
    const results = await Location.reverseGeocodeAsync({
      latitude: point.latitude,
      longitude: point.longitude,
    });
    const [nearest] = results;
    if (!nearest) return null;

    return firstNonEmpty(nearest.district, nearest.subregion, nearest.city);
  } catch {
    // No geocoder (web) or offline: the coordinates are still usable.
    return null;
  }
}
