// src/services/postService.ts
import { Types } from "mongoose";
import { GetPostsQuery } from "../../types/post"; // Đã sửa type file
import {
  buildCommonFilter,
  AuthContext,
  CommonQuery,
} from "../common/buildCommonFilter";

/**
 * Xây dựng đối tượng filter MongoDB đặc thù cho Post.
 * Nó gọi hàm chung để xử lý Status và Search, sau đó thêm lọc đặc thù.
 */
export const buildPostFilter = (
  queryParams: GetPostsQuery, // Nhận type mở rộng
  authContext: AuthContext
) => {
  // SỬA LỖI: Lấy TẤT CẢ các tham số cần thiết từ queryParams
  const { topicId, tagId, status, search, myPosts, page, limit } = queryParams;

  // TẠO OBJECT CHUNG BẰNG CÁCH SỬ DỤNG CONDITIONAL SPREAD
  // (Chỉ thêm vào nếu giá trị TỒN TẠI)
  const commonQuery: CommonQuery = {
    // 1. Chỉ thêm các trường nếu chúng không phải undefined
    ...(status && { status }),
    ...(search && { search }),
    ...(myPosts && { myPosts }),
    ...(page && { page }),
    ...(limit && { limit }),
  };

  // 1. Lấy bộ lọc chung (Status, Search, MyPosts)
  const filter = buildCommonFilter(commonQuery, authContext, "post");

  // 2. THÊM LỌC ĐẶC THÙ (TOPIC & TAG)
  if (topicId && Types.ObjectId.isValid(topicId as string)) {
    filter.topicId = new Types.ObjectId(topicId as string);
  }
  if (tagId && Types.ObjectId.isValid(tagId as string)) {
    filter.tags = new Types.ObjectId(tagId as string);
  }

  return filter;
};
