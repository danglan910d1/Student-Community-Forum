import { CardLayout } from "@/components/layout/CardLayout";
import { POPULAR_TAGS_DATA } from "@/constants/tags";
import { TagItem } from "@/modules/tag/components/TagItem";

export const PopularTags = () => {
  return (
    <CardLayout className="h-full p-1">
      {/* 1. Tiêu đề cố định bên trên */}
      <div className="p-3 border-b flex-shrink-0">
        <h3 className="text-sm font-bold text-title border-l-4 border-blue-500 pl-2 uppercase tracking-tight">
          Popular Tags
        </h3>
      </div>

      {/* 2. Vùng nội dung cuộn */}
      <div className="flex-1 overflow-y-auto px-1 custom-scrollbar">
        <div className="flex flex-col pt-1">
          {POPULAR_TAGS_DATA.map((tag, index) => (
            <TagItem
              key={tag.name + index}
              icon={tag.icon}
              name={tag.name}
              count={tag.count}
              isTrending={tag.isTrending}
              colorClass={tag.colorClass}
            />
          ))}
        </div>
      </div>

      {/* 3. Phần đệm cố định bên dưới (Giống tiêu đề nhưng ở dưới) */}
      <div className="flex-shrink-0 border-t h-3 w-full rounded-b-xl" />
    </CardLayout>
  );
};
