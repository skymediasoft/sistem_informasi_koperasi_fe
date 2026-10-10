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

export type Group = {
  groupId?: string | number;
  groupName?: string;
  groupCreatedUser?: string;
  groupCreateDate?: string | number;
  GroupId?: string | number;
  GroupName?: string;
  GroupCreatedUser?: string;
  GroupCreateDate?: string | number;
  id?: string | number;
  name?: string;
  createdUser?: string;
  createdDate?: string | number;
};

export type CreateDepartmentPayload = {
  departmentId: string;
  departmentName: string;
};

export type UpdateDepartmentPayload = {
  departmentName: string;
};

export type CreateGroupPayload = {
  groupId: string | number;
  groupName: string;
};

export type UpdateGroupPayload = {
  groupName: string;
};

export type User = {  
  id?: string | number;
  UserId?: string | number;
  UserLogin?: string;
  UserName?: string;
  UserEmail?: string;
  PostBy?: string;
  PostDate?: string | number;
  GroupId?: string | number;
  GroupName?: string;
  groupName?: string;
};

export type RegisterUserPayload = {
  userlogin: string;
  username: string;
  password: string;
  email: string;
  groupId?: number;
};

export type UpdateUserPayload = {
  userlogin?: string;
  userloginInput?: string;
  username?: string;
  email?: string;
  groupId?: number;
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

export const groupApi = {
  findAll: () => handleResponse<unknown>(api.get("/group")),
  create: (group: CreateGroupPayload) =>
    handleResponse<Group>(api.post("/group", group)),
  update: (groupId: string, group: UpdateGroupPayload) =>
    handleResponse<{ message: string }>(api.patch(`/group/${groupId}`, group)),
  delete: (groupId: string) => handleResponse<void>(api.delete(`/group/${groupId}`)),
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


export const groupMenuAuthApi = {
  findAll: (groupId: string) =>
    handleResponse<unknown>(api.get(`/group/auth/${groupId}`)),
  update: (
    groupId: string,
    menuAuth: { groupId: number; menuId: number; access: number }[],
  ) =>
    handleResponse<{ message: string }>(api.patch(`/group/auth/${groupId}`, menuAuth)),
};

export const userApi = {
  findAll: () => handleResponse<unknown>(api.get("/auth/users")),
  register: (user: RegisterUserPayload) =>
    handleResponse<User>(api.post("/auth/register", user)),
  findOne: (userId: string) => handleResponse<User>(api.get(`/auth/users/${userId}`)),
  update: (user: UpdateUserPayload) =>
    handleResponse<{ message: string }>(api.patch("/auth/users", user)),
  resetpassword: (userlogin: string, newPassword: string) =>
    handleResponse<{ message: string }>(api.patch("/auth/admin-reset-password", { userlogin, newPassword })),
  delete: (userId: string) => handleResponse<void>(api.delete(`/auth/users/${userId}`)),
};


export const SettingSimpananApi = {
  findAll: () => handleResponse<SettingSimpanan[]>(api.get("/setting-simpanan")),
  update: (id: number, setting: CreateSimpananPayload) =>
    handleResponse<unknown>(api.patch(`/setting-simpanan/${id}`, setting)),
  updateApply: (setting: CreateSimpananPayload) =>
    handleResponse<unknown>(api.post("/setting-simpanan/update-apply", setting)),
};

export type SettingSimpanan = {
  ID: number;
  SimpananPokok?: number;
  SimpananWajib?: number;
  SimpananSukarela?: number;
  jenisTransaksi?: string;
  tagihan?: number;
  profit?: number;
};
export type UpdateSimpananPayload = {
  ID: number;
  SimpananPokok: number;
  SimpananWajib: number;
  SimpananSukarela: number;
};

export type CreateSimpananPayload = {
  SimpananPokok: number;
  SimpananWajib: number;
  SimpananSukarela: number;
};

export type AnggotaPayload = {
        NoAnggota: number,
        NoEmployee: string,
        Nama: string,
        Alamat: string,
        Telpon: string,
        JenisKelamin: string,
        DepartmentId: number,
        DepartmentName: string,
        JenisAnggota: string,
        TanggalMasuk: Date,
        NoRekening: string,
        SimpananPokok: number,
        SimpananWajib: number,
        SimpananSukarela: number,
        AlamatEmail: string,
        StatusAnggota: string,
        CreatedUser: string,
};


export type AnggotaCreatePayload = {
  NoEmployee: string;
  Nama: string;
  Alamat: string;
  Telpon: string;
  JenisKelamin: string;
  DepartmentId: number;
  JenisAnggota: string;
  TanggalMasuk: string;
  NoRekening: string;
  SimpananPokok: number;
  SimpananWajib: number;
  SimpananSukarela: number;
  AlamatEmail: string;
  StatusAnggota: string;
};

export const anggotaApi = {
  findAll: () => handleResponse<AnggotaPayload[]>(api.get("/anggota-auth/all")),
findOne: (NoAnggota: string) =>
  handleResponse<AnggotaPayload>(
    api.get(`/anggota-auth/${encodeURIComponent(NoAnggota)}`)
  ),
  create: (anggota: AnggotaCreatePayload) =>
    handleResponse<AnggotaPayload>(api.post("/anggota-auth/register", anggota)),
  update: (NoAnggota: string, anggota: AnggotaCreatePayload) =>
    handleResponse<{ message: string }>(api.patch(`/anggota-auth/update/${encodeURIComponent(NoAnggota)}`, anggota)),
  delete: (NoAnggota: string) => handleResponse<void>(api.delete(`/anggota-auth/delete/${encodeURIComponent(NoAnggota)}`)),
};

//get 
export type TransaksiSimpanan = {
  NoAnggota: number,
  NoEmployee: string,
  Nama: string,
     SimpananPokok: number,
        SimpananWajib: number,
        SimpananSukarela: number,
        Total: number,
}




//post
export type PostingTransakasiSimpananPayload = {
  Tanggal: string;
}

export type InputSimpananTunaiPayload = {
  TanggalSetor: string;
  NoEmployee: string;
  JenisSimpanan: string;
  Nama: string;
  JumlahSimpanan: number;
  JumlahBulan: number;
};

export const TransaksiSimpananAPI = {
  findAll: () =>
    handleResponse<TransaksiSimpanan[]>(api.get("/transaksi-simpanan")),
  postingSimpanan: (payload: PostingTransakasiSimpananPayload) =>
    handleResponse<string | { message?: string }>(
      api.post("/transaksi-simpanan/submit-posting", payload),
    ),
};

export const InputSimpananTunaiAPI = {
  create: (payload: InputSimpananTunaiPayload) =>
    handleResponse<unknown>(api.post("/inputsimpanantunai", payload)),
  findAll: () =>
    handleResponse<InputSimpananTunaiPayload[]>(api.get("/inputsimpanantunai")),
};


export type penarikanSimpananGet = {
  Status: string;
  DateFrom: Date;
  DateTo: Date;
  NoKaryawan: string;
};

export type SubmitTransaksiPenarikanDto = {
  IDPengambilan: number;
  IDTransaksiSimpanan: number;
  Tanggal: Date;
  NoAnggota: string;
  JenisSimpanan: string;
  Jumlah: number;
};

export type CloseTransaksiPenarikanDto = {
  IDPengambilan: number;
  TanggalTransfer: Date;
  NoRef: string;
};

export const penarikanSimpananApi = {
  getdataView: (payload: penarikanSimpananGet) =>
    handleResponse<unknown>(api.get("/transaksi-penarikan", { params: payload })),

  getById: (idPengambilan: string | number) =>
    handleResponse<unknown>(
      api.get(`/transaksi-penarikan/${encodeURIComponent(String(idPengambilan))}`),
    ),

  submit: (payload: SubmitTransaksiPenarikanDto) =>
    handleResponse<unknown>(api.post("/transaksi-penarikan/submit", payload)),

  close: (payload: CloseTransaksiPenarikanDto) =>
    handleResponse<unknown>(api.post("/transaksi-penarikan/close", payload)),
};





export type penarikanSimpananResignGet = {
  Status: string;
  DateFrom: Date;
  DateTo: Date;
  NoKaryawan: string;
};

export type SubmitTransaksiPenarikanResignDto = {
  IDPengambilan: number;
  Tanggal: Date;
  NoAnggota: string;
  SimpananPokok: number;
  SimpananWajib: number;
  SimpananSukarela: number;

};

export type CloseTransaksiPenarikanResignDto = {
  IDPengambilan: number;
  TanggalTransfer: Date;
  NoRef: string;
};



export const penarikanSimpananResignApi = {
  getdataView: (payload: penarikanSimpananResignGet) =>
    handleResponse<unknown>(api.get("/transaksi-penarikan/resign", { params: payload })),

  getById: (idPengambilan: string | number) =>
    handleResponse<unknown>(
      api.get(`/transaksi-penarikan/resign/${encodeURIComponent(String(idPengambilan))}`),
    ),

  submit: (payload: SubmitTransaksiPenarikanResignDto) =>
    handleResponse<unknown>(api.post("/transaksi-penarikan/resign/submit", payload)),

  close: (payload: CloseTransaksiPenarikanResignDto) =>
    handleResponse<unknown>(api.post("/transaksi-penarikan/resign/close", payload)),
};