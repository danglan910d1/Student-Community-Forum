import { PostDetailContainer } from "@/modules/post/containers/PostDetailContainer";
import { Metadata } from "next";
import { notFound } from "next/navigation";
// import { PostDetailContainer } from "@/modules/post/components/PostDetail/PostDetailConatiner";

interface PostPageProps {
  params: Promise<{
    id: string;
    slug: string;
  }>;
}

/**
 * 1. Tối ưu Metadata
 * Nên fetch nhẹ thông tin title từ API/DB ở đây nếu có thể để SEO chính xác 100%.
 * Nếu không, dùng slug như bạn là giải pháp "phòng hờ" tốt.
 */
export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;

  if (!slug) return { title: "Bài viết | DevForum" };

  const cleanTitle = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    title: `${cleanTitle} - DevForum`,
    description: `Thảo luận về ${cleanTitle} trên cộng đồng DevForum.`,
    openGraph: {
      title: cleanTitle,
      type: "article",
    },
  };
}

export default async function PostDetailPage({ params }: PostPageProps) {
  const { id } = await params;

  // Kiểm tra id hợp lệ sơ bộ (ví dụ id mongo hoặc uuid)
  if (!id) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Giữ logic Fetching trong Container là đúng. 
         Page đóng vai trò Entry Point cung cấp "Input" cho Container.
      */}

      <PostDetailContainer postId={id} />
    </main>
  );
}
