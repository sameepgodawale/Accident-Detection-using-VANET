import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authApi, AuthUser } from '@/lib/authApi';

const DEMO_CREDENTIALS = {
  email: 'admin@v2x.com',
  password: 'admin123',
  user: {
    id: 'demo-admin-001',
    email: 'admin@v2x.com',
    name: 'Admin User',
    role: 'admin',
  } as AuthUser,
  token: 'demo-token-admin',
};

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'));
  const [isLoading, setIsLoading] = useState(!!localStorage.getItem('auth_token'));

  // On mount, validate existing token
  useEffect(() => {
    if (!token) return;
    // If demo token, restore demo user
    if (token === DEMO_CREDENTIALS.token) {
      setUser(DEMO_CREDENTIALS.user);
      setIsLoading(false);
      return;
    }
    authApi.me()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('auth_token');
        setToken(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    // Check demo credentials first
    if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
      localStorage.setItem('auth_token', DEMO_CREDENTIALS.token);
      setToken(DEMO_CREDENTIALS.token);
      setUser(DEMO_CREDENTIALS.user);
      return;
    }

    // Try backend login
    const res = await authApi.login(email, password);
    localStorage.setItem('auth_token', res.token);
    setToken(res.token);
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    if (token !== DEMO_CREDENTIALS.token) {
      authApi.logout().catch(() => {});
    }
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
