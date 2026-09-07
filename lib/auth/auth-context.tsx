
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
  roleLandingPage,
} from "./navigation";

import {
  type UserRole,
} from "./types";

import {
  clearSession,
  getSessionFromStorage,
  saveSessionToStorage,
} from "./session";

import type {
  ApiMenuNode,
  AuthSessionUser,
} from "./types";

import { authApi } from "./authapi";

/**
 * ============================================================
 * AUTH CONTEXT TYPE
 * ============================================================
 */

interface AuthContextType {
  user: AuthSessionUser | null;

  token: string | null;

  refreshToken: string | null;

  loading: boolean;

  login: (
    identifier: string,
    password: string,
    allowedRoles?: UserRole[],
  ) => Promise<void>;

  refreshSession: () => Promise<void>;

  changePassword: (
    newPassword: string,
  ) => Promise<void>;

  logout: () => Promise<void>;

  hasPermission: (
    permissionName: string,
  ) => boolean;

  requiresPasswordChange: boolean;
}

/**
 * ============================================================
 * CONTEXT
 * ============================================================
 */

const AuthContext =
  createContext<AuthContextType | null>(
    null,
  );

/**
 * ============================================================
 * GROUP ID -> ROLE
 * ============================================================
 */

const groupIdToRole = (
  groupId?: number | null,
): UserRole => {
  switch (Number(groupId)) {
    case 1:
      return "administrator";

    case 2:
      return "admin-koperasi";

    case 3:
      return "pengurus-koperasi";

    case 4:
      return "anggota";

    default:
      return "anggota";
  }
};

/**
 * ============================================================
 * NORMALIZE PERMISSIONS
 * ============================================================
 */

const normalizePermissions = (
  permissions: unknown,
): string[] => {
  if (
    !Array.isArray(permissions)
  ) {
    return [];
  }

  return permissions
    .map((permission) => {
      if (
        typeof permission ===
        "string"
      ) {
        return permission;
      }

      if (
        typeof permission ===
          "object" &&
        permission !== null
      ) {
        const value =
          permission as Record<
            string,
            unknown
          >;

        return String(
          value.name ??
            value.permissionName ??
            value.code ??
            "",
        );
      }

      return "";
    })
    .filter(Boolean);
};

/**
 * ============================================================
 * NORMALIZE USER
 * ============================================================
 */

const normalizeSessionUser = (
  payload: any,
): AuthSessionUser => {
  const groupId = Number(
    payload?.groupId ??
      payload?.group_id ??
      4,
  );

  const role =
    groupIdToRole(groupId);

  const menus: ApiMenuNode[] =
    Array.isArray(payload?.menus)
      ? payload.menus
      : [];

  const permissions =
    normalizePermissions(
      payload?.permissions,
    );

  return {
    id: String(
      payload?.userlogin ??
        payload?.userLogin ??
        payload?.id ??
        payload?.sub ??
        "",
    ),

    name:
      payload?.username ??
      payload?.userName ??
      payload?.name ??
      payload?.nama ??
      "User",

    email:
      payload?.email ?? "",

    role,

    groupId,

    groupName:
      payload?.groupName ??
      payload?.group_name ??
      "User",

    permissions,

    mustChangePassword:
      Boolean(
        payload?.mustChangePassword ??
          payload?.must_change_password ??
          false,
      ),

    menus,

    updatedAt:
      new Date().toISOString(),
  };
};

/**
 * ============================================================
 * EXTRACT USER FROM /ME
 * ============================================================
 */

const extractSessionUser = (
  response: any,
): AuthSessionUser => {
  const profile =
    response?.user ??
    response?.data?.user ??
    response;

  const menus =
    Array.isArray(
      response?.menus,
    )
      ? response.menus
      : Array.isArray(
          response?.data?.menus,
        )
        ? response.data.menus
        : Array.isArray(
            profile?.menus,
          )
          ? profile.menus
          : [];

  return normalizeSessionUser({
    ...profile,
    menus,
  });
};

