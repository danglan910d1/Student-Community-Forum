import { Types } from "mongoose";
import { GetCommentsQuery } from "../../types/comment";
import {
  AuthContext,
  buildCommonFilter,
  CommonQuery,
} from "../common/buildCommonFilter";

export const buildCommentFilter = (
  queryParams: GetCommentsQuery,
  authContext: AuthContext
): any => {
  const { postId, parentId, status } = queryParams;

  // 1. Build common filter (search, is_deleted, status mặc định)
  const filter = buildCommonFilter(queryParams, authContext, "comment");

  // 2. Validate PostId (Fail-fast)
  if (!postId || !Types.ObjectId.isValid(postId)) {
    return { error: "Valid postId is required." };
  }
  filter.postId = new Types.ObjectId(postId);

  // 3. Xử lý ParentId (Phân cấp)
  if (parentId) {
    if (!Types.ObjectId.isValid(parentId))
      return { error: "Invalid parentId." };
    filter.parentId = new Types.ObjectId(parentId);
  } else {
    filter.parentId = null; // Lấy comment gốc
  }

  // 4. Quyền Admin (Sửa lỗi hình ảnh của bạn)
  // Nếu là Admin và KHÔNG truyền status cụ thể -> Xóa lọc status/deleted để xem tất cả
  if (authContext.isAdmin && status === undefined) {
    delete filter.is_deleted;
    delete filter.status;
  }

  return filter;
};
