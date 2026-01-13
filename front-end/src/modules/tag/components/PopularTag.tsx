import React from "react";
import { CardLayout } from "@/components/layout/CardLayout";
import { TagItem } from "@/modules/tag/components/TagItem";
import {
  Code,
  DollarSign,
  Palette,
  Lightbulb,
  Database,
  Server,
  Layout,
  Hash,
} from "lucide-react";
import { useTagsExplorer } from "../hooks/useTagExplorer";
import { useRouter } from "next/navigation";

const getTagMetaData = (tagName: string) => {
  const name = tagName.toLowerCase();
  if (
    name.includes("javascript") ||
    name.includes("react") ||
    name.includes("typescript")
  )
    return { icon: Code, colorClass: "blue" };
  if (
    name.includes("bitcoin") ||
    name.includes("crypto") ||
    name.includes("finance")
  )
    return { icon: DollarSign, colorClass: "orange" };
  if (name.includes("design") || name.includes("ui") || name.includes("ux"))
    return { icon: Palette, colorClass: "purple" };
  if (
    name.includes("backend") ||
    name.includes("node") ||
    name.includes("server")
  )
    return { icon: Server, colorClass: "orange" };
  if (
    name.includes("database") ||
    name.includes("sql") ||
    name.includes("mongodb")
  )
    return { icon: Database, colorClass: "blue" };
  if (
    name.includes("frontend") ||
    name.includes("html") ||
    name.includes("css")
  )
    return { icon: Layout, colorClass: "blue" };
  if (name.includes("innovation") || name.includes("idea"))
    return { icon: Lightbulb, colorClass: "green" };

  return { icon: Hash, colorClass: "green" };
};

export const PopularTags = () => {
  const router = useRouter();
  const { isLoading, allTags } = useTagsExplorer();
  // Xử lý logic sắp xếp và filter dữ liệu
  const processedTags = React.useMemo(() => {
    if (!allTags || allTags.length === 0) return [];

    // Copy mảng để tránh mutate dữ liệu gốc
    return [...allTags]
      .sort((a, b) => {
        const countA = Number(a.postCount) || 0;
        const countB = Number(b.postCount) || 0;

        if (countB !== countA) return countB - countA;
        return a.name.localeCompare(b.name, "vi");
      })
      .slice(0, 10);
  }, [allTags]);

  const handleTagClick = (tagName: string) => {
    // Chuyển hướng sang trang danh sách bài viết kèm filter tag
    // Bạn có thể dùng slug nếu API có hỗ trợ để URL đẹp hơn
    router.push(`/posts?tag=${encodeURIComponent(tagName)}`);
  };

  return (
    <CardLayout className="h-full p-1 flex flex-col">
      <div className="p-3 border-b flex-shrink-0">
        <h3 className="text-sm font-bold text-title border-l-4 border-blue-500 pl-2 uppercase tracking-tight">
          Popular Tags
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto px-1 custom-scrollbar">
        <div className="flex flex-col pt-1">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent animate-spin rounded-full" />
              Đang tải danh mục...
            </div>
          ) : processedTags.length > 0 ? (
            processedTags.map((tag, index) => {
              const meta = getTagMetaData(tag.name);

              // 4. Hai tag có số lượng bài viết cao nhất (index 0 và 1) sẽ là trending
              const isTrending = index < 2 && tag.postCount > 0;

              return (
                <div key={tag.tagId} onClick={() => handleTagClick(tag.slug)}>
                  <TagItem
                    icon={meta.icon}
                    name={tag.name}
                    count={tag.postCount.toLocaleString()}
                    isTrending={isTrending}
                    colorClass={meta.colorClass}
                  />
                </div>
              );
            })
          ) : (
            <div className="p-10 text-center text-xs text-muted-foreground">
              Chưa có thẻ nào được tạo
            </div>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 border-t h-2 w-full rounded-b-xl bg-gray-50/50" />
    </CardLayout>
  );
};
