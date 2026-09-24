import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

import { ApiError, apiRequest } from '@/api/client';

/** Minimal stand-in for the fields `apiRequest` reads off a Response. */
function response(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => (body === undefined ? '' : JSON.stringify(body)),
  } as unknown as Response;
}

const fetchMock = jest.fn<typeof fetch>();

beforeEach(() => {
  fetchMock.mockReset();
  globalThis.fetch = fetchMock as unknown as typeof fetch;
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('apiRequest success', () => {
  it('returns the parsed body', async () => {
    fetchMock.mockResolvedValue(response({ user: { id: 'u1' } }));

    await expect(apiRequest('/api/v1/users/me')).resolves.toEqual({ user: { id: 'u1' } });
  });

  it('returns null for an empty body rather than throwing', async () => {
    fetchMock.mockResolvedValue(response(undefined, 204));

    await expect(apiRequest('/api/v1/users/me', { method: 'DELETE' })).resolves.toBeNull();
  });
});

describe('apiRequest request shape', () => {
  it('sends the bearer token when one is given', async () => {
    fetchMock.mockResolvedValue(response({}));

    await apiRequest('/api/v1/users/me', { token: 'access-token' });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer access-token');
  });

  it('omits the authorization header when there is no token', async () => {
    fetchMock.mockResolvedValue(response({}));

    await apiRequest('/api/v1/health');

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>).Authorization).toBeUndefined();
  });

  it('only claims a JSON content type when there is a body', async () => {
    fetchMock.mockResolvedValue(response({}));

    await apiRequest('/api/v1/health');
    const [, getInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((getInit.headers as Record<string, string>)['Content-Type']).toBeUndefined();

    await apiRequest('/api/v1/users/me', { method: 'PATCH', body: { language: 'en' } });
    const [, patchInit] = fetchMock.mock.calls[1] as [string, RequestInit];
    expect((patchInit.headers as Record<string, string>)['Content-Type']).toBe('application/json');
    expect(patchInit.body).toBe(JSON.stringify({ language: 'en' }));
  });
});

describe('apiRequest failures', () => {
  it('throws an ApiError carrying the server message and status', async () => {
    fetchMock.mockResolvedValue(response({ message: 'This number is already registered.' }, 409));

    await expect(apiRequest('/api/v1/auth/register-resident')).rejects.toMatchObject({
      name: 'ApiError',
      status: 409,
      message: 'This number is already registered.',
    });
  });

  it('collects field errors from the errors shape', async () => {
    fetchMock.mockResolvedValue(
      response({ message: 'Some details need fixing.', errors: { phone: 'Taken.' } }, 400)
    );

    const failure = await apiRequest('/api/v1/auth/register-resident').catch((error) => error);

    expect(failure).toBeInstanceOf(ApiError);
    expect((failure as ApiError).fieldErrors).toEqual({ phone: 'Taken.' });
  });

  it('collects field errors from the snake_case shapes too', async () => {
    fetchMock.mockResolvedValue(response({ field_errors: { luku_meter: 'Too short.' } }, 400));
    const first = await apiRequest('/x').catch((error) => error);
    expect((first as ApiError).fieldErrors).toEqual({ luku_meter: 'Too short.' });

    fetchMock.mockResolvedValue(response({ validation_errors: { tax_id: 'Bad format.' } }, 400));
    const second = await apiRequest('/x').catch((error) => error);
    expect((second as ApiError).fieldErrors).toEqual({ tax_id: 'Bad format.' });
  });

  it('uses a plain fallback when the server explains nothing', async () => {
    fetchMock.mockResolvedValue(response({}, 400));

    await expect(apiRequest('/x')).rejects.toThrow('Request failed. Please try again.');
  });

  it('owns the blame for a server-side failure', async () => {
    fetchMock.mockResolvedValue(response({}, 500));

    await expect(apiRequest('/x')).rejects.toThrow(
      'Something went wrong on our side. Please try again.'
    );
  });

  it('reports an unreachable server as a status 0 ApiError', async () => {
    fetchMock.mockRejectedValue(new Error('network down'));

    const failure = await apiRequest('/x').catch((error) => error);

    expect(failure).toBeInstanceOf(ApiError);
    expect((failure as ApiError).status).toBe(0);
    expect((failure as ApiError).message).toMatch(/Could not reach Taka/);
  });
});
