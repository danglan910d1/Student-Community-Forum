import {
  AuthContext,
  buildCommonFilter,
  CommonQuery,
} from "../common/buildCommonFilter"; // Sử dụng CommonQuery

// Giả định Topic Query chỉ cần các trường chung
export interface GetTopicsQuery extends CommonQuery {
  // Không có trường đặc thù nào ngoài CommonQuery
}

/**
 * Xây dựng đối tượng filter MongoDB đặc thù cho Topic.
 * Sử dụng buildCommonFilter để xử lý logic Status và Search.
 */
export const buildTopicFilter = (
  queryParams: GetTopicsQuery,
  authContext: AuthContext
) => {
  // 1. TẠO OBJECT CHUNG BẰNG CÁCH SỬ DỤNG CONDITIONAL SPREAD
  const { status, search, myPosts, page, limit } = queryParams;

  const commonQuery: CommonQuery = {
    ...(status && { status }),
    ...(search && { search }),
    ...(myPosts && { myPosts }),
    ...(page && { page }),
    ...(limit && { limit }),
  };

  // 2. Lấy bộ lọc chung (Status, Search, MyPosts)
  const filter = buildCommonFilter(commonQuery, authContext, "topic");

  // Topic không có logic lọc đặc thù nào khác ngoài status và search

  return filter;
};
