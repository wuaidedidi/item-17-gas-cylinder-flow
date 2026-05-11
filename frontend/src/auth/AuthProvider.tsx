import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { http } from '../api/http';

export interface CurrentUser {
  id: number;
  username: string;
  name: string;
  role: string;
  status: string;
  phone?: string | null;
  email?: string | null;
  remark?: string | null;
}

interface AuthContextValue {
  user: CurrentUser | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (payload: Record<string, unknown>) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setUser: (user: CurrentUser) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('gas_token'));
  const [user, setUserState] = useState<CurrentUser | null>(() => {
    const saved = localStorage.getItem('gas_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  const setUser = useCallback((nextUser: CurrentUser) => {
    setUserState(nextUser);
    localStorage.setItem('gas_user', JSON.stringify(nextUser));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('gas_token');
    localStorage.removeItem('gas_user');
    setToken(null);
    setUserState(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const data = await http.get<CurrentUser, CurrentUser>('/auth/me');
    setUser(data);
  }, [setUser]);

  useEffect(() => {
    const onExpired = () => logout();
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, [logout]);

  useEffect(() => {
    const init = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        await refreshUser();
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [token, refreshUser, logout]);

  const login = useCallback(
    async (username: string, password: string) => {
      const data = await http.post<any, { token: string; user: CurrentUser }>('/auth/login', {
        username,
        password,
      });
      localStorage.setItem('gas_token', data.token);
      localStorage.setItem('gas_user', JSON.stringify(data.user));
      setToken(data.token);
      setUserState(data.user);
    },
    [],
  );

  const register = useCallback(async (payload: Record<string, unknown>) => {
    await http.post('/auth/register', payload);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
      refreshUser,
      setUser,
    }),
    [user, token, loading, login, register, logout, refreshUser, setUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth 必须在 AuthProvider 内使用');
  }
  return context;
};

