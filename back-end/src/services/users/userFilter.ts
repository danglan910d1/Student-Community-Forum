import { UserRole, UserStatus } from "../../models/User";
import { GetAllUsersQuery } from "../../types/user";
import { AuthContext, buildCommonFilter } from "../common/buildCommonFilter";

/**
 * Xây dựng đối tượng filter MongoDB đặc thù cho User.
 * Logic này xử lý STATUS và ROLE khác biệt so với Post/Topic.
 */
export const buildUserFilter = (
  queryParams: GetAllUsersQuery,
  authContext: AuthContext
): any => {
  const { status, role, search } = queryParams;
  const { isAdmin } = authContext;

  // 1. Khởi tạo bộ lọc cơ bản: Bắt đầu bằng bộ lọc RỖNG.
  const filter: any = {};

  // 2. LOGIC XÓA MỀM (is_deleted) và QUYỀN HẠN TRUY CẬP
  if (isAdmin) {
    // ADMIN: Mặc định không áp dụng is_deleted filter (thấy TẤT CẢ user).
    // Nếu Admin muốn lọc user chưa xóa, họ sẽ phải thêm query param (chức năng nâng cao).

    // XỬ LÝ LỌC TRẠNG THÁI (STATUS)
    const validStatuses: UserStatus[] = ["active", "banned"];
    if (status && validStatuses.includes(status as UserStatus)) {
      filter.status = status;
    }
    // Admin có thể thấy user bị xóa mềm hoặc chưa xóa.
  } else {
    // PUBLIC/USER THƯỜNG: BẮT BUỘC chỉ thấy user CHƯA bị xóa (Soft Delete)
    filter.is_deleted = false;
    // BẮT BUỘC chỉ thấy trạng thái "active"
    filter.status = "active";
  }

  // 3. XỬ LÝ LỌC ĐẶC THÙ (ROLE)
  const validRoles: UserRole[] = ["user", "admin"];
  // Lọc theo Role chỉ có ý nghĩa khi Admin muốn lọc.
  if (role && validRoles.includes(role as UserRole) && isAdmin) {
    filter.role = role;
  }

  // 4. XỬ LÝ TÌM KIẾM TỪ KHÓA (CHUNG)
  if (search) {
    // TÁI SỬ DỤNG: Lấy logic $text search từ buildCommonFilter
    const searchFilter = buildCommonFilter({ search }, authContext, "user");
    if (searchFilter.$text) {
      filter.$text = searchFilter.$text;
    }
  }

  return filter;
};
