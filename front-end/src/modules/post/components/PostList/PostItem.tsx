import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Eye, MessageSquare } from "lucide-react"; // Import icon
import { IPost } from "../../types";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import MDEditor from "@uiw/react-md-editor";
import { LoginGuard } from "@/components/shared/LoginGuarđialog";
import { LikeButton } from "@/components/shared/LikeButton";
import { useLike } from "../../hooks/useLike";

export const PostItem = ({
  postId,
  slug,
  title,
  content,
  user,
  views_count,
  likes_count,
  comments_count,
  is_resolved,
  createdAt,
  tags,
}: IPost) => {
  const postDetailHref = `/posts/${postId}/${slug}`;

  // Sử dụng Hook Like cho từng Item
  const { isLiked, likesCount, toggleLike } = useLike({
    targetType: "post",
    targetId: postId,
    initialLikesCount: likes_count,
  });

  return (
    <Card className="group relative hover:shadow-lg cursor-pointer hover:bg-muted py-3 transition-all">
      <CardHeader className="px-5">
        <CardTitle className="text-xl font-bold flex items-center gap-1 overflow-hidden">
          {is_resolved && (
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
          )}
          <Link
            href={postDetailHref}
            className="truncate flex-1 line-clamp-2 after:absolute after:inset-0 after:z-0"
          >
            {title}
          </Link>
        </CardTitle>

        <CardDescription className="text-sm text-foreground mt-2 pt-2 border-t">
          <div
            data-color-mode="light"
            className="line-clamp-5 overflow-hidden pointer-events-none"
          >
            <MDEditor.Markdown
              source={content}
              style={{
                backgroundColor: "transparent",
                fontSize: "0.875rem",
                color: "var(--foreground)",
              }}
            />
          </div>
        </CardDescription>

        <div className="text-xs text-secondary-foreground mt-2 flex justify-between items-center border-t pt-2 relative z-10">
          <div className="flex items-center gap-2">
            <span>
              Đăng bởi:
              <Link
                href={`/profile/${user.userId}`}
                className="text-sm text-blue-700 hover:underline mx-1 relative z-20"
              >
                {user.name}
              </Link>
            </span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </span>
            <span className="hidden sm:inline text-gray-300">|</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> {views_count}
              </span>
              <LoginGuard
                title="Thảo luận bài viết"
                description="Đăng nhập để tham gia bình luận và giải đáp thắc mắc."
              >
                <Link
                  href={`${postDetailHref}#comments`}
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> {comments_count}
                </Link>
              </LoginGuard>

              {/* LIKE: Xử lý tại chỗ */}
              <LoginGuard
                title="Yêu thích bài viết"
                description="Đăng nhập để lưu bài viết và ủng hộ tác giả."
              >
                <LikeButton
                  isLiked={isLiked}
                  likesCount={likesCount}
                  onLike={toggleLike}
                  className="h-auto p-0 text-pink-600"
                />
              </LoginGuard>
            </div>
          </div>

          <div className="flex gap-1.5 relative z-20">
            {tags.map((tag) => (
              <Badge
                key={tag.tagId}
                className="hover:bg-blue-200 cursor-pointer"
                variant={"outline"}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Link href={`/posts?tag=${tag.slug}`}>{tag.name}</Link>
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};
