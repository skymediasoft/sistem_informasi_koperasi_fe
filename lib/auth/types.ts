
/**
 * ============================================================
 * GENERIC API RESPONSE
 * ============================================================
 */

export interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data: T;
}

export interface PaginatedApiResponse<T> {
  success: boolean;
  message: string;
  code: number;
  data: T;
  pagination: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
}

export interface ApiError {
  success: boolean;
  code: number;
  message: string;
  error: unknown;
}

export interface PaginationQueryParams {
  page?: number;
  per_page?: number;
}

/**
 * ============================================================
 * USER ROLE
 * ============================================================
 */

export type UserRole =
  | "administrator"
  | "admin-koperasi"
  | "pengurus-koperasi"
  | "anggota";

/**
 * ============================================================
 * USER
 * ============================================================
 */

export interface BaseUser {
  id: number;
  nama: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export type Administrator = BaseUser;
export type AdminKoperasi = BaseUser;
export type PengurusKoperasi = BaseUser;
export type Anggota = BaseUser;

/**
 * ============================================================
 * MENU DARI BACKEND
 * ============================================================
 */

export interface ApiMenuNode {
  menuId: number | string;
  menuName: string;

  route?: string | null;

  description?: string | null;

  accessValue?: number | null;
  accessStatus?: string | null;

  children?: ApiMenuNode[];
}

/**
 * ============================================================
 * PERMISSION
 * ============================================================
 *
 * Backend boleh mengembalikan string langsung,
 * atau object permission.
 */

export type UserPermission =
  | string
  | {
      name?: string;
      permissionName?: string;
      code?: string;
    };

/**
 * ============================================================
 * AUTH SESSION USER
 * ============================================================
 */

export interface AuthSessionUser {
  id: string;

  name: string;

  email: string;

  role: UserRole;

  groupId: number;

  groupName: string;

  permissions: string[];

  mustChangePassword: boolean;

  menus: ApiMenuNode[];

  updatedAt: string;
}

/**
 * ============================================================
 * AUTH STORAGE
 * ============================================================
 */

export interface AuthStorageSession {
  user: AuthSessionUser;
}

/**
 * ============================================================
 * AUTH API RESPONSE
 * ============================================================
 */

export interface LoginResponse {
  access_token?: string;
  accessToken?: string;

  refresh_token?: string;
  refreshToken?: string;

  user?: unknown;

  menus?: ApiMenuNode[];
}

export interface RefreshTokenResponse {
  access_token?: string;
  accessToken?: string;

  refresh_token?: string;
  refreshToken?: string;
}

export interface MeResponse {
  user?: unknown;
  menus?: ApiMenuNode[];

  id?: number | string;
  userlogin?: string;

  userName?: string;
  name?: string;

  email?: string;

  groupId?: number;
  group_id?: number;

  groupName?: string;
  group_name?: string;

  permissions?: unknown[];

  mustChangePassword?: boolean;
  must_change_password?: boolean;
}
