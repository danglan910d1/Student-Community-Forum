"use client";

import * as React from "react";
import { Tag, RefreshCcw, SearchX } from "lucide-react";
import { useTagsExplorer } from "../hooks/useTagExplorer";
import { TagSearchHeader } from "../components/TagSearch";
import { TopicSection } from "@/modules/topic/components/TopicSection";
import ContentPageSkeleton from "@/components/loading/ContentPageSkeleton";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EmptyState } from "@/components/shared/EmtyState";
import { CardLayout } from "@/components/layout/CardLayout";

export default function TagsPageContainer() {
  const { data, systemTags, isLoading, isError } = useTagsExplorer();
  const [searchTerm, setSearchTerm] = React.useState("");
  const { toast } = useToast();

  // Hiển thị toast khi có lỗi
  React.useEffect(() => {
    if (isError) {
      toast({
        variant: "destructive",
        title: "Lỗi tải dữ liệu",
        description: "Không thể kết nối với máy chủ để lấy danh sách thẻ.",
      });
    }
  }, [isError, toast]);

  const filteredData = React.useMemo(() => {
    const safeData = data || [];
    const safeSystemTags = systemTags || [];

    const systemTopic = {
      topicId: "system",
      name: "Thẻ hệ thống",
      slug: "system",
      description: "Các thẻ chung được sử dụng toàn hệ thống",
      tags: safeSystemTags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const allGroups = [systemTopic, ...safeData];

    return allGroups
      .map((group) => ({
        ...group,
        tags: group.tags.filter((tag) =>
          tag.name.toLowerCase().includes(searchTerm.toLowerCase())
        ),
      }))
      .filter((group) => group.tags.length > 0);
  }, [data, systemTags, searchTerm]);

  if (isLoading) {
    return <ContentPageSkeleton />;
  }

  if (isError) {
    return (
      <main className="container max-w-7xl mx-auto px-4 py-20">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <Tag className="h-4 w-4" />
          <AlertTitle>Đã xảy ra lỗi</AlertTitle>
          <AlertDescription className="mt-2 flex flex-col gap-4">
            Không thể tải dữ liệu thẻ lúc này. Vui lòng kiểm tra kết nối mạng.
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="w-fit"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Thử lại ngay
            </Button>
          </AlertDescription>
        </Alert>
      </main>
    );
  }

  return (
    <main>
      <CardLayout className="p-0 border-none shadow-sm">
        <div className="p-5 animate-in fade-in duration-700">
          <TagSearchHeader onSearch={setSearchTerm} />

          <div className="space-y-12 mt-8 px-5">
            {filteredData.length > 0 ? (
              filteredData.map((group) => (
                <TopicSection
                  key={`${group.topicId}-${searchTerm}`}
                  topic={group}
                />
              ))
            ) : (
              <EmptyState
                icon={SearchX}
                title="Không tìm thấy kết quả"
                description={`Rất tiếc, chúng tôi không tìm thấy thẻ nào khớp với từ khóa "${searchTerm}"`}
                actionLabel="Xóa tìm kiếm"
                onAction={() => setSearchTerm("")}
              />
            )}
          </div>
        </div>
      </CardLayout>
    </main>
  );
}
