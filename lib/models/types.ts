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
	error: any;
}

export interface PaginationQueryParams {
	page?: number;
	per_page?: number;
}

// Role based on user group.
// -	Administrator
// -	Admin Koperasi
// -	Pengurus Koperasi
// -	Anggota

export interface Administrator {
    id: number;
    nama: string;
    email: string;
    created_at: string;
    updated_at: string;
}

export interface AdminKoperasi {
    id: number;
    nama: string;
    email: string;
    created_at: string;
    updated_at: string;
}

export interface PengurusKoperasi {
    id: number;
    nama: string;
    email: string;
    created_at: string;
    updated_at: string;
}

export interface Anggota {
    id: number;
    nama: string;
    email: string;
    created_at: string;
    updated_at: string;
}