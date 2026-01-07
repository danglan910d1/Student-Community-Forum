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

export interface IGetAdminTagsParams extends IGetTagsParams {
  status?: GlobalStatus;
  showDeleted?: boolean;
}

export type ITagResponse = IApiResponse<ITag, "tags">;

export interface TopicWithTags extends ITopic {
  tags: ITag[];
}
