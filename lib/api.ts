import axios, { type AxiosError } from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

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
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("koperasi_token");
        localStorage.removeItem("koperasi_refresh_token");
        localStorage.removeItem("koperasi_session");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
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
