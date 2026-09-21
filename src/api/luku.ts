import { apiRequest } from '@/api/client';
import type { GeoPoint } from '@/api/schemas';

/** LUKU endpoints served by taka-server-resident under `/api/v1`. */
const LUKU_LOOKUP_PATH = '/api/v1/luku/lookup';
const LUKU_LOCATION_PATH = '/api/v1/luku/location';

/**
 * How a meter enquiry ended. Mirrors the server's `BillLookupStatus`:
 * `unconfirmed` means the utility did not answer, which nTZS documents as a
 * normal outcome and must never be shown to a resident as "inactive".
 */
export type LukuLookupStatus = 'active' | 'rejected' | 'unconfirmed';

/**
 * What the database already knew about a meter.
 *
 * - `claimed` — a live account holds it, so it cannot be registered again.
 * - `mapped` — it is on file with an address but no account claims it: what is
 *   left behind when a profile moves to a new meter or an account is deleted.
 * - `new` — the database has never seen it.
 */
export type LukuClaim = 'new' | 'claimed' | 'mapped';

/** An address already pinned to a meter. */
export type SavedLukuAddress = {
  location: GeoPoint;
  ward_kata: string | null;
  street_mtaa: string | null;
};

export type LukuLookupResponse = {
  luku_meter: string;
  utility_code?: string;
  status: LukuLookupStatus;
  /** `true` when the meter is live, `false` when refused, `null` when unknown. */
  active: boolean | null;
  /** Registered owner, or null when no confirmation was available. */
  owner_name: string | null;
  /** What the database knew about this meter before the enquiry. */
  state: LukuClaim;
  /** Address on file, present exactly when `state` is `mapped`. */
  saved_address: SavedLukuAddress | null;
  checked_at?: string;
};

export type LukuLocationResponse = {
  luku_meter: string;
  owner_name: string | null;
  ward_kata: string | null;
  street_mtaa: string | null;
  location: GeoPoint | null;
  updated_at: string;
};

/**
 * Resolves a meter's registered owner.
 *
 * The phone number from the sign-up flow is sent in the body so the server can
 * assert it against the verification token — the enquiry is gated on that token
 * and must never be made per keystroke, as the utility call can take ~25s.
 */
export function lookupLuku(
  body: { phone: string; luku_meter: string },
  token?: string | null
) {
  return apiRequest<LukuLookupResponse>(LUKU_LOOKUP_PATH, {
    method: 'POST',
    body,
    token,
  });
}

/**
 * Pins the captured GPS point to the meter's reference number, so collections
 * are routed to the address on file.
 *
 * Coordinates only: the ward and street are attached at registration, from the
 * words the resident typed. A reverse-geocoded street is often the ward's name
 * repeated, so it must not be written here.
 */
export function attachLukuLocation(
  body: {
    phone: string;
    luku_meter: string;
    location: GeoPoint;
  },
  token?: string | null
) {
  return apiRequest<LukuLocationResponse>(LUKU_LOCATION_PATH, {
    method: 'POST',
    body,
    token,
  });
}
