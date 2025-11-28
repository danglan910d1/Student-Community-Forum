import { Types } from "mongoose";
import { GetCommentsQuery } from "../types/comment";
import {
  AuthContext,
  buildCommonFilter,
  CommonQuery,
} from "./buildCommonFilter";

/**
 * Xây dựng đối tượng filter MongoDB cho Comment.
 * Sử dụng buildCommonFilter cho các trường chung (Status, Search).
 */
export const buildCommentFilter = (
  queryParams: GetCommentsQuery,
  authContext: AuthContext
): any => {
  const { postId, parentId, page, limit } = queryParams;

  const commonQuery: CommonQuery = {
    /* ... */
  };
  const filter = buildCommonFilter(commonQuery, authContext, "comment");

  // 3. XỬ LÝ LỌC ĐẶC THÙ (postId, parentId)

  // 3.1. Lọc BẮT BUỘC theo Post ID
  if (postId && Types.ObjectId.isValid(postId)) {
    filter.postId = new Types.ObjectId(postId);
  } else {
    // Áp dụng FAIL FAST: Trả về lỗi nếu tham số bắt buộc không hợp lệ
    return { error: "Valid postId is required for fetching comments." };
  }

  // 3.2. Lọc theo cấp độ (Parent ID)
  if (parentId) {
    if (Types.ObjectId.isValid(parentId)) {
      filter.parentId = new Types.ObjectId(parentId);
    } else {
      // Trường hợp lỗi parentId
      return { error: "Invalid parentId format." };
    }
  } else {
    // Lấy bình luận cấp 1 (root comments)
    filter.parentId = null;
  }

  // 3.3. Xử lý is_deleted cho ADMIN (Logic này đã đúng)
  if (authContext.isAdmin && filter.is_deleted === false) {
    delete filter.is_deleted;
  }

  return filter;
};
