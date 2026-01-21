// modules/tag/containers/CreateTagContainer.tsx
"use client";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { TagFormActions } from "../components/TagForm/TagFormAction";
import { useCreateTag } from "../hooks/useCreateTag";

import { useAdminTopicsQuery } from "@/modules/topic/hooks/useAdminTopicsQuery";
import { TagInput, tagSchema } from "../schemas/tagSchemas";
import { TagFormContent } from "../components/TagForm/TagFormContent";

interface CreateTagContainerProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateTagContainer({
  onSuccess,
  onCancel,
}: CreateTagContainerProps) {
  // 1. Lấy danh sách Topic để truyền xuống Form Content
  const { data: topicsData } = useAdminTopicsQuery({
    status: "approved",
    limit: 100,
  });

  const { mutate, isPending } = useCreateTag();

  const methods = useForm<TagInput>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      name: "",
      topicId: "", // Mặc định là chuỗi rỗng (Thẻ hệ thống)
      status: "approved", // Admin tạo thì thường để approved luôn
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: true,
  });

  const handleManualSubmit = async () => {
    methods.clearErrors();
    const result = await methods.trigger();

    if (!result) {
      console.log("Validation Errors:", methods.formState.errors);
    } else {
      const data = methods.getValues();
      mutate(data, {
        onSuccess: () => {
          onSuccess?.();
          methods.reset();
        },
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="space-y-4">
        {/* Truyền cả control và topics xuống theo đúng interface của TagFormContent */}
        <TagFormContent
          control={methods.control}
          topics={topicsData?.topics || []}
          isLoading={isPending}
        />

        <TagFormActions
          isPending={isPending}
          onCancel={onCancel || (() => methods.reset())}
          submitText="Tạo thẻ mới"
          onCustomSubmit={handleManualSubmit}
        />
      </div>
    </FormProvider>
  );
}
