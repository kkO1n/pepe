let accessToken: string | null = null;
let refreshInFlight: Promise<string | null> | null = null;
let authFailureHandler: (() => void) | null = null;

export type ApiErrorPayload = {
  status: number;
  message: string;
};

export class ApiError extends Error {
  status: number;

  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name = 'ApiError';
    this.status = payload.status;
  }
}

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export function onAuthFailure(handler: (() => void) | null) {
  authFailureHandler = handler;
}

function resolveMessage(body: unknown, fallback: string): string {
  if (typeof body === 'string' && body.trim()) {
    return body;
  }

  if (typeof body === 'object' && body !== null) {
    const value = (body as Record<string, unknown>).message;
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
    if (Array.isArray(value) && value.length > 0) {
      return value
        .filter((item): item is string => typeof item === 'string')
        .join(', ');
    }
  }

  return fallback;
}

async function parseError(response: Response): Promise<ApiError> {
  let body: unknown = null;

  try {
    body = await response.json();
  } catch {
    // Ignore JSON parse errors and fallback to status text.
  }

  return new ApiError({
    status: response.status,
    message: resolveMessage(body, response.statusText || 'Request failed'),
  });
}

export async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const response = await fetch('/auth/refresh', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      setAccessToken(null);
      return null;
    }

    const body = (await response.json()) as { access_token?: string };
    const token = body.access_token ?? null;
    setAccessToken(token);
    return token;
  })();

  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}

type FetchOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>;
  auth?: boolean;
  retryOn401?: boolean;
};

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const {
    auth = true,
    retryOn401 = true,
    headers = {},
    body,
    ...rest
  } = options;

  const requestHeaders: Record<string, string> = {
    ...headers,
  };

  const isFormData =
    typeof FormData !== 'undefined' && body instanceof FormData;
  if (!isFormData && !requestHeaders['Content-Type']) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (auth && accessToken) {
    requestHeaders.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(path, {
    ...rest,
    headers: requestHeaders,
    body,
    credentials: 'include',
  });

  if (response.status === 401 && auth && retryOn401) {
    const refreshedToken = await refreshAccessToken();

    if (!refreshedToken) {
      authFailureHandler?.();
      throw new ApiError({ status: 401, message: 'Session expired' });
    }

    return apiFetch<T>(path, {
      ...options,
      retryOn401: false,
    });
  }

  if (!response.ok) {
    throw await parseError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
