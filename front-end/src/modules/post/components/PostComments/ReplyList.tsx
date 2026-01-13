import { Loader2 } from "lucide-react";
import { useReplies } from "../../hooks/useComments";
import { CommentItem } from "./CommentItem";
import { Button } from "@/components/ui/button";

export function ReplyList({
  postId,
  parentId,
  onReply,
  onUpdate, // 1. Thêm onUpdate vào props
}: {
  postId: string;
  parentId: string;
  onReply: (content: string, pId: string) => Promise<unknown>;
  onUpdate: (content: string, commentId: string) => Promise<unknown>; // 2. Định nghĩa kiểu dữ liệu
}) {
  const { replies, hasNextPage, fetchNextPage, isFetchingNextPage, isLoading } =
    useReplies(postId, parentId);

  if (isLoading) {
    return (
      <div className="text-xs text-muted-foreground flex items-center gap-2">
        <Loader2 className="w-3 h-3 animate-spin" /> Đang tải phản hồi...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {replies.map((reply) => (
        <CommentItem
          key={reply.commentId}
          comment={reply}
          onReply={onReply}
          onUpdate={onUpdate} // 3. Truyền onUpdate xuống CommentItem
        />
      ))}

      {hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full px-8 text-xs font-semibold transition-all"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin mr-2" />
                Đang tải...
              </>
            ) : (
              "Xem thêm phản hồi"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
