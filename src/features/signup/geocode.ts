import * as Location from 'expo-location';

import type { GeoPoint } from '@/api/schemas';

export type WardStreet = {
  /** Ward (kata), when the geocoder resolved one. */
  wardKata: string | null;
  /** Street (mtaa), when the geocoder resolved one. */
  streetMtaa: string | null;
};

function firstNonEmpty(...values: (string | null | undefined)[]): string | null {
  for (const value of values) {
    const text = value?.trim();
    if (text) return text;
  }
  return null;
}

/**
 * Best-effort ward (kata) and street (mtaa) for a GPS point, so the details step
 * can pre-fill them instead of making the user retype what we already know.
 *
 * Expo reports the administrative layers separately, and Tanzania has no single
 * field for a ward, so the first populated district/subregion/city is used and
 * the street comes from the street/name fields. Geocoding is unavailable on web
 * and can fail offline; a null result simply leaves the fields for the user.
 */
export async function resolveWardStreet(point: GeoPoint): Promise<WardStreet | null> {
  try {
    const results = await Location.reverseGeocodeAsync({
      latitude: point.latitude,
      longitude: point.longitude,
    });
    const [nearest] = results;
    if (!nearest) return null;

    return {
      wardKata: firstNonEmpty(nearest.district, nearest.subregion, nearest.city),
      streetMtaa: firstNonEmpty(nearest.street, nearest.name),
    };
  } catch {
    // No geocoder (web) or offline: the coordinates are still usable.
    return null;
  }
}
