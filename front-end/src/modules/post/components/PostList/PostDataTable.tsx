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
  const canShowActions = isAdminView || isMine;

  return (
    <div className="flex flex-col h-full w-full min-h-0">
      <div className="relative flex-1 overflow-auto border rounded-md shadow-sm bg-card custom-scrollbar">
        <Table className="min-w-[800px] w-full border-separate border-spacing-0">
          <TableHeader className="sticky top-0 z-30">
            <TableRow className="bg-muted/100 hover:bg-muted/100">
              <TableHead className="sticky top-0 bg-muted z-20 w-[30%] text-base font-bold px-6 py-4 border-b">
                Bài viết
              </TableHead>

              {isAdminView && (
                <TableHead className="sticky top-0 bg-muted z-20 w-[20%] text-base font-bold px-6 py-4 border-b">
                  Tác giả
                </TableHead>
              )}

              <TableHead className="sticky top-0 bg-muted z-20 w-[15%] text-center text-base font-bold px-4 py-4 border-b">
                Trạng thái
              </TableHead>

              <TableHead className="sticky top-0 bg-muted z-20 w-[15%] text-center text-base font-bold px-4 py-4 border-b">
                Tương tác
              </TableHead>

              <TableHead className="sticky top-0 bg-muted z-20 w-[15%] text-center text-base font-bold px-4 py-4 border-b">
                Ngày đăng
              </TableHead>

              {canShowActions && (
                <TableHead className="sticky top-0 bg-muted z-20 w-[10%] border-b"></TableHead>
              )}
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
                    {/* Style Cell: align-top, padding py-5 px-6 từ bản 1 */}
                    <TableCell className="align-top py-5 px-6 border-b">
                      <div className="flex flex-col gap-1.5 w-full min-w-[200px]">
                        <Link
                          href={postHref}
                          className="font-semibold hover:text-primary transition-colors whitespace-normal break-words leading-tight line-clamp-2"
                        >
                          {post.title}
                        </Link>

                        <Link
                          href={`/posts?topic=${post.topic?.slug || "unclassified"}`}
                          className="text-xs text-muted-foreground hover:text-primary opacity-80"
                        >
                          {post.topic?.name || "Chưa phân loại"}
                        </Link>
                      </div>
                    </TableCell>

                    {isAdminView && (
                      <TableCell className="align-top py-5 px-6 border-b">
                        <UserIdentity
                          user={{
                            userId: post.user?.userId,
                            name: post.user?.name || "Người dùng",
                            avatar: post.user?.avatar ?? undefined,
                          }}
                          size="sm"
                          className="flex-1 max-w-[85%]"
                        />
                      </TableCell>
                    )}

                    <TableCell className="text-center align-top py-5 px-4 border-b">
                      <StatusBadge status={post.status} />
                    </TableCell>

                    <TableCell className="text-center align-top py-5 px-4 border-b">
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

                    <TableCell className="text-center align-top py-5 px-4 text-sm text-muted-foreground border-b">
                      {format(new Date(post.createdAt), "dd/MM/yyyy", {
                        locale: vi,
                      })}
                    </TableCell>

                    {canShowActions && (
                      <TableCell className="text-right align-top py-5 px-6 border-b">
                        <PostRowActions
                          post={post}
                          isAdminView={isAdminView}
                          isMine={isMine}
                        />
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={isAdminView ? 6 : canShowActions ? 5 : 4}
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
