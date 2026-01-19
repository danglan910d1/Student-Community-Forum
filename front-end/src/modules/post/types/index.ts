import { Tag } from "@/modules/tag/types";
import {
  GlobalStatus,
  IApiResponse,
  IAuthor,
  IGetListParams,
  UserRole,
  UserStatus,
} from "@/types/common";

export interface IPost {
  postId: string;
  title: string;
  slug: string;
  content: string;
  views_count: number;
  likes_count: number;
  comments_count: number;
  is_sticky: boolean;
  is_resolved: boolean;
  createdAt: string;
  updatedAt: string;
  user: IAuthor; // Đã đổi tên
  topic: { topicId: string; name: string; slug: string } | null;
  tags: Tag[];
  pending_tags?: {
    tagId: string;
    name: string;
    slug: string;
    status?: string;
  }[];
  status?: GlobalStatus;
  is_deleted?: boolean;
}

export interface IPostIdentity {
  topic: string | null;
  tag: string | null;
}

export type IPostResponse = IApiResponse<IPost, "posts"> & {
  identity: IPostIdentity;
};
export interface IGetPostsParams extends IGetListParams {
  topicId?: string;
  tagId?: string;
  topicSlug?: string;
  tagSlug?: string;
  // User & Admin dùng:
  myPosts?: boolean;
  status?: GlobalStatus;
  is_resolved?: boolean;
  // Chỉ Admin dùng:
  showDeleted?: boolean;
  userId?: string;
  startDate?: string; // ISO String hoặc YYYY-MM-DD
  endDate?: string;
}

export interface IGetPostsRequestParams extends IGetPostsParams {
  adminView?: boolean;
}

export type IPostDetailResponse = { post: IPost };

// Trong file types của bạn
export interface ICreatePostBody {
  title: string;
  content: string;
  topicId: string;
  tags: string[]; // Đổi từ Tag[] thành string[]
}

export interface IUpdatePostBody extends Partial<ICreatePostBody> {
  status?: GlobalStatus;
  is_resolved?: boolean;
}

export interface IComment {
  commentId: string; // Backend đã đổi từ _id thành commentId
  postId: string; // Hoặc IPost nếu includePost = true
  parentId: string | null;
  content: string;
  isLiked?: boolean;
  likes_count: number;
  replies_count: number;
  createdAt: string;
  updatedAt: string;
  user: IAuthor; // Thông tin người comment
  replies?: IComment[];
  // Các trường sau có thể bị ẩn (REMOVE) bởi Pipeline nếu không phải Admin/Owner
  status?: GlobalStatus;
}

export type ICommentDisplay = Omit<IComment, "status">;
// Người dùng bình thường không cần biết status (vì mặc định là approved mới thấy)

export interface IAdminComment extends IComment {
  status: GlobalStatus;
  user: IAuthor & { email: string }; // Admin thấy email trong object user
}

export type IGetUsersParams = IGetListParams;

export interface IGetAdminUsersParams extends IGetUsersParams {
  email?: string; // Backend: delete filter.$text để tìm chính xác email
  role?: UserRole;
  status?: UserStatus;
  showDeleted?: boolean;
}

export type ITopicResponse = IApiResponse<IComment, "comments">;

export type LikeTargetType = "post" | "comment";

/**
 * Response của POST /api/likes/:targetType/:targetId
 */
export interface IToggleLikeResponse {
  message: string;
  isLiked: boolean;
  likeCount: number;
}

/**
 * Response của GET /api/likes
 */
export interface ILikeStatusResponse {
  isLiked: boolean;
  likes_count: number;
}

export type ICommentResponse = IApiResponse<IComment, "comments">;

/**
 * Các hành động Admin có thể thực hiện trên từng Tag pending
 * Khớp hoàn toàn với TagApprovalAction tại Backend
 */
export type TagApprovalAction =
  | "approve_and_add_topic" // Duyệt cho bài và gán Tag vào Topic post-topic
  | "approve_and_mark_free" // Duyệt cho bài và biến Tag thành thẻ chung
  | "approve_topic_and_reject_from_post" // Duyệt Tag vào Topic hệ thống nhưng KHÔNG gắn vào bài
  | "approve_global_and_reject_from_post" // Duyệt Tag vào hệ thống chung nhưng KHÔNG gắn vào bài
  | "reject_tag";

/**
 * Cấu trúc hành động cho từng Tag đơn lẻ
 */
export interface IPendingTagAction {
  tagId: string;
  action: TagApprovalAction;
}

/**
 * Body gửi lên API POST /api/posts/admin/approve/:id
 */
export interface IAdminApprovePostBody {
  newPostStatus: "approved" | "rejected";
  pendingTagActions: IPendingTagAction[];
  keepTagIds: string[]; // Danh sách ID các Tag cũ (đã approved) muốn giữ lại
}

export type PostStatusAction = "approved" | "rejected";

export interface DecisionCardProps {
  id: string;
  value: PostStatusAction;
  label: string;
  desc: string;
  isActive: boolean;
  isDestructive?: boolean;
}
