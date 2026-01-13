import { IComment } from "../../types";
import { CommentInput } from "./CommentInput";
import { CommentItem } from "./CommentItem";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquare } from "lucide-react";

interface CommentSectionProps {
  comments: IComment[];
  total: number;
  onAddComment: (content: string, parentId?: string | null) => Promise<unknown>;
  onUpdateComment: (content: string, commentId: string) => Promise<unknown>; // Định nghĩa type
  hasNextPage: boolean;
  onLoadMore: () => void;
  isFetchingNextPage: boolean;
}

export function CommentSection({
  comments,
  total,
  onAddComment,
  hasNextPage,
  onLoadMore,
  isFetchingNextPage,
  onUpdateComment,
}: CommentSectionProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 font-bold text-lg border-b pb-4">
        {/* Đổi màu từ hồng sang màu mặc định của text/primary */}
        <MessageSquare className="w-5 h-5 text-foreground" />
        <h3>Bình luận</h3>
        <span className="text-xs bg-muted px-2.5 py-1 rounded-full text-muted-foreground font-medium">
          {total}
        </span>
      </div>

      <div className="animate-in fade-in slide-in-from-top-2 duration-300">
        <CommentInput onSubmit={(val) => onAddComment(val)} />
      </div>

      <div className="space-y-6 pt-2">
        {comments.map((comment) => (
          <CommentItem
            onUpdate={onUpdateComment}
            key={comment.commentId}
            comment={comment}
            onReply={(val, pId) => onAddComment(val, pId)}
          />
        ))}

        {comments.length === 0 && !isFetchingNextPage && (
          <div className="text-center py-10 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
            <p className="text-sm">
              Chưa có bình luận nào. Hãy bắt đầu cuộc trò chuyện!
            </p>
          </div>
        )}
      </div>

      {hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full px-8 text-xs font-semibold transition-all"
            onClick={onLoadMore}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin mr-2" />
                Đang tải...
              </>
            ) : (
              "Xem thêm bình luận"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
