import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { IPost } from "../../types";
import Link from "next/link";

export function PostDetailAside({ post }: { post: IPost }) {
  return (
    <aside className="space-y-6">
      <div className="p-4 border rounded-xl bg-card">
        <h4 className="text-sm font-bold uppercase text-muted-foreground mb-4">
          Thông tin bổ sung
        </h4>

        <div className="space-y-4">
          {/* CHỦ ĐỀ */}
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground uppercase font-bold">
              Chủ đề
            </span>
            <br />
            <Link
              href={`/posts?topic=${post.topic?.slug}`}
              className="text-sm font-medium hover:underline cursor-pointer"
            >
              {post.topic?.name || "Đang cập nhật"}
            </Link>
          </div>

          <Separator />

          {/* TRẠNG THÁI */}
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground uppercase font-bold block">
              Trạng thái
            </span>
            <Badge
              variant={post.is_resolved ? "default" : "warning"}
              className={
                post.is_resolved ? "bg-green-600 hover:bg-green-600" : ""
              }
            >
              {post.is_resolved ? "Đã giải quyết" : "Đang chờ giải đáp"}
            </Badge>
          </div>
        </div>
      </div>
    </aside>
  );
}