/**
 * ============================================================
 * AUTH PROVIDER
 * ============================================================
 */

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router =
    useRouter();

  const [user, setUser] =
    useState<AuthSessionUser | null>(
      null,
    );

  const [token, setToken] =
    useState<string | null>(
      null,
    );

  const [
    refreshToken,
    setRefreshToken,
  ] = useState<string | null>(
    null,
  );

  const [loading, setLoading] =
    useState(true);

  /**
   * ==========================================================
   * APPLY SESSION
   * ==========================================================
   */

  const applySession =
    useCallback(
      (
        sessionUser: AuthSessionUser,
        accessToken: string,
        refreshTokenValue: string,
      ) => {
        setUser(sessionUser);

        setToken(accessToken);

        setRefreshToken(
          refreshTokenValue,
        );

        saveSessionToStorage(
          sessionUser,
        );

        if (
          typeof window !==
          "undefined"
        ) {
          localStorage.setItem(
            "koperasi_token",
            accessToken,
          );

          localStorage.setItem(
            "koperasi_refresh_token",
            refreshTokenValue,
          );
        }
      },
      [],
    );

  /**
   * ==========================================================
   * CLEAR SESSION
   * ==========================================================
   */

  const clearLocalSession =
    useCallback(() => {
      setUser(null);

      setToken(null);

      setRefreshToken(null);

      clearSession();

      if (
        typeof window !==
        "undefined"
      ) {
        localStorage.removeItem(
          "koperasi_token",
        );

        localStorage.removeItem(
          "koperasi_refresh_token",
        );
      }
    }, []);

  /**
   * ==========================================================
   * LOGOUT
   * ==========================================================
   */

  const logout =
    useCallback(async () => {
      const currentToken =
        token;

      try {
        if (currentToken) {
          await authApi.logout(
            currentToken,
          );
        }
      } catch (error) {
        console.error(
          "Logout API error:",
          error,
        );
      } finally {
        clearLocalSession();

        router.push("/login");
      }
    }, [
      clearLocalSession,
      router,
      token,
    ]);

  /**
   * ==========================================================
   * PERMISSION
   * ==========================================================
   */

  const hasPermission =
    useCallback(
      (
        permissionName: string,
      ) => {
        if (!user) {
          return false;
        }

        /**
         * Administrator:
         * full access.
         */

        if (
          user.role ===
            "administrator" ||
          user.permissions.includes(
            "*",
          )
        ) {
          return true;
        }

        return user.permissions.includes(
          permissionName,
        );
      },
      [user],
    );

  /**
   * ==========================================================
   * RESTORE SESSION
   * ==========================================================
   */

  useEffect(() => {
    let mounted = true;

    const restoreSession =
      async () => {
        try {
          const storedUser =
            getSessionFromStorage();

          const storedToken =
            typeof window !==
            "undefined"
              ? localStorage.getItem(
                  "koperasi_token",
                )
              : null;

          const storedRefreshToken =
            typeof window !==
            "undefined"
              ? localStorage.getItem(
                  "koperasi_refresh_token",
                )
              : null;

          /**
           * Tidak ada token.
           */

          if (!storedToken) {
            if (
              mounted &&
              storedUser
            ) {
              setUser(
                storedUser,
              );
            }

            return;
          }

          /**
           * Validate token
           * ke backend.
           */

          const response =
            await authApi.me(
              storedToken,
            );

          const sessionUser =
            extractSessionUser(
              response,
            );

          if (!mounted) {
            return;
          }

          setUser(sessionUser);

          setToken(
            storedToken,
          );

          setRefreshToken(
            storedRefreshToken,
          );

          /**
           * Update menu terbaru
           * dari DB.
           */

          saveSessionToStorage(
            sessionUser,
          );
        } catch (error) {
          console.error(
            "Restore session error:",
            error,
          );

          if (mounted) {
            clearLocalSession();
          }
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      };

    void restoreSession();

    return () => {
      mounted = false;
    };
  }, [clearLocalSession]);

  /**
   * ==========================================================
   * REFRESH SESSION
   * ==========================================================
   */

  const refreshSession =
    useCallback(async () => {
      if (!refreshToken) {
        throw new Error(
          "Sesi refresh tidak tersedia.",
        );
      }

      try {
        const response =
          await authApi.refreshToken(
            refreshToken,
          );

        const nextAccessToken =
          response?.access_token ??
          response?.accessToken;

        const nextRefreshToken =
          response?.refresh_token ??
          response?.refreshToken ??
          refreshToken;

        if (!nextAccessToken) {
          throw new Error(
            "Refresh token gagal menghasilkan access token.",
          );
        }

        /**
         * Ambil user + menu terbaru.
         */

        const profileResponse =
          await authApi.me(
            nextAccessToken,
          );

        const sessionUser =
          extractSessionUser(
            profileResponse,
          );

        applySession(
          sessionUser,
          nextAccessToken,
          nextRefreshToken,
        );
      } catch (error: any) {
        console.error(
          "Refresh session error:",
          error,
        );

        clearLocalSession();

        throw new Error(
          error?.response?.data
            ?.message ??
            error?.message ??
            "Sesi Anda telah berakhir, silakan login kembali.",
        );
      }
    }, [
      applySession,
      clearLocalSession,
      refreshToken,
    ]);

  /**
   * ==========================================================
   * LOGIN
   * ==========================================================
   */

  const login =
    useCallback(
      async (
        identifier: string,
        password: string,
        allowedRoles?: UserRole[],
      ) => {
        setLoading(true);

        try {
          const normalizedIdentifier =
            identifier.trim();

          if (
            !normalizedIdentifier ||
            !password.trim()
          ) {
            throw new Error(
              "Username dan password harus diisi.",
            );
          }

          /**
           * STEP 1
           * Login.
           */

          const response =
            await authApi.login(
              normalizedIdentifier,
              password,
            );

          const accessToken =
            response?.access_token ??
            response?.accessToken;

          const refreshTokenValue =
            response?.refresh_token ??
            response?.refreshToken;

          if (
            !accessToken ||
            !refreshTokenValue
          ) {
            throw new Error(
              "Login backend tidak mengembalikan token sesi.",
            );
          }

          /**
           * STEP 2
           * Get user + menu.
           */

          const profileResponse =
            await authApi.me(
              accessToken,
            );

          const sessionUser =
            extractSessionUser(
              profileResponse,
            );

          /**
           * STEP 3
           * Role validation.
           */

          if (
            allowedRoles &&
            !allowedRoles.includes(
              sessionUser.role,
            )
          ) {
            throw new Error(
              allowedRoles.includes(
                "anggota",
              )
                ? "Halaman ini khusus login anggota. Gunakan /admin untuk akun pengurus."
                : "Halaman ini khusus login admin dan pengurus. Gunakan /login untuk akun anggota.",
            );
          }

          /**
           * STEP 4
           * Save session.
           */

          applySession(
            sessionUser,
            accessToken,
            refreshTokenValue,
          );

          /**
           * STEP 5
           * Force change password.
           */

          if (
            sessionUser.mustChangePassword
          ) {
            router.push(
              "/login?change-password=1",
            );

            return;
          }

          /**
           * STEP 6
           * Landing page.
           */

          const landingPage =
            roleLandingPage[
              sessionUser.role
            ] ?? "/dashboard";

          router.push(
            landingPage,
          );
        } catch (error: any) {
          console.error(
            "Login error:",
            error,
          );

          throw new Error(
            error?.response?.data
              ?.message ??
              error?.message ??
              "Login gagal, periksa kembali identitas dan password Anda.",
          );
        } finally {
          setLoading(false);
        }
      },
      [applySession, router],
    );

  /**
   * ==========================================================
   * CHANGE PASSWORD
   * ==========================================================
   *
   * NOTE:
   * Ini masih local-only.
   *
   * Jika backend sudah memiliki API change password,
   * ganti bagian ini dengan authApi.changePassword().
   */

  const changePassword =
    useCallback(
      async (
        newPassword: string,
      ) => {
        if (!user) {
          throw new Error(
            "Sesi login tidak tersedia.",
          );
        }

        const trimmed =
          newPassword.trim();

        if (
          !trimmed ||
          trimmed.length < 6
        ) {
          throw new Error(
            "Password baru minimal 6 karakter.",
          );
        }

        const updatedUser: AuthSessionUser =
          {
            ...user,

            mustChangePassword:
              false,

            updatedAt:
              new Date().toISOString(),
          };

        setUser(
          updatedUser,
        );

        saveSessionToStorage(
          updatedUser,
        );

        const landingPage =
          roleLandingPage[
            updatedUser.role
          ] ?? "/dashboard";

        router.push(
          landingPage,
        );
      },
      [router, user],
    );

  /**
   * ==========================================================
   * PASSWORD CHANGE FLAG
   * ==========================================================
   */

  const requiresPasswordChange =
    Boolean(
      user?.mustChangePassword,
    );

  /**
   * ==========================================================
   * CONTEXT VALUE
   * ==========================================================
   */

  const value =
    useMemo<AuthContextType>(
      () => ({
        user,

        token,

        refreshToken,

        loading,

        login,

        refreshSession,

        changePassword,

        logout,

        hasPermission,

        requiresPasswordChange,
      }),
      [
        user,
        token,
        refreshToken,
        loading,
        login,
        refreshSession,
        changePassword,
        logout,
        hasPermission,
        requiresPasswordChange,
      ],
    );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * ============================================================
 * USE AUTH
 * ============================================================
 */

export const useAuth = () => {
  const context =
    useContext(
      AuthContext,
    );

  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider",
    );
  }

  return context;
};