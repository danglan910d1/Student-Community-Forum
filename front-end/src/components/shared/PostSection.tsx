"use client";
import React, { useEffect, useMemo, useState } from "react";
import { POSTS_DATA } from "@/constants/posts";
import { PAGINATION_CONFIG } from "@/constants/pagination";

// Components
import { Button } from "../ui/button";
import { PostItem } from "./PostItem";
import { CardLayout } from "../layout/CardLayout";
import { PaginationSection } from "./PaginationSection";
import { PostItemSkeleton } from "./PostItemSkeleton";
import { ContentFilter } from "./FilterMenu";

const POST_FILTERS = [
  { label: "Mới nhất", value: "new" },
  { label: "Phổ biến", value: "popular" },
  { label: "Đã Giải quyết", value: "resolved" },
];

export function MainSection() {
  const [filter, setFilter] = useState("new");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const postsPerPage = PAGINATION_CONFIG.postsPerPage;

  // 1. XỬ LÝ DỮ LIỆU: Filter và Sort trước
  const filteredPosts = useMemo(() => {
    let data = [...POSTS_DATA];

    // 1. Lọc theo trạng thái (Filter)
    if (filter === "resolved") {
      data = data.filter((p) => p.isResolved === true);
    }

    // 2. Sắp xếp (Sort)
    if (filter === "popular") {
      // Xếp theo views giảm dần
      data.sort((a, b) => b.views - a.views);
    } else {
      // Mặc định cho "new" và "resolved" là xếp theo thời gian mới nhất (hoặc ID)
      data.sort((a, b) => b.id - a.id);
    }

    return data;
  }, [filter]);

  // 2. PHÂN TRANG: Tính toán trên dữ liệu ĐÃ LỌC
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  const handleFilterChange = (value: string) => {
    // 1. Bật loading ngay khi bấm filter
    setIsLoading(true);

    // 2. Cập nhật filter và reset trang
    setFilter(value);
    setCurrentPage(1);

    // 3. Giả lập thời gian chờ để hiện Skeleton
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  const handlePageChange = (pageNumber: number) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setIsLoading(true);
    setCurrentPage(pageNumber);
    setTimeout(() => setIsLoading(false), 500);
  };

  return (
    <main className="h-full">
      <CardLayout className="p-5 shadow-md h-full">
        <div className="flex justify-between items-center pb-3 mb-3 border-b-2">
          <h2 className="text-title text-2xl font-bold">Danh sách Bài viết</h2>
          <Button variant="default">New Post</Button>
        </div>

        <ContentFilter
          totalCount={filteredPosts.length} // Lấy số lượng thực tế sau khi lọc
          options={POST_FILTERS}
          currentValue={filter}
          onFilterChange={handleFilterChange}
        />

        <div className="space-y-4">
          {isLoading
            ? Array.from({ length: postsPerPage }).map((_, i) => (
                <PostItemSkeleton key={i} />
              ))
            : currentPosts.map((post) => <PostItem key={post.id} {...post} />)}
        </div>

        <PaginationSection
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </CardLayout>
    </main>
  );
}
