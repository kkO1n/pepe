'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  apiFetch,
  getAccessToken,
  onAuthFailure,
  refreshAccessToken,
  setAccessToken,
} from '@/lib/api/client';
import type { AuthUser, LoginPayload, RegisterPayload } from '@/types/auth';

type AuthContextValue = {
  user: AuthUser | null;
  isBootstrapping: boolean;
  signIn: (payload: LoginPayload) => Promise<void>;
  signUp: (payload: RegisterPayload) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchProfile(): Promise<AuthUser> {
  return apiFetch<AuthUser>('/users/me', {
    method: 'GET',
  });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const profile = await fetchProfile();
    setUser(profile);
  }, []);

  const bootstrapSession = useCallback(async () => {
    setIsBootstrapping(true);

    try {
      const existingToken = getAccessToken();
      const token = existingToken ?? (await refreshAccessToken());

      if (!token) {
        clearSession();
        return;
      }

      await refreshProfile();
    } finally {
      setIsBootstrapping(false);
    }
  }, [clearSession, refreshProfile]);

  const signIn = useCallback(
    async (payload: LoginPayload) => {
      const response = await apiFetch<{ access_token: string }>('/auth/login', {
        method: 'POST',
        auth: false,
        body: JSON.stringify(payload),
      });

      setAccessToken(response.access_token);
      await refreshProfile();
    },
    [refreshProfile],
  );

  const signUp = useCallback(
    async (payload: RegisterPayload) => {
      const response = await apiFetch<{ access_token: string }>(
        '/auth/register',
        {
          method: 'POST',
          auth: false,
          body: JSON.stringify(payload),
        },
      );

      setAccessToken(response.access_token);
      await refreshProfile();
    },
    [refreshProfile],
  );

  const signOut = useCallback(async () => {
    try {
      await apiFetch<void>('/auth/logout', {
        method: 'POST',
        auth: false,
      });
    } finally {
      clearSession();
    }
  }, [clearSession]);

  useEffect(() => {
    onAuthFailure(clearSession);
    void bootstrapSession();

    return () => {
      onAuthFailure(null);
    };
  }, [bootstrapSession, clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isBootstrapping,
      signIn,
      signUp,
      signOut,
      refreshProfile,
    }),
    [user, isBootstrapping, signIn, signUp, signOut, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
