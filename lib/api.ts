import axios, { type AxiosError } from "axios";

export const api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL,
	headers: { "Content-Type": "application/json" },
	withCredentials: false,
});

api.interceptors.request.use(
	(config) => {
		const token =
			typeof window !== "undefined" ? localStorage.getItem("token") : null;
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
				localStorage.removeItem("token");
				window.location.href = "/login";
			}
		}
		return Promise.reject(error);
	},
);

const handleResponse = async <T>(promise: Promise<any>): Promise<T> => {
	const { data } = await promise;
	if (data.success === false) throw new Error(data.message || "Server error");
	return data.data ?? data;
};
