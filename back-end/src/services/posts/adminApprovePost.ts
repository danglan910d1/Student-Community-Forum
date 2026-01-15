import { Types, startSession } from "mongoose";
import Post, { IPost } from "../../models/Post";
import Tag, { ITag } from "../../models/Tag";

export type TagApprovalAction =
  // | "approve_post_only" // Chỉ approve cho bài viết này, không đổi status Tag global
  | "approve_and_add_topic" // Approve cho bài viết và thêm topicId vào Tag (nếu Tag đang pending hoặc chưa có topic)
  | "approve_and_mark_free" // Approve cho bài viết và đánh dấu Tag là free/global
  | "reject_tag_from_post" // Loại tag ra khỏi pending_tags của Post
  | "approve_topic_and_reject_from_post" // Duyệt tag vào topic nhưng không gắn vào bài
  | "approve_global_and_reject_from_post"; // Duyệt tag vào hệ thống nhưng không gắn vào bài

export interface PendingTagAction {
  tagId: string;
  action: TagApprovalAction;
}

/**
 * Định nghĩa interface cho các trường cần update của Tag
 * Giúp loại bỏ hoàn toàn "as any"
 */
interface TagUpdateFields {
  status: ITag["status"];
  topicId?: Types.ObjectId | null;
}

// Hàm ghi log thao tác của Admin (có thể lưu vào Database)
const auditLog = async (
  adminId: string,
  postId: string,
  tagId: string,
  action: TagApprovalAction
) => {
  console.log(
    `[AUDIT LOG] Admin ${adminId} executed "${action}" on Tag ${tagId} for Post ${postId}`
  );
};

export const adminApprovePost = async (
  postId: string,
  adminId: string,
  pendingTagActions: PendingTagAction[],
  newPostStatus: "approved" | "rejected",
  keepTagIds?: string[] // <-- Mảng chứa các ID Tag cũ mà Admin giữ lại
): Promise<IPost> => {
  // Khởi tạo phiên làm việc (session) để thực hiện transaction
  const session = await startSession();
  session.startTransaction();

  try {
    // Tìm bài viết cần duyệt
    const post = await Post.findById(postId).session(session);
    if (!post) throw new Error("Post not found.");

    // Kiểm tra Topic ID của bài viết (cần thiết để gán cho Tag nếu Admin yêu cầu)
    if (!post.topicId) throw new Error("Post does not have a valid Topic ID.");

    // 1. Lấy thông tin các Tag đang nằm trong danh sách chờ (pending_tags) của bài viết
    const tagsToProcess = await Tag.find({
      _id: { $in: post.pending_tags },
    }).session(session);

    // Chuyển danh sách Tag sang Map để truy xuất nhanh bằng string ID
    const tagsMap = new Map(
      tagsToProcess.map((t) => [(t._id as Types.ObjectId).toString(), t])
    );

    const validTagIdsToAdd: Types.ObjectId[] = [];
    const tagsToUpdateModel: Map<string, TagUpdateFields> = new Map();

    // 2. Duyệt từng hành động Admin gửi lên từ Body
    for (const actionItem of pendingTagActions) {
      const { tagId, action } = actionItem;
      const tag = tagsMap.get(tagId);

      if (!tag) {
        throw new Error(
          `Tag ID ${tagId} does not exist in the system or is not pending for this post.`
        );
      }

      // Ghi log hành động
      await auditLog(adminId, postId, tagId, action);

      // KIỂM TRA 1: Có thêm Tag này vào bài viết (post.tags) không?
      // Chỉ những action 'approve_post_only' hoặc 'approve_and_...' mới được gắn vào bài
      const isApprovedForPost = [
        // "approve_post_only",
        "approve_and_add_topic",
        "approve_and_mark_free",
      ].includes(action);

      if (isApprovedForPost) {
        validTagIdsToAdd.push(tag._id as Types.ObjectId);
      }

      // KIỂM TRA 2: Có cập nhật trạng thái Tag Model (Global) không?
      if (action.startsWith("approve")) {
        // Khởi tạo object cập nhật với kiểu dữ liệu an toàn (không dùng as any)
        const updateData: TagUpdateFields = { status: "approved" };

        if (
          action.includes("add_topic") ||
          action.includes("topic_and_reject")
        ) {
          // Gắn Tag vào Topic cụ thể
          updateData.topicId = new Types.ObjectId(post.topicId.toString());
        } else if (
          action.includes("mark_free") ||
          action.includes("global_and_reject")
        ) {
          // Biến Tag thành Global (không thuộc Topic nào)
          updateData.topicId = null;
        }

        // Nếu là 'approve_post_only', ta chỉ giữ status là 'approved' mà không thay đổi topicId hiện có
        tagsToUpdateModel.set(tagId, updateData);
      }

      // Với 'reject_tag_from_post', logic đơn giản là bỏ qua, không thêm vào validTagIdsToAdd
    }

    // 3. Thực hiện cập nhật các Tag Model đồng loạt
    const tagUpdatePromises = Array.from(tagsToUpdateModel.entries()).map(
      ([id, updates]) =>
        Tag.updateOne({ _id: id }, { $set: updates }).session(session)
    );
    await Promise.all(tagUpdatePromises);

    // 4. Cập nhật Model bài viết
    // Hợp nhất tags cũ của bài viết với danh sách tags mới vừa được duyệt (loại bỏ trùng lặp)
    const currentTags = keepTagIds
      ? keepTagIds
      : post.tags.map((id) => id.toString());
    const newTagsToAdd = validTagIdsToAdd.map((id) => id.toString());

    const finalTagsSet = new Set([...currentTags, ...newTagsToAdd]);

    post.tags = Array.from(finalTagsSet).map((id) => new Types.ObjectId(id));
    post.pending_tags = []; // Làm sạch danh sách chờ duyệt
    post.status = newPostStatus;
    post.updatedAt = new Date();

    await post.save({ session });

    // Hoàn tất Transaction
    await session.commitTransaction();
    return post;
  } catch (error) {
    // Nếu lỗi, hủy bỏ toàn bộ các thay đổi trong transaction (Rollback)
    await session.abortTransaction();
    console.error("Error during admin post approval:", error);
    throw error;
  } finally {
    // Kết thúc phiên làm việc
    session.endSession();
  }
};
