"use client";

import React, { useState } from "react";
import { ChevronRight, ChevronLeft, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { TopicWithTags } from "@/modules/tag/types";
import { TagCard } from "@/modules/tag/components/TagCard";
import { Button } from "@/components/ui/button";

interface TopicSectionProps {
  topic: TopicWithTags;
  itemsPerPage?: number;
}

export function TopicSection({ topic, itemsPerPage = 3 }: TopicSectionProps) {
  const [currentPage, setCurrentPage] = useState(1);

  if (!topic.tags?.length) return null;

  const totalPages = Math.ceil(topic.tags.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleTags = topic.tags.slice(startIndex, startIndex + itemsPerPage);
  const isSystem = topic.topicId === "system";

  return (
    <section className="mb-12">
      {/* Header: Chỉ giữ Tiêu đề và Link xem tất cả */}
      <div className="flex items-center justify-between border-b pb-3 mb-6">
        <div className="flex items-center gap-2">
          {isSystem && <LayoutGrid size={20} className="text-primary/70" />}
          <h2 className="text-xl font-bold tracking-tight uppercase">
            {topic.name}
          </h2>
          <span className="text-base px-2 py-0.5 bg-secondary rounded-full border font-bold">
            {topic.tags.length}
          </span>
        </div>

        {!isSystem && (
          <Link
            href={`/posts?topic=${topic?.slug}`}
            className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline"
          >
            Khám phá thêm
            <ChevronRight size={14} />
          </Link>
        )}
      </div>

      {/* Grid Tags */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {visibleTags.map((tag) => (
          <TagCard key={tag.tagId} tag={tag} />
        ))}
      </div>

      {/* Pagination: Đưa xuống dưới cùng bên phải */}
      {totalPages > 1 && (
        <div className="flex justify-end mt-3">
          <div className="flex items-center gap-1 bg-muted/50 rounded-md border">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
            </Button>

            <span className="text-xs font-medium px-2 min-w-[50px] text-center">
              {currentPage} / {totalPages}
            </span>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
