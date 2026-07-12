import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "@tanstack/react-router";
import {
  clearToken,
  getToken,
  login as apiLogin,
  logout as apiLogout,
  me as apiMe,
  register as apiRegister,
  updateMe as apiUpdateMe,
  changePassword as apiChangePassword,
  type AuthUser,
  type ProfileUpdate,
} from "@/lib/auth";

type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<AuthUser>;
  register: (input: { email: string; password: string; full_name?: string }) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  updateProfile: (input: ProfileUpdate) => Promise<AuthUser>;
  changePassword: (current: string, next: string) => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadMe = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const u = await apiMe();
      setUser(u);
    } catch {
      clearToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  const login: AuthState["login"] = async (email, password, remember = false) => {
    await apiLogin(email, password, remember);
    const u = await apiMe();
    setUser(u);
    router.invalidate();
    return u;
  };

  const register: AuthState["register"] = async (input) => {
    await apiRegister(input);
    const u = await apiMe();
    setUser(u);
    router.invalidate();
    return u;
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
    router.invalidate();
  };

  const updateProfile: AuthState["updateProfile"] = async (input) => {
    const u = await apiUpdateMe(input);
    setUser(u);
    return u;
  };

  const changePassword: AuthState["changePassword"] = async (current, next) => {
    await apiChangePassword(current, next);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refresh: loadMe,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
