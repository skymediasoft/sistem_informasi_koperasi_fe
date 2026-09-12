import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { ApiMenuNode } from "./auth/types";

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

let refreshRequest: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  if (refreshRequest) return refreshRequest;

  refreshRequest = (async () => {
    const refreshToken =
      typeof window !== "undefined"
        ? localStorage.getItem("koperasi_refresh_token")
        : null;

    if (!refreshToken) return null;

    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
        { refreshToken },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: false,
        },
      );

      const accessToken = data?.access_token ?? data?.accessToken;
      const nextRefreshToken =
        data?.refresh_token ?? data?.refreshToken ?? refreshToken;

      if (!accessToken) return null;

      localStorage.setItem("koperasi_token", accessToken);
      localStorage.setItem("koperasi_refresh_token", nextRefreshToken);
      return accessToken;
    } catch {
      return null;
    } finally {
      refreshRequest = null;
    }
  })();

  return refreshRequest;
};

api.interceptors.request.use(
  (config) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("koperasi_token") : null;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryableRequestConfig | undefined;

    if (
      error.response?.status !== 401 ||
      !config ||
      config._retry ||
      config.url?.includes("/auth/refresh") ||
      typeof window === "undefined"
    ) {
      return Promise.reject(error);
    }

    config._retry = true;
    const accessToken = await refreshAccessToken();

    if (!accessToken) {
      localStorage.removeItem("koperasi_token");
      localStorage.removeItem("koperasi_refresh_token");
      localStorage.removeItem("koperasi_session");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    config.headers.Authorization = `Bearer ${accessToken}`;
    return api(config);
  },
);

export const handleResponse = async <T>(promise: Promise<any>): Promise<T> => {
  const { data } = await promise;
  if (data.success === false) throw new Error(data.message || "Server error");
  return data.data ?? data;
};

export type Department = {
  departmentId: string;
  departmentName: string;
  departmentCreatedUser: string;
  departmentCreateDate?: string | number;
};

export type CreateDepartmentPayload = {
  departmentId: string;
  departmentName: string;
};

export type UpdateDepartmentPayload = {
  departmentName: string;
};

export type CreateMenuPayload = {
  menuName: string;
  menuRoute?: string;
  menuSort: number;
  menuParentId?: string | number;
  postBy?: string;
};

export type UpdateMenuPayload = {
  menuName?: string;
  menuRoute?: string;
  menuSort?: number;
};

export const departmentApi = {
  findAll: () => handleResponse<Department[]>(api.get("/department")),
  findOne: (departmentId: string) =>
    handleResponse<Department>(api.get(`/department/${departmentId}`)),
  create: (department: CreateDepartmentPayload) =>
    handleResponse<Department>(api.post("/department/create", department)),
  update: (departmentId: string, department: UpdateDepartmentPayload) =>
    handleResponse<{ message: string }>(api.patch(`/department/${departmentId}`, department)),
  delete: (departmentId: string) => handleResponse<void>(api.delete(`/department/${departmentId}`)),
};


export const menuApi = {
  findAllParent: () =>
    handleResponse<ApiMenuNode[]>(api.get("/menu/parent")),
  findAllChild: (parentId: string) =>
    handleResponse<ApiMenuNode[]>(api.get(`/menu/child/${parentId}`)),
  create: (menu: CreateMenuPayload) =>
    handleResponse<ApiMenuNode>(api.post("/menu/create", menu)),
  update: (menuId: string, menu: UpdateMenuPayload) =>
    handleResponse<{ message: string }>(api.patch(`/menu/${menuId}`, menu)),
  delete: (menuId: string) => handleResponse<void>(api.delete(`/menu/${menuId}`)),
  findOne: (menuId: string) => handleResponse<ApiMenuNode>(api.get(`/menu/${menuId}`)),
};  
