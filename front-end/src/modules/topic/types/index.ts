import {
  GlobalStatus,
  IApiResponse,
  IAuthor,
  IGetListParams,
} from "@/types/common";

export interface ITopic {
  topicId: string;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
  updatedAt: string;

  // Pipeline của bạn: Admin mới thấy người tạo topic
  user?: IAuthor;
  status?: GlobalStatus;
}

export type IGetTopicsParams = IGetListParams; // Chỉ Public Get

export interface IGetAdminTopicsParams extends IGetTopicsParams {
  status?: GlobalStatus;
  showDeleted?: boolean;
}

export type ITopicResponse = IApiResponse<ITopic, "topics">;
