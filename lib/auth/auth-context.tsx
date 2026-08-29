"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  buildSessionUser,
  clearSession,
  createJwtSession,
  decodeJwtSession,
  DEFAULT_PASSWORD,
  getSessionFromStorage,
  resolveUserByCredentials,
  roleLandingPage,
  saveSessionToStorage,
  type AuthSessionUser,
  type UserRole,
} from "./navigation";

interface AuthContextType {
  user: AuthSessionUser | null;
  token: string | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permissionName: string) => boolean;
  requiresPasswordChange: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthSessionUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    clearSession();
    router.push("/login");
  }, [router]);

  const hasPermission = useCallback(
    (permissionName: string) => {
      if (!user) return false;
      if (user.role === "administrator" || user.permissions.includes("*")) {
        return true;
      }
      return user.permissions.includes(permissionName);
    },
    [user],
  );

  useEffect(() => {
    const storedUser = getSessionFromStorage();
    const storedToken = typeof window !== "undefined" ? localStorage.getItem("koperasi_token") : null;

    if (storedToken) {
      const decodedSession = decodeJwtSession(storedToken);
      if (decodedSession) {
        const restoredUser: AuthSessionUser = {
          id: decodedSession.userId,
          name: decodedSession.name,
          email: decodedSession.email,
          role: decodedSession.role,
          groupId: decodedSession.groupId,
          groupName: decodedSession.groupName,
          permissions: decodedSession.permissions,
          mustChangePassword: false,
          updatedAt: new Date().toISOString(),
        };

        setUser(restoredUser);
        setToken(storedToken);
      } else {
        clearSession();
      }
    } else if (storedUser) {
      setUser(storedUser);
    }

    setLoading(false);
  }, []);

  const login = useCallback(
    async (identifier: string, password: string) => {
      setLoading(true);

      try {
        const normalizedIdentifier = identifier.trim();
        if (!normalizedIdentifier || !password.trim()) {
          throw new Error("Username dan password harus diisi.");
        }

        const matchedUser = resolveUserByCredentials(normalizedIdentifier, password);
        if (!matchedUser) {
          throw new Error("User atau password tidak cocok dengan data authorization.");
        }

        const role = matchedUser.role as UserRole;
        const sessionUser = buildSessionUser(role, normalizedIdentifier, password);
        const jwtToken = createJwtSession(sessionUser);

        setUser(sessionUser);
        setToken(jwtToken);
        saveSessionToStorage(sessionUser);

        if (typeof window !== "undefined") {
          localStorage.setItem("koperasi_token", jwtToken);
        }

        if (sessionUser.mustChangePassword) {
          router.push("/login?change-password=1");
          return;
        }

        router.push(roleLandingPage[sessionUser.role]);
      } catch (error: any) {
        console.error("Login error:", error);
        throw new Error(
          error?.message || "Login gagal, periksa kembali identitas dan password Anda.",
        );
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  const changePassword = useCallback(
    async (newPassword: string) => {
      if (!user) {
        throw new Error("Sesi login tidak tersedia.");
      }

      const trimmed = newPassword.trim();
      if (!trimmed || trimmed.length < 6) {
        throw new Error("Password baru minimal 6 karakter.");
      }

      const updatedUser: AuthSessionUser = {
        ...user,
        mustChangePassword: false,
        updatedAt: new Date().toISOString(),
      };

      setUser(updatedUser);
      saveSessionToStorage(updatedUser);
      router.push(roleLandingPage[updatedUser.role]);
    },
    [router, user],
  );

  const requiresPasswordChange = !!user?.mustChangePassword;

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      loading,
      login,
      changePassword,
      logout,
      hasPermission,
      requiresPasswordChange,
    }),
    [changePassword, hasPermission, loading, login, logout, requiresPasswordChange, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { DEFAULT_PASSWORD };
