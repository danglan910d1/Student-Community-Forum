"use client";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { TopicFormContent } from "../components/TopicForm/TopicFormContent";
import { TopicFormActions } from "../components/TopicForm/TopicFormAction";
import { useUpdateTopic } from "../hooks/useUpdateTopic";
import { useTopicData } from "../hooks/useTopicData";
import { TopicInput, topicSchema } from "../schemas/topicSchemas";
import { Loader2 } from "lucide-react";

interface UpdateTopicContainerProps {
  topicId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function UpdateTopicContainer({
  topicId,
  onSuccess,
  onCancel,
}: UpdateTopicContainerProps) {
  const { mutate: updateTopic, isPending: isUpdating } = useUpdateTopic();
  const { data: topic, isLoading } = useTopicData(topicId);

  const methods = useForm<TopicInput>({
    resolver: zodResolver(topicSchema),
    defaultValues: { name: "", description: "", status: "approved" },
    mode: "onSubmit",
  });

  // Khi có dữ liệu topic từ API, cập nhật vào form
  useEffect(() => {
    if (topic) {
      methods.reset({
        name: topic.name,
        description: topic.description || "",
        status: topic.status,
      });
    }
  }, [topic, methods]);

  const handleManualSubmit = async () => {
    methods.clearErrors();
    const result = await methods.trigger();

    if (result) {
      const body = methods.getValues();
      updateTopic(
        { id: topicId, body },
        {
          onSuccess: () => {
            onSuccess?.();
          },
        },
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-10 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Đang tải dữ liệu chủ đề...
        </p>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="space-y-4">
        <TopicFormContent isLoading={isUpdating} />
        <TopicFormActions
          isPending={isUpdating}
          onCancel={onCancel || (() => methods.reset())}
          submitText="Cập nhật chủ đề"
          onCustomSubmit={handleManualSubmit}
        />
      </div>
    </FormProvider>
  );
}
