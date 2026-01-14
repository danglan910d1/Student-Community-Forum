"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { IPost } from "../../types";
import { Eye, MessageSquare, ThumbsUp } from "lucide-react";
import Link from "next/link";
import { MY_POST_FILTERS } from "../../constants/post";
import { getPostLink } from "../../utils/postQueryMapper";

interface PostDataTableProps {
  posts: IPost[];
  isMine: boolean;
  isAdminView?: boolean;
}

export function PostDataTable({
  posts,
  isMine,
  isAdminView,
}: PostDataTableProps) {
  return (
    <div className="rounded-md border bg-card">
      <div className="relative w-full overflow-x-auto">
        <Table className="min-w-[800px] w-full table-fixed">
          <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[30%]">Bài viết</TableHead>
              {isAdminView && (
                <TableHead className="w-[15%]">Tác giả</TableHead>
              )}
              <TableHead className="w-[15%] text-center">Trạng thái</TableHead>
              <TableHead className="w-[15%] text-center">Tương tác</TableHead>
              <TableHead className="w-[15%] text-center">Ngày đăng</TableHead>
              {isMine && (
                <TableHead className="w-[15%] text-right">Thao tác</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.length > 0 ? (
              posts.map((post) => (
                <TableRow
                  key={post.postId}
                  className="group hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="align-top py-4">
                    <div className="flex flex-col gap-1 w-full max-w-[250px]">
                      <Link
                        href={getPostLink(post, !!isAdminView, isMine)}
                        className="font-semibold hover:text-primary transition-colors whitespace-normal break-words leading-tight line-clamp-2"
                      >
                        {post.title}
                      </Link>

                      <span className="text-xs text-muted-foreground whitespace-normal opacity-80">
                        {post.topic?.name || "Chưa phân loại"}
                      </span>
                    </div>
                  </TableCell>
                  {isAdminView && (
                    <TableCell className="text-sm">
                      <span className="font-medium">{post.user?.name}</span>
                    </TableCell>
                  )}
                  <TableCell className="text-center align-top py-4">
                    <StatusBadge status={post.status} />
                  </TableCell>
                  <TableCell className="text-center align-top py-4">
                    <div className="flex items-center justify-center gap-3 text-muted-foreground">
                      {/* Lượt xem */}
                      <span
                        className="flex items-center gap-1 text-xs"
                        title="Lượt xem"
                      >
                        <Eye className="w-3.5 h-3.5" /> {post.views_count || 0}
                      </span>

                      {/* Lượt thích */}
                      <span
                        className="flex items-center gap-1 text-xs"
                        title="Lượt thích"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" /> {post.likes_count}
                      </span>

                      {/* Bình luận */}
                      <span
                        className="flex items-center gap-1 text-xs"
                        title="Bình luận"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />{" "}
                        {post.comments_count}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center align-top py-4 text-sm text-muted-foreground">
                    {format(new Date(post.createdAt), "dd/MM/yyyy", {
                      locale: vi,
                    })}
                  </TableCell>
                  {isMine && (
                    <TableCell className="text-right align-top py-4">
                      <Link
                        href={`/posts/${post.postId}/edit`}
                        className="text-xs font-bold text-primary hover:underline uppercase"
                      >
                        Sửa
                      </Link>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-muted-foreground"
                >
                  Bạn chưa có bài viết nào trong mục này.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const currentStatus = MY_POST_FILTERS.find((f) => f.value === status);
  const label = currentStatus?.label || "Không xác định";

  switch (status) {
    case "approved":
      return (
        <Badge className="bg-green-500/10 text-green-600 border-green-200 shadow-none hover:bg-green-500/10">
          {label}
        </Badge>
      );
    case "pending":
      return (
        <Badge className="bg-orange-500/10 text-orange-600 border-orange-200 shadow-none hover:bg-orange-500/10">
          {label}
        </Badge>
      );
    case "rejected":
      return (
        <Badge className="bg-red-500/10 text-red-600 border-red-200 shadow-none hover:bg-red-500/10">
          {label}
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="shadow-none">
          {label}
        </Badge>
      );
  }
}
