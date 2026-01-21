"use client";

import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TagFormActions } from "../components/TagForm/TagFormAction";
import { useUpdateTag } from "../hooks/useUpdateTag";
import { useTagDetail } from "../hooks/useTagDetail";
import { TagInput, tagSchema } from "../schemas/tagSchemas";
import { TagFormContent } from "../components/TagForm/TagFormContent";
import { useAdminTopicsQuery } from "@/modules/topic/hooks/useAdminTopicsQuery";
import { ICreateTagBody } from "../types"; // Import Interface này
import { Loader2 } from "lucide-react";

interface UpdateTagContainerProps {
  tagId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function UpdateTagContainer({
  tagId,
  onSuccess,
  onCancel,
}: UpdateTagContainerProps) {
  const { data: topicsData } = useAdminTopicsQuery({
    status: "approved",
  });
  const { data: tag, isLoading: isFetching } = useTagDetail(tagId);
  const { mutate, isPending } = useUpdateTag();
  console.log(tag);
  const currentTopicId =
    typeof tag?.topic === "object" ? tag?.topic?.topicId : tag?.topic;

  const methods = useForm<TagInput>({
    resolver: zodResolver(tagSchema),
    mode: "onSubmit",
    // SỬ DỤNG 'values' THAY VÌ 'defaultValues' + 'useEffect reset'
    values: tag
      ? {
          name: tag.name || "",
          topicId: currentTopicId || "",
          status: tag.status || "pending",
        }
      : undefined,
  });

  const handleManualSubmit = async () => {
    methods.clearErrors();
    const isValid = await methods.trigger();

    if (isValid) {
      const values = methods.getValues();

      // Khai báo payload với kiểu dữ liệu rõ ràng thay vì any
      const body: ICreateTagBody = {
        name: values.name,
        status: values.status,
        topicId: values.topicId || null,
        // Lưu ý: Nếu ICreateTagBody của bạn không có description,
        // hãy bổ sung nó vào Interface hoặc xử lý Partial tại service
      };

      mutate(
        { id: tagId, body },
        {
          onSuccess: () => {
            onSuccess?.();
          },
        },
      );
    }
  };

  if (isFetching && !tag) {
    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Đang tải thông tin thẻ...
        </p>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="space-y-4">
        <TagFormContent
          control={methods.control}
          topics={topicsData?.topics || []}
          isLoading={isPending || isFetching}
        />

        <TagFormActions
          isPending={isPending}
          onCancel={onCancel || (() => methods.reset())}
          submitText="Cập nhật thẻ"
          onCustomSubmit={handleManualSubmit}
        />
      </div>
    </FormProvider>
  );
}
