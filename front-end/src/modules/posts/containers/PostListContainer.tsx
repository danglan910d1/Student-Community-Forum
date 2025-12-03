// src/modules/posts/containers/PostListContainer.tsx (Đã sửa)

'use client';

import { usePostsQuery } from '../hooks/usePostsQuery';

export function PostListContainer() {
    // Kiểu trả về: data: IPost[] | undefined
    const { data: posts, isLoading, isError } = usePostsQuery(); 

    if (isLoading) {
        return <div><span className="text-blue-500">Đang tải...</span></div>;
    }

    if (isError) {
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
        </div>
    );
}