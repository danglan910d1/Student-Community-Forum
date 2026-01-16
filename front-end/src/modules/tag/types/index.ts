import { ITopic } from "@/modules/topic/types";
import {
  IApiResponse,
  IAuthor,
  GlobalStatus,
  IBaseMetadata,
  IGetListParams,
} from "@/types/common";

export interface ITag extends IBaseMetadata {
  tagId: string;
  createdAt: string;
  updatedAt: string;

  // Topic: Pipeline dùng $let + $arrayElemAt trả về Object hoặc ID
  topic: (IBaseMetadata & { topicId: string }) | string | null;
  postCount: number;
  // User: Pipeline trả về thông tin người tạo (createdBy) dưới dạng Object IAuthor
  user?: IAuthor | string;

  // Admin Only: Hiện ra nhờ isAdminView trong pipeline
  status?: GlobalStatus;
}

// Params đặc thù cho Tag (kế thừa từ IGetListParams bạn đã chốt)
export interface IGetTagsParams extends IGetListParams {
  topicId?: string; // Hỗ trợ lọc tag theo chuyên mục hoặc "null"
}

export interface IGetTagsRequestParams extends IGetTagsParams {
  adminView?: boolean;
}

export interface IGetAdminTagsParams extends IGetTagsParams {
  status?: GlobalStatus;
  showDeleted?: boolean;
}

export type ITagResponse = IApiResponse<ITag, "tags">;

export interface TopicWithTags extends ITopic {
  tags: ITag[];
}

/**
 * Body dùng để Admin tạo Tag mới hoặc cập nhật Tag lẻ
 */
export interface ICreateTagBody {
  name: string;
  topicId: string | null; // null nếu là Thẻ hệ thống (System Tag)
  status?: GlobalStatus;
}

/**
 * Body dùng cho chức năng xử lý hàng loạt của Admin
 * (Duyệt/Từ chối/Xóa nhiều tag cùng lúc)
 */
export interface IBulkUpdateTagBody {
  tagIds: string[];
  action: "approve" | "reject" | "delete" | "restore";
  topicId?: string; // Tùy chọn: Chuyển hàng loạt tag sang topic khác
}

export interface Tag {
  tagId: string;
  name: string;
  slug: string;
}
