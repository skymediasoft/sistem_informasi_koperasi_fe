import axios from "axios";

export const authApi = {
	login: async (kode: string, password: string) => {
		const res = await axios.post(
			`${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
			{ kode, password },
			{
				headers: { "Content-Type": "application/json" },
				withCredentials: false,
			},
		);
		return res.data;
	},
};
