
import type {
  AuthSessionUser,
} from "./types";

const SESSION_KEY =
  "koperasi_session";

/**
 * ============================================================
 * SAVE SESSION
 * ============================================================
 */

export const saveSessionToStorage = (
  user: AuthSessionUser,
): void => {
  if (
    typeof window === "undefined"
  ) {
    return;
  }

  try {
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        user,
      }),
    );
  } catch (error) {
    console.error(
      "Failed to save session:",
      error,
    );
  }
};

/**
 * ============================================================
 * GET SESSION
 * ============================================================
 */

export const getSessionFromStorage =
  (): AuthSessionUser | null => {
    if (
      typeof window === "undefined"
    ) {
      return null;
    }

    try {
      const raw =
        sessionStorage.getItem(
          SESSION_KEY,
        );

      if (!raw) {
        return null;
      }

      const parsed =
        JSON.parse(raw);

      /**
       * Support format:
       *
       * {
       *   user: {...}
       * }
       *
       * maupun langsung:
       *
       * {...}
       */

      return (
        parsed?.user ??
        parsed ??
        null
      );
    } catch (error) {
      console.error(
        "Failed to read session:",
        error,
      );

      return null;
    }
  };

/**
 * ============================================================
 * CLEAR SESSION
 * ============================================================
 */

export const clearSession =
  (): void => {
    if (
      typeof window === "undefined"
    ) {
      return;
    }

    sessionStorage.removeItem(
      SESSION_KEY,
    );
  };

