"use client";

import { useForm } from "react-hook-form";
import MultiAutocomplete, { Tag } from "@/components/shared/MultiAutoComplete";

// 1. Định nghĩa kiểu dữ liệu cho Form
interface FormValues {
  postTags: Tag[];
}

const API_RESPONSE_TOPIC = {
  tags: [
    {
      tagId: "694fb7b6c8f8467da964b122",
      name: "Algorithms",
      slug: "algorithms",
      topic: { name: "Lập trình & Thuật toán" },
    },
    {
      tagId: "694fb7b6c8f8467da964b121",
      name: "C++",
      slug: "c-plus-plus",
      topic: { name: "Lập trình & Thuật toán" },
    },
  ],
};

const API_RESPONSE_SYSTEM = {
  tags: [
    { tagId: "sys-1", name: "Thảo luận", slug: "thao-luan" },
    { tagId: "sys-2", name: "Hỏi đáp", slug: "hoi-dap" },
  ],
};

export function TagSelectorPage() {
  // 2. Khởi tạo React Hook Form
  const { control, watch, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      postTags: [], // Giá trị mặc định là mảng rỗng
    },
  });

  // Watch để theo dõi thay đổi và hiển thị dữ liệu test bên dưới
  const currentTags = watch("postTags");

  const topicId = "694fb63a35a29c5eff0b8858";

  const topicTagsFE: Tag[] = API_RESPONSE_TOPIC.tags.map((t) => ({
    tagId: t.tagId,
    name: t.name,
    slug: t.slug,
  }));

  const systemTagsFE: Tag[] = API_RESPONSE_SYSTEM.tags.map((t) => ({
    tagId: t.tagId,
    name: t.name,
    slug: t.slug,
  }));

  const onSubmit = (data: FormValues) => {
    console.log("Dữ liệu gửi đi:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <MultiAutocomplete
        name="postTags"
        control={control}
        disabled={!topicId}
        topicTags={topicTagsFE}
        systemTags={systemTagsFE}
        max={5}
        placeholder="Tìm kiếm hoặc nhập tag mới..."
      />

      <div className="bg-gray-50 p-3 rounded text-xs border mt-3">
        <p className="font-bold mb-1 uppercase text-gray-500">
          Dữ liệu trong React Hook Form:
        </p>
        <pre>{JSON.stringify(currentTags, null, 2)}</pre>
      </div>

      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm"
      >
        Lưu bài viết
      </button>
    </form>
  );
}
