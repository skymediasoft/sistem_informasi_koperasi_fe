import axios from "axios";

const buildHeaders = (token?: string | null) => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

const api_base_url = process.env.NEXT_PUBLIC_API_URL


export const authApi = {
  login: async (userlogin: string, password: string) => {
    const res = await axios.post(`${api_base_url}/auth/login`, { userlogin, password }, {
      headers: buildHeaders(),
      withCredentials: false,
    });
    return res.data;
  },

  me: async (token: string) => {
    const res = await axios.get(`${api_base_url}/auth/me`, {
      headers: buildHeaders(token),
      withCredentials: false,
    });

    return res.data;
  },

  refreshToken: async (refreshToken: string) => {
    const res = await axios.post(`${api_base_url}/auth/refresh`, { refreshToken }, {
      headers: buildHeaders(),
      withCredentials: false,
    });

    return res.data;
  },

  logout: async (token: string) => {
    const res = await axios.post(`${api_base_url}/auth/logout`, {}, {
      headers: buildHeaders(token),
      withCredentials: false,
    });

    return res.data;
  },
};
