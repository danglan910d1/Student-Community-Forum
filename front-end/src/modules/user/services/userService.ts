import { api } from "@/services/api";
import {
  IUser,
  IGetAdminUsersParams,
  UpdateProfileRequest,
  UpdatePasswordRequest,
} from "../types";
import { IApiResponse, UserRole, UserStatus } from "@/types/common";
import { IGetUsersParams } from "@/modules/post/types";

export const userService = {
  // 1. Profile & Security
  getMe: async (): Promise<IUser> => {
    const response = await api.get<IUser>("/users/me");
    return response.data;
  },

  updateProfile: async (
    payload: UpdateProfileRequest,
    requestId?: string
  ): Promise<IUser> => {
    const formData = new FormData();
    if (payload.name) formData.append("name", payload.name);

    // Logic khớp với Backend controller:
    if (payload.avatar instanceof File) {
      formData.append("avatar", payload.avatar);
    } else if (payload.avatar === null) {
      formData.append("avatar", "null"); // Gửi string "null" như BE check
    }

    const response = await api.put<IUser>("/users/profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...(requestId && { "x-request-id": requestId }),
      },
    });
    return response.data;
  },

  // 2. Public Reads
  getUserById: async (id: string): Promise<IUser> => {
    const response = await api.get<IUser>(`/users/${id}`);
    return response.data;
  },

  // 3. List Operations (Dùng IApiResponse đã định nghĩa ở common)
  getUsers: async (
    params: IGetUsersParams
  ): Promise<IApiResponse<IUser, "users">> => {
    const response = await api.get<IApiResponse<IUser, "users">>("/users", {
      params,
    });
    return response.data;
  },

  getAdminUsers: async (
    params: IGetAdminUsersParams
  ): Promise<IApiResponse<IUser, "users">> => {
    const response = await api.get<IApiResponse<IUser, "users">>(
      "/users/admin",
      { params }
    );
    return response.data;
  },

  updateUserStatus: async (
    id: string,
    payload: { status?: UserStatus; role?: UserRole },
    requestId?: string
  ): Promise<IUser> => {
    const response = await api.put<IUser>(
      `/users/admin/${id}/status`,
      payload,
      { headers: requestId ? { "x-request-id": requestId } : {} }
    );
    return response.data;
  },

  deleteUser: async (
    id?: string,
    requestId?: string
  ): Promise<{ message: string }> => {
    // Nếu có id là admin xóa user, không có là user tự xóa chính mình
    const url = id ? `/users/admin/${id}` : "/users/me";
    const response = await api.delete(url, {
      headers: requestId ? { "x-request-id": requestId } : {},
    });
    return response.data;
  },

  updatePassword: async (
    payload: UpdatePasswordRequest, // Chứa oldPassword và newPassword
    requestId?: string
  ): Promise<{ message: string }> => {
    const response = await api.put<{ message: string }>(
      "/users/password",
      payload,
      {
        headers: requestId ? { "x-request-id": requestId } : {},
      }
    );
    return response.data;
  },
};
