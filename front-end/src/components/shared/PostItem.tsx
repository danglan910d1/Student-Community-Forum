import { PostItemData } from "@/constants/posts";
import { Card, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { CheckCircle2, Eye, MessageSquare } from "lucide-react"; // Import icon

export const PostItem = ({
  title,
  description,
  author,
  views,
  commentCount,
  isResolved,
  tags,
}: PostItemData) => {
  return (
    <Card className="w-full hover:shadow-lg cursor-pointer hover:bg-muted py-3">
      <CardHeader className="px-4">
        {/* Tiêu đề bài viết - Thêm dấu check nếu resolved */}
        <CardTitle className="text-title text-[17px] font-bold flex items-center gap-1 overflow-hidden">
          {isResolved && (
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
          )}
          <span className="truncate flex-1">{title}</span>
        </CardTitle>

        {/* Nội dung chi tiết */}
        <CardDescription className="text-sm text-foreground line-clamp-3 mt-2 pt-2 border-t">
          {description}
        </CardDescription>

        {/* Thông tin bổ sung (Metadata) */}
        <div className="text-xs text-secondary-foreground mt-2 flex justify-between items-center border-t pt-2">
          <div className="flex items-center gap-2">
            <span>
              Đăng bởi{" "}
              <span className="text-sm text-blue-700 hover:underline mx-1">
                {author}
              </span>
            </span>
            <span className="text-gray-300">|</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> {views}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" /> {commentCount}
              </span>
            </div>
          </div>

          <div className="flex gap-1.5">
            {tags.map((tag) => (
              <Badge
                className="hover:bg-blue-200"
                variant={"outline"}
                key={tag.label}
              >
                {tag.label}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};
