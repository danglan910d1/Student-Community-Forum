import { PostStatus } from "../models/Post";
import { TagApprovalAction } from "../services/adminApprovePost";
import { CommonQuery } from "../services/buildCommonFilter";

// 1. Dùng cho Params (Lấy chi tiết, cập nhật, xóa)
export interface PostParams {
  id: string;
}

// 2. Dùng cho POST /posts (Tạo bài viết)
export interface CreatePostBody {
  topicId: string;
  tags?: string[]; // Mảng ID Tags (string)
  title: string;
  content: string;
}

export interface GetPostsQuery extends CommonQuery {
  topicId?: string; // Trường đặc thù
  tagId?: string; // Trường đặc thù
}

// 4. Dùng cho PUT /posts/:id (Cập nhật)
export interface UpdatePostBody {
  topicId?: string;
  tags?: string[];
  title?: string;
  content?: string;
  status?: PostStatus; // Dành cho Admin
  is_sticky?: boolean; // Dành cho Admin
}

// Định nghĩa hành động cụ thể cho từng Tag
export interface PendingTagAction {
  tagId: string; // ID của Tag đang pending
  action: TagApprovalAction; // Hành động của Admin (ví dụ: "approve_and_mark_free")
}

/**
 * Cấu trúc Body cho request duyệt bài của Admin (Giai đoạn 3).
 */
export interface AdminApprovePostBody {
  // Mảng chứa các quyết định của Admin trên TỪNG Tag đang pending.
  pendingTagActions: PendingTagAction[];

  // Trạng thái cuối cùng của Bài viết sau khi duyệt Tag xong.
  newPostStatus: "approved" | "rejected";
}
