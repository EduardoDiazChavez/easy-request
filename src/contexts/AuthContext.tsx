"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@/src/lib/types/auth";
import { TOKEN_STORAGE_KEY } from "@/src/lib/api/axios";
import { loginUser, registerUser, type RegisterPayload } from "@/src/lib/api/auth";

const USER_STORAGE_KEY = "easy-request-user";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (payload: RegisterPayload) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadUserFromStorage(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as User;
    if (data?.id && data?.email && data?.role) return data;
    return null;
  } catch {
    return null;
  }
}

function saveSession(user: User, token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

function getMessageFromError(error: unknown): string {
  if (error && typeof error === "object" && "response" in error) {
    const res = (error as { response?: { data?: { message?: string } } }).response;
    const msg = res?.data?.message;
    if (typeof msg === "string") return msg;
  }
  return "Error de conexión. Comprueba que el backend esté en marcha.";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = loadUserFromStorage();
    queueMicrotask(() => {
      setUser(stored);
      setIsLoading(false);
    });
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<{ ok: boolean; error?: string }> => {
      try {
        const { user: userData, token } = await loginUser(email, password);
        saveSession(userData, token);
        setUser(userData);
        return { ok: true };
      } catch (error) {
        return { ok: false, error: getMessageFromError(error) };
      }
    },
    []
  );

  const register = useCallback(
    async (payload: RegisterPayload): Promise<{ ok: boolean; error?: string }> => {
      try {
        const { user: userData, token } = await registerUser(payload);
        saveSession(userData, token);
        setUser(userData);
        return { ok: true };
      } catch (error) {
        return { ok: false, error: getMessageFromError(error) };
      }
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    clearSession();
  }, []);

  const value: AuthContextValue = {
    user,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return ctx;
}
