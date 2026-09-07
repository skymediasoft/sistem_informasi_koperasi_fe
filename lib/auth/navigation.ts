import {
  getMenuTypeIcon,
  normalizeMenuRoute,
} from "@/lib/auth/menu-tils";

import type {
  ApiMenuNode,
  UserRole,
} from "@/lib/auth/types";

export { getSessionFromStorage } from "@/lib/auth/session";

export const secondaryMenu: MenuItem[] = [];

/**
 * ============================================================
 * MENU ITEM
 * ============================================================
 */

export interface MenuItem {
  label: string;
  href: string;
  icon: any;

  group?: string;

  description?: string;

  children?: Array<{
    label: string;
    href: string;
    description?: string;
  }>;
}

/**
 * ============================================================
 * ROLE LANDING PAGE
 * ============================================================
 */

export const roleLandingPage: Record<UserRole, string> = {
  administrator: "/dashboard",
  "admin-koperasi": "/dashboard",
  "pengurus-koperasi": "/dashboard",
  anggota: "/dashboard",
};

/**
 * ============================================================
 * FALLBACK MENU
 * ============================================================
 *
 * API / DB tetap menjadi sumber utama.
 *
 * Tidak ada hardcoded menu role.
 */

export const roleMenus: Record<UserRole, MenuItem[]> = {
  administrator: [],
  "admin-koperasi": [],
  "pengurus-koperasi": [],
  anggota: [],
};

/**
 * ============================================================
 * CHECK ACCESS
 * ============================================================
 */

const isMenuAllowed = (
  menu: ApiMenuNode,
): boolean => {
  /**
   * Backend bisa menggunakan:
   *
   * accessValue = 1
   *
   * atau:
   *
   * accessStatus = "allowed"
   */

  return (
    menu.accessValue === 1 ||
    menu.accessStatus?.toLowerCase() === "allowed"
  );
};

/**
 * ============================================================
 * MENU KEY
 * ============================================================
 */

const getMenuKey = (
  menu: ApiMenuNode,
): string => {
  return `${menu.menuId}-${menu.route ?? ""}`;
};

/**
 * ============================================================
 * NORMALIZE MENU PAYLOAD
 * ============================================================
 */

export const normalizeMenuPayload = (
  menus: ApiMenuNode[] | null | undefined,
): MenuItem[] => {
  if (
    !Array.isArray(menus) ||
    menus.length === 0
  ) {
    return [];
  }

  /**
   * ----------------------------------------------------------
   * 1. FILTER + MERGE PARENT
   * ----------------------------------------------------------
   */

  const menuMap =
    new Map<string, ApiMenuNode>();

  for (const menu of menus) {
    if (!isMenuAllowed(menu)) {
      continue;
    }

    const key = getMenuKey(menu);

    const existing =
      menuMap.get(key);

    if (!existing) {
      menuMap.set(key, {
        ...menu,

        children:
          Array.isArray(menu.children)
            ? [...menu.children]
            : [],
      });

      continue;
    }

    existing.children = [
      ...(existing.children ?? []),
      ...(menu.children ?? []),
    ];
  }

  /**
   * ----------------------------------------------------------
   * 2. NORMALIZE
   * ----------------------------------------------------------
   */

  return Array.from(
    menuMap.values(),
  )
    .map((menu) => {
      /**
       * ------------------------------------------------------
       * CHILDREN
       * ------------------------------------------------------
       */

      const childrenMap =
        new Map<string, ApiMenuNode>();

      for (const child of menu.children ?? []) {
        if (!isMenuAllowed(child)) {
          continue;
        }

        const key =
          getMenuKey(child);

        if (
          !childrenMap.has(key)
        ) {
          childrenMap.set(
            key,
            child,
          );
        }
      }

      const children =
        Array.from(
          childrenMap.values(),
        )
          .map((child) => {
            const href =
              normalizeMenuRoute(
                child.route,
              );

            return {
              label:
                child.menuName,

              href,

              description:
                child.description ??
                child.menuName,
            };
          })
          .filter(
            (child) =>
              Boolean(child.href),
          );

      /**
       * ------------------------------------------------------
       * PARENT
       * ------------------------------------------------------
       */

      const parentHref =
        normalizeMenuRoute(
          menu.route,
        );

      return {
        label: menu.menuName,

        href:
          parentHref || "#",

        icon:
          getMenuTypeIcon(
            menu.menuName,
            menu.route,
          ),

        group:
          menu.menuName,

        description:
          menu.description ??
          menu.menuName,

        children:
          children.length > 0
            ? children
            : undefined,
      };
    })
    /**
     * Jangan tampilkan parent kosong
     * kecuali parent memang memiliki route.
     */
    .filter(
      (menu) =>
        menu.href !== "#" ||
        Boolean(menu.children?.length),
    );
};

/**
 * ============================================================
 * GET MENU BY ROLE
 * ============================================================
 *
 * IMPORTANT:
 *
 * Menu dari backend adalah sumber utama.
 *
 * Role hanya digunakan untuk landing page
 * dan fallback jika diperlukan.
 */

export const getMenuByRole = (
  role: UserRole,
  menus?: ApiMenuNode[] | null,
): MenuItem[] => {
  if (
    Array.isArray(menus) &&
    menus.length > 0
  ) {
    const normalized =
      normalizeMenuPayload(menus);

    if (
      normalized.length > 0
    ) {
      return normalized;
    }
  }

  /**
   * Fallback.
   *
   * Saat ini kosong karena menu
   * sepenuhnya berasal dari backend.
   */

  return (
    roleMenus[role] ?? []
  );
};

