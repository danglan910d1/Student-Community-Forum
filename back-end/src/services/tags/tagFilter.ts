import { Types } from "mongoose";
import {
  AuthContext,
  buildCommonFilter,
  CommonQuery,
} from "../common/buildCommonFilter"; // Sử dụng CommonQuery

// Giả định GetTagsQuery được mở rộng từ CommonQuery
export interface GetTagsQuery extends CommonQuery {
  topicId?: string;
}

/**
 * Xây dựng đối tượng filter MongoDB đặc thù cho Tag.
 * Sử dụng buildCommonFilter để xử lý logic Status, Search, và MyPosts (nếu có).
 */
export const buildTagFilter = (
  queryParams: GetTagsQuery,
  authContext: AuthContext
): any => {
  // 1. Lấy khung filter chung (status, search, myPosts, etc.)
  const filter = buildCommonFilter(queryParams, authContext, "tag");

  // 2. Thêm logic đặc thù cho Tag (topicId)
  const { topicId } = queryParams;

  if (topicId) {
    if (topicId === "null") {
      filter.topicId = null; // Lọc tags tự do
    } else if (Types.ObjectId.isValid(topicId)) {
      filter.topicId = new Types.ObjectId(topicId);
    }
  }

  return filter;
};
