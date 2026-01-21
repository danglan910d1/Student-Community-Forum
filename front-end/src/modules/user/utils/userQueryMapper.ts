// modules/user/utils/userQueryMapper.ts
import { UserRole, UserStatus } from "@/types/common";
import { IGetAdminUsersParams } from "../types";

interface RawUserParams {
  page?: number | string;
  status?: string;
  role?: string;
  startDate?: string;
  endDate?: string;
  email?: string;
}

export const mapUserUrlParamsToApi = (
  params: RawUserParams,
): IGetAdminUsersParams => {
  return {
    page: Number(params.page) || 1,
    limit: 10,
    // Tránh dùng 'any', ép kiểu về đúng Enum/Type của hệ thống
    status: params.status === "all" ? undefined : (params.status as UserStatus),
    role: params.role === "all" ? undefined : (params.role as UserRole),
    email: params.email || undefined,
    startDate: params.startDate || undefined,
    endDate: params.endDate || undefined,
  };
};
