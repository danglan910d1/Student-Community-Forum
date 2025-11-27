import { Types } from "mongoose";
import {
  AuthContext,
  buildCommonFilter,
  CommonQuery,
} from "./buildCommonFilter"; // Sử dụng CommonQuery

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
  // 1. TẠO OBJECT CHUNG BẰNG CÁCH SỬ DỤNG CONDITIONAL SPREAD
  const { status, search, myPosts, page, limit, topicId } = queryParams;

  const commonQuery: CommonQuery = {
    ...(status && { status }),
    ...(search && { search }),
    ...(myPosts && { myPosts }),
    ...(page && { page }),
    ...(limit && { limit }),
  };

  // 2. Lấy bộ lọc chung (Status, Search, MyPosts)
  // Giả định trường người tạo là 'createdBy' cho Tag Model
  const filter = buildCommonFilter(commonQuery, authContext, "tag");

  // 3. XỬ LÝ LỌC ĐẶC THÙ (TOPIC ID)
  if (topicId && Types.ObjectId.isValid(topicId as string)) {
    filter.topicId = new Types.ObjectId(topicId as string);
  } else if (topicId === "null") {
    // Hỗ trợ lọc Free Tags (tags không gán topicId)
    filter.topicId = null;
  }

  return filter;
};
