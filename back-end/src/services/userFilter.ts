import { Types } from "mongoose";
import { GetAllUsersQuery } from "../types/user";
import {
  AuthContext,
  GlobalStatus,
  CommonQuery,
  buildCommonFilter,
} from "./buildCommonFilter"; // Giả định import từ buildCommonFilter

/**
 * Xây dựng đối tượng filter MongoDB cho User dựa trên quyền hạn và query params.
 * Logic này được tách ra từ getUsersList để tăng tính tái sử dụng và tách biệt trách nhiệm (SoC).
 */
export const buildUserFilter = (
  queryParams: GetAllUsersQuery,
  authContext: AuthContext
): any => {
  // SỬA LỖI: Lấy TẤT CẢ các tham số cần thiết từ queryParams
  const { status, role, search, page, limit, myPosts } = queryParams;
  const { isAdmin, userId } = authContext;

  // 1. TẠO OBJECT CHUNG (CommonQuery) BẰNG CÁCH SỬ DỤNG CONDITIONAL SPREAD
  const commonQuery: CommonQuery = {
    // Chỉ thêm các trường nếu chúng không phải undefined
    ...(status && { status: status as GlobalStatus }), // Ép kiểu status sang GlobalStatus
    ...(search && { search }),
    // Giả định GetAllUsersQuery không có myPosts, nhưng vẫn thêm để nhất quán nếu cần
    // ...(myPosts && { myPosts }),
    ...(page && { page }),
    ...(limit && { limit }),
  };

  // 2. Lấy bộ lọc chung (Status, Search) từ buildCommonFilter
  // LƯU Ý: buildCommonFilter hiện tại không hỗ trợ lọc Role,
  // nên ta chỉ dùng nó cho Status và Search.
  const filter = buildCommonFilter(commonQuery, authContext, "user");

  // 3. XỬ LÝ LỌC ĐẶC THÙ (ROLE)
  if (role && (role === "user" || role === "admin")) {
    // Áp dụng role filter sau khi có filter chung
    filter.role = role;
  }

  // GHI CHÚ: Logic Public/Admin đã được xử lý trong buildCommonFilter
  // (ví dụ: Public luôn có filter.status = "active").

  return filter;
};
