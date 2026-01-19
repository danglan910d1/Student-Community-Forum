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
  user?: IAuthor;
  status?: GlobalStatus;
  _count?: {
    posts: number;
    tags: number;
  };
}

export interface IGetTopicsParams extends IGetListParams {
  startDate?: string; // ISO String hoặc YYYY-MM-DD
  endDate?: string;
} // Chỉ Public Get

export interface IGetAdminTopicsParams extends IGetTopicsParams {
  status?: GlobalStatus;
  showDeleted?: boolean;
}

export type ITopicResponse = IApiResponse<ITopic, "topics">;
