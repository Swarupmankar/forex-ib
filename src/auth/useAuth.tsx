import {
  createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode,
} from 'react';
import { authService } from './auth.service';
import { authStorage } from './auth.storage';
import type { User } from './auth.types';

export interface Session {
  name: string;
  email: string;
  since: string;
}

interface AuthValue {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue>({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  signIn: async () => {},
  signUp: () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const userParam = params.get('user');
      if (userParam) {
        const parsed = JSON.parse(decodeURIComponent(userParam));
        authStorage.setUser(parsed);
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse user from URL params', e);
    }
    return authStorage.getUser();
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tokenParam = params.get('accessToken') || params.get('token');
      if (tokenParam) {
        const refreshTokenParam = params.get('refreshToken') || undefined;
        authStorage.setTokens(tokenParam, refreshTokenParam);
        return true;
      }
    } catch (e) {
      console.warn('Failed to parse tokens from URL params', e);
    }
    return Boolean(authStorage.getAccessToken() && authStorage.getUser());
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    // Clean SSO query parameters from URL bar
    const params = new URLSearchParams(window.location.search);
    if (params.has('accessToken') || params.has('token') || params.has('user')) {
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }

    authService.initialize().then(({ user: initUser, isAuthenticated: initAuth }) => {
      if (isMounted) {
        setUser(initUser);
        setIsAuthenticated(initAuth);
        setIsLoading(false);
      }
    });

    const handleUnauthorized = () => {
      if (isMounted) {
        setUser(null);
        setIsAuthenticated(false);
      }
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      isMounted = false;
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const session = useMemo<Session | null>(() => {
    if (!user) return null;
    const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;
    return {
      name,
      email: user.email,
      since: user.createdAt || new Date().toISOString(),
    };
  }, [user]);

  const signIn = useCallback(async (email: string, password: string) => {
    const res = await authService.login({ email, password });
    setUser(res.user);
    setIsAuthenticated(true);
  }, []);

  const signUp = useCallback((name: string, email: string) => {
    const dummyUser: User = {
      id: Date.now(),
      email,
      firstName: name.split(' ')[0] || name,
      lastName: name.split(' ').slice(1).join(' ') || '',
      createdAt: new Date().toISOString(),
    };
    authStorage.setUser(dummyUser);
    setUser(dummyUser);
    setIsAuthenticated(true);
  }, []);

  const signOut = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      user,
      session,
      isAuthenticated,
      isLoading,
      signIn,
      signUp,
      signOut,
    }),
    [user, session, isAuthenticated, isLoading, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
