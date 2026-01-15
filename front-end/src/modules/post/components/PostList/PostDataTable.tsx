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
import { PostRowActions } from "./PostRowAction";
import { UserIdentity } from "@/components/shared/UserIdentity";

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
    <div className="rounded-md border bg-card overflow-hidden">
      <div className="relative w-full overflow-x-auto">
        <Table className="min-w-[800px] w-full table-fixed">
          <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[30%]">Bài viết</TableHead>
              {isAdminView && (
                <TableHead className="w-[20%]">Tác giả</TableHead>
              )}
              <TableHead className="w-[15%] text-center">Trạng thái</TableHead>
              <TableHead className="w-[15%] text-center">Tương tác</TableHead>
              <TableHead className="w-[15%] text-center">Ngày đăng</TableHead>
              <TableHead className="w-[10%] text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.length > 0 ? (
              posts.map((post) => {
                const postHref = getPostLink(post, !!isAdminView, isMine);
                return (
                  <TableRow
                    key={post.postId}
                    className="group hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="align-top py-4">
                      <div className="flex flex-col gap-1 w-full max-w-[250px]">
                        <Link
                          href={postHref}
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
                      <TableCell className="text-sm align-top py-4">
                        <div className="max-w-[200px]">
                          <UserIdentity
                            user={{
                              userId: post.user?.userId,
                              name: post.user?.name || "Người dùng",
                              avatar: post.user?.avatar ?? undefined,
                            }}
                            size="sm"
                            // Bạn có thể thêm className để tinh chỉnh thêm nếu cần
                            className="font-medium"
                          />
                        </div>
                      </TableCell>
                    )}
                    <TableCell className="text-center align-top py-4">
                      <StatusBadge status={post.status} />
                    </TableCell>

                    <TableCell className="text-center align-top py-4">
                      <div className="flex items-center justify-center gap-3 text-muted-foreground">
                        <Stat
                          icon={<Eye className="w-3.5 h-3.5" />}
                          value={post.views_count}
                        />
                        <Stat
                          icon={<ThumbsUp className="w-3.5 h-3.5" />}
                          value={post.likes_count}
                        />
                        <Stat
                          icon={<MessageSquare className="w-3.5 h-3.5" />}
                          value={post.comments_count}
                        />
                      </div>
                    </TableCell>

                    <TableCell className="text-center align-top py-4 text-sm text-muted-foreground">
                      {format(new Date(post.createdAt), "dd/MM/yyyy", {
                        locale: vi,
                      })}
                    </TableCell>

                    <TableCell className="text-right align-top py-4">
                      <PostRowActions
                        post={post}
                        isAdminView={isAdminView}
                        isMine={isMine}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={isAdminView ? 6 : 5}
                  className="h-32 text-center text-muted-foreground"
                >
                  Không tìm thấy bài viết nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// --- Các thành phần hỗ trợ ---

function Stat({ icon, value }: { icon: React.ReactNode; value?: number }) {
  return (
    <span className="flex items-center gap-1 text-xs">
      {icon} {value || 0}
    </span>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const currentStatus = MY_POST_FILTERS.find((f) => f.value === status);
  const label = currentStatus?.label || "Không xác định";

  switch (status) {
    case "approved":
      return (
        <Badge
          variant="outline"
          className="border-green-500/50 text-green-600 bg-green-500/5"
        >
          {label}
        </Badge>
      );
    case "pending":
      return <Badge variant="warning">{label}</Badge>;
    case "rejected":
      return <Badge variant="destructive">{label}</Badge>;
    default:
      return <Badge variant="outline">{label}</Badge>;
  }
}
