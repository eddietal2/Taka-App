/**
 * Minimal JSON API client.
 *
 * The base URL is read from `EXPO_PUBLIC_API_URL` so it can differ per
 * environment. Expo inlines `EXPO_PUBLIC_*` variables at build time, so set it
 * in your `.env` (or EAS environment) rather than reading it at runtime.
 */

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export class ApiError extends Error {
  readonly status: number;
  /** Field-level messages keyed by payload field name, when the API returns them. */
  readonly fieldErrors?: Record<string, string>;

  constructor(message: string, status: number, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string | null;
  signal?: AbortSignal;
};

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/** Returns the first non-empty string, unwrapping single-value arrays. */
function firstString(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const message = firstString(item);
      if (message) return message;
    }
  }
  return undefined;
}

function readMessage(data: unknown, status: number): string {
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    const direct =
      firstString(record.message) ?? firstString(record.error) ?? firstString(record.detail);
    if (direct) return direct;
  }
  return status >= 500
    ? 'Something went wrong on our side. Please try again.'
    : 'Request failed. Please try again.';
}

function readFieldErrors(data: unknown): Record<string, string> | undefined {
  if (!data || typeof data !== 'object') return undefined;

  const record = data as Record<string, unknown>;
  const source = record.errors ?? record.field_errors ?? record.validation_errors;
  if (!source || typeof source !== 'object') return undefined;

  const fieldErrors: Record<string, string> = {};
  for (const [field, value] of Object.entries(source as Record<string, unknown>)) {
    const message = firstString(value);
    if (message) fieldErrors[field] = message;
  }

  return Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token, signal } = options;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch {
    throw new ApiError('Could not reach Taka. Check your connection and try again.', 0);
  }

  const text = await response.text();
  const data = text ? parseJson(text) : null;

  if (!response.ok) {
    throw new ApiError(readMessage(data, response.status), response.status, readFieldErrors(data));
  }

  return data as T;
}
