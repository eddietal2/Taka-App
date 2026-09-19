import type { GeoPoint } from '@/api/schemas';

/**
 * Props shared by the platform-specific `LocationMap` implementations
 * (`location-map.tsx` for native, `location-map.web.tsx` for the browser).
 */
export type LocationMapProps = {
  /** Pinned point, or null while the user has not captured a location yet. */
  value: GeoPoint | null;
  /** Draws the frame in the danger colour when the step is blocked on this. */
  error?: boolean;
  /** Frame height; the map always fills the width of its parent. */
  height?: number;
};
