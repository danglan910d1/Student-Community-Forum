// --- 1. STATUS & ROLES (Khớp với buildCommonFilter) ---
export type GlobalStatus = "pending" | "approved" | "rejected";
export type UserStatus = "active" | "banned" | "pending";
export type UserRole = "user" | "admin";

// --- 2. TÁC GIẢ (Sử dụng IAuthor cho đồng bộ với IPost, ITopic...) ---
export interface IAuthor {
  userId: string;
  name: string;
  avatar?: string;
  role?: UserRole;
  email?: string; // Admin mới thấy
  createdAt: string;
}

// --- 3. METADATA CHUNG ---
export interface IBaseMetadata {
  name: string;
  slug: string;
}

// --- 4. CẤU TRÚC RESPONSE CHUẨN (Khớp với lồng data của BE) ---
export type IApiResponse<T, K extends string> = {
  [P in K]: T[];
} & {
  pagination: {
    totalItems: number;
    currentPage: number;
    limit: number;
    totalPages: number;
  };
};

export interface IGetListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}

// --- 5. LỖI API ---
export interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}
