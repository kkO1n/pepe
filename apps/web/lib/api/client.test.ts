import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiFetch, onAuthFailure, setAccessToken } from './client';

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  setAccessToken(null);
  onAuthFailure(null);
  vi.restoreAllMocks();
});

describe('apiFetch', () => {
  it('refreshes once for concurrent 401 requests and retries successfully', async () => {
    setAccessToken('expired-token');

    let refreshCalls = 0;
    let usersCalls = 0;

    global.fetch = vi.fn((input: RequestInfo | URL) => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;

      if (url.includes('/auth/refresh')) {
        refreshCalls += 1;
        return Promise.resolve(
          new Response(JSON.stringify({ access_token: 'new-token' }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
          }),
        );
      }

      if (url.includes('/users/me')) {
        usersCalls += 1;

        if (usersCalls <= 2) {
          return Promise.resolve(new Response(null, { status: 401 }));
        }

        return Promise.resolve(
          new Response(JSON.stringify({ id: 1, login: 'ok' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        );
      }

      return Promise.resolve(new Response(null, { status: 404 }));
    }) as unknown as typeof fetch;

    const [a, b] = await Promise.all([
      apiFetch<{ id: number; login: string }>('/users/me', { method: 'GET' }),
      apiFetch<{ id: number; login: string }>('/users/me', { method: 'GET' }),
    ]);

    expect(a.login).toBe('ok');
    expect(b.id).toBe(1);
    expect(refreshCalls).toBe(1);
    expect(usersCalls).toBe(4);
  });

  it('handles successful empty response body', async () => {
    global.fetch = vi.fn(() => {
      return Promise.resolve(new Response(null, { status: 201 }));
    }) as unknown as typeof fetch;

    const result = await apiFetch<void>('/users/me/transfers', {
      method: 'POST',
      body: JSON.stringify({ recipientId: 2, amount: '10.00' }),
    });

    expect(result).toBeUndefined();
  });
});
