// src/modules/posts/containers/PostListContainer.tsx (Đã sửa)
"use client";
import Chip from "@/components/ui/Chip";
import { usePostsQuery } from "../hooks/usePostsQuery";
import Button from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import FilterButtons from "@/components/shared/FilterButtons";
import PostActions from "@/components/shared/PostActions";
import PopularTagsList from "@/components/shared/PopularTagsList";
import TrendingPosts from "@/components/shared/TrendingPosts";
import NotificationBlock from "@/components/shared/NotificationBlock";
import SearchForm from "@/components/ui/SearchForm";

export function PostListContainer() {
  const { data: posts, isLoading, isError } = usePostsQuery();

  // ... (Code kiểm tra isLoading và isError không đổi)

  if (isError) {
    // Tùy chọn: Log lỗi để debug
    // console.error(error);
    return <div>Đã xảy ra lỗi khi tải bài viết!</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Danh sách Bài viết</h2>

      {/* THÊM KIỂM TRA: posts phải tồn tại và phải là một Array */}
      {posts && Array.isArray(posts) ? (
        posts.map((post) => (
          <div key={post.postId} className="border p-3 my-2 bg-gray-50">
            <h3 className="text-lg font-semibold">{post.title}</h3>
          </div>
        ))
      ) : (
        // Hiển thị thông báo hoặc spinner nếu data không phải là mảng
        <p>Không có bài viết nào được tìm thấy hoặc dữ liệu không hợp lệ.</p>
      )}

      <Button>New Post</Button>

      <Avatar
        src="/path/to/author-image.jpg"
        alt="John Smith"
        size="md"
        isOnline={true}
        hasRing={true} // <-- BẬT VIỀN TRẮNG
      />

      {/* // Ví dụ 2: Avatar Fallback (size lg, có trạng thái Online - Khối User Status)
        <Avatar 
        alt="User Name (Admin)" 
        size="lg" 
        isOnline={true} 
        /> */}
      <div className="space-x-1">
        {/* Tag React sử dụng variant 'tech' */}
        <Chip variant="tech">React</Chip>

        {/* Tag Performance sử dụng variant 'performance' */}
        <Chip variant="performance">Performance</Chip>
      </div>

      <FilterButtons></FilterButtons>
      <PostActions></PostActions>
      <PopularTagsList></PopularTagsList>
      <TrendingPosts></TrendingPosts>
      <NotificationBlock></NotificationBlock>
      <SearchForm></SearchForm>
    </div>
  );
}
