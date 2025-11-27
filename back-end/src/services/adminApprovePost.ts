import { Types, startSession } from "mongoose";
import Post, { IPost } from "../models/Post";
import Tag, { ITag } from "../models/Tag";

export type TagApprovalAction =
  | "approve_post_only" // Chỉ approve cho bài viết này, không đổi status Tag global
  | "approve_and_add_topic" // Approve cho bài viết và thêm topicId vào Tag (nếu Tag đang pending hoặc chưa có topic)
  | "approve_and_mark_free" // Approve cho bài viết và đánh dấu Tag là free/global
  | "reject_tag_from_post"; // Loại tag ra khỏi pending_tags của Post

export interface PendingTagAction {
  tagId: string;
  action: TagApprovalAction;
}

// Hàm Audit Log có thể thay bằng DB
const auditLog = async (
  adminId: string,
  postId: string,
  tagId: string,
  action: TagApprovalAction
) => {
  // console.log hiện tại, có thể thay bằng TagOverrideLog.create(...)
  console.log(
    `[AUDIT LOG] Admin ${adminId} executed "${action}" on Tag ${tagId} for Post ${postId}`
  );
};

export const adminApprovePost = async (
  postId: string,
  adminId: string,
  pendingTagActions: PendingTagAction[],
  newPostStatus: "approved" | "rejected"
): Promise<IPost> => {
  const session = await startSession();
  session.startTransaction();

  try {
    const post = await Post.findById(postId).session(session);
    if (!post) throw new Error("Post not found.");

    // 1. Lấy các Tag pending
    const tagsToProcess = await Tag.find({
      _id: { $in: post.pending_tags },
    }).session(session);

    const tagsMap = new Map(
      tagsToProcess.map((t) => [(t._id as Types.ObjectId).toString(), t])
    );
    const validTagIdsToAdd: Types.ObjectId[] = [];
    const tagsToUpdateModel: { [key: string]: Partial<ITag> } = {};

    // 2. Duyệt từng tag theo quyết định Admin
    for (const actionItem of pendingTagActions) {
      const { tagId, action } = actionItem;
      const tag = tagsMap.get(tagId);
      if (!tag) continue;

      await auditLog(adminId, postId, tagId, action);

      // Hard rule: tag phải approved globally
      if (tag.status !== "approved") {
        console.warn(
          `Tag ${tag.name} (ID: ${tagId}) not approved globally. Skipped.`
        );
        continue;
      }

      // Hành động approve
      if (action.startsWith("approve")) {
        validTagIdsToAdd.push(tag._id as Types.ObjectId);

        // Scope learning
        if (action === "approve_and_add_topic")
          tagsToUpdateModel[tagId] = { topicId: post.topicId };
        if (action === "approve_and_mark_free")
          tagsToUpdateModel[tagId] = { topicId: null };
      }
      // reject_tag_from_post => chỉ bỏ qua
    }

    // 3. Cập nhật Tag Model
    const tagUpdatePromises = Object.entries(tagsToUpdateModel).map(
      ([id, updates]) =>
        Tag.updateOne({ _id: id }, { $set: updates }).session(session)
    );
    await Promise.all(tagUpdatePromises);

    // 4. Cập nhật Post
    post.tags = Array.from(new Set([...post.tags, ...validTagIdsToAdd])); // loại trùng
    post.pending_tags = [];
    post.status = newPostStatus;
    post.updatedAt = new Date();

    await post.save({ session });
    await session.commitTransaction();

    return post;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
