"use client";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TopicFormContent } from "../components/TopicForm/TopicFormContent";
import { TopicFormActions } from "../components/TopicForm/TopicFormAction";
import { useCreateTopic } from "../hooks/useCreateTopic";
import { TopicInput, topicSchema } from "../schemas/topicSchemas";

interface CreateTopicContainerProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateTopicContainer({
  onSuccess,
  onCancel,
}: CreateTopicContainerProps) {
  const { mutate, isPending } = useCreateTopic();

  const methods = useForm<TopicInput>({
    resolver: zodResolver(topicSchema),
    defaultValues: { name: "", description: "", status: "approved" },
    mode: "onSubmit", // Đổi về onSubmit để trigger xử lý tập trung
    reValidateMode: "onChange",
    shouldFocusError: true, // Ép focus vào lỗi đầu tiên (giúp trigger render)
  });

  const handleManualSubmit = async () => {
    // Clear các lỗi cũ trước khi trigger mới để tạo cảm giác "refresh" đồng loạt
    methods.clearErrors();

    // Ép trigger chạy
    const result = await methods.trigger();

    if (!result) {
      // Nếu có lỗi, log để check xem lúc này errors đã đủ chưa
      console.log("All Errors:", methods.formState.errors);
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
        <TopicFormContent isLoading={isPending} />
        <TopicFormActions
          isPending={isPending}
          onCancel={onCancel || (() => methods.reset())}
          submitText="Tạo chủ đề"
          onCustomSubmit={handleManualSubmit} // Truyền hàm xử lý thủ công
        />
      </div>
    </FormProvider>
  );
}
