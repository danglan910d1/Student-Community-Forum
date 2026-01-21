// modules/tag/components/TagList/TagDataTable.tsx
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
import { ITag } from "../../types";
import { UserIdentity } from "@/components/shared/UserIdentity";
import { FileText, Folder, Hash } from "lucide-react";
import { TagRowActions } from "./TagRowAction";
import Link from "next/link";
import { getTagLink } from "../../utils/tagQueryMapper";

interface TagDataTableProps {
  tags: ITag[];
}

export function TagDataTable({ tags }: TagDataTableProps) {
  return (
    <div className="flex flex-col h-full w-full min-h-0">
      <div className="relative flex-1 overflow-auto border rounded-md shadow-sm bg-card custom-scrollbar">
        <Table className="min-w-[1000px] w-full border-separate border-spacing-0">
          <TableHeader className="sticky top-0 z-30">
            <TableRow className="bg-muted/100 hover:bg-muted/100">
              {/* Tên Tag: 15% là vừa đủ cho các tag như #typescript, #reactjs */}
              <TableHead className="sticky top-0 bg-muted z-20 w-[15%] text-base font-bold px-6 py-4 border-b">
                Thẻ (Tag)
              </TableHead>

              {/* Chủ đề: 25% để hiển thị tên chủ đề đầy đủ không bị mất chữ */}
              <TableHead className="sticky top-0 bg-muted z-20 w-[25%] text-base font-bold px-6 py-4 border-b">
                Thuộc Chủ đề
              </TableHead>

              {/* Người tạo: 20% cho Avatar + Tên người dùng */}
              <TableHead className="sticky top-0 bg-muted z-20 w-[20%] text-base font-bold px-6 py-4 border-b">
                Người tạo
              </TableHead>

              {/* Trạng thái: Thu hẹp lại vì chỉ có Badge */}
              <TableHead className="sticky top-0 bg-muted z-20 w-[15%] text-center text-base font-bold px-4 py-4 border-b">
                Trạng thái
              </TableHead>

              {/* Ngày tạo: Thu hẹp lại vừa đủ format dd/mm/yyyy */}
              <TableHead className="sticky top-0 bg-muted z-20 w-[15%] text-center text-base font-bold px-4 py-4 border-b">
                Ngày tạo
              </TableHead>

              {/* Thao tác: 10% cho nút ba chấm */}
              <TableHead className="sticky top-0 bg-muted z-20 w-[10%] border-b"></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {tags.length > 0 ? (
              tags.map((tag) => {
                // LOGIC PHÒNG THỦ: Tránh lỗi null properties
                const userObj =
                  tag.user && typeof tag.user === "object" ? tag.user : null;
                const topicObj =
                  tag.topic && typeof tag.topic === "object" ? tag.topic : null;

                return (
                  <TableRow
                    key={tag.tagId}
                    className="group hover:bg-muted/30 transition-colors"
                  >
                    {/* Tên Tag & Post Count */}
                    <TableCell className="align-top py-5 px-6 border-b">
                      <div className="flex flex-col gap-1.5 w-full">
                        <Link
                          href={getTagLink(tag)}
                          className="font-semibold text-[15px] leading-tight text-primary hover:underline flex items-center gap-1 w-fit"
                        >
                          <Hash className="w-4 h-4 opacity-70" />
                          {tag.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                            <FileText className="w-3 h-3" />
                            {tag.postCount || 0} bài viết
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Chủ đề (Topic) */}
                    <TableCell className="align-top py-5 px-6 border-b">
                      {topicObj?.slug ? (
                        <Link
                          href={`/posts?topic=${topicObj.slug}`}
                          className="flex items-center gap-2 text-[14px] text-foreground hover:underline font-medium hover:text-primary transition-colors w-fit"
                        >
                          <Folder className="w-4 h-4 text-muted-foreground" />
                          {topicObj.name}
                        </Link>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] text-muted-foreground italic">
                            Thẻ hệ thống
                          </span>
                          {/* Nếu bạn muốn link về danh sách bài viết chung không lọc topic */}
                          <Link
                            href="/posts"
                            className="text-[11px] text-primary hover:underline ml-1"
                          >
                            (Xem tất cả)
                          </Link>
                        </div>
                      )}
                    </TableCell>

                    {/* Người tạo (Sửa lỗi userId tại đây) */}
                    <TableCell className="align-top py-5 px-6 border-b">
                      <UserIdentity
                        user={{
                          userId: userObj?.userId || "", // Dùng optional chaining
                          name: userObj?.name || "Hệ thống",
                          avatar: userObj?.avatar ?? undefined,
                        }}
                        size="sm"
                      />
                    </TableCell>

                    {/* Trạng thái */}
                    <TableCell className="text-center align-top py-5 px-4 border-b">
                      <StatusBadge status={tag.status} />
                    </TableCell>

                    {/* Ngày tạo */}
                    <TableCell className="text-center align-top py-5 px-4 text-[13px] text-muted-foreground border-b">
                      {tag.createdAt
                        ? format(new Date(tag.createdAt), "dd/MM/yyyy", {
                            locale: vi,
                          })
                        : "---"}
                    </TableCell>

                    {/* Thao tác */}
                    <TableCell className="text-right align-top py-5 px-6 border-b">
                      <TagRowActions tag={tag} />
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground"
                >
                  Không tìm thấy thẻ nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Sub-component StatusBadge để code gọn hơn
function StatusBadge({ status }: { status?: string }) {
  switch (status) {
    case "approved":
      return (
        <Badge
          variant="outline"
          className="border-green-500/50 text-green-600 bg-green-500/5"
        >
          Đã duyệt
        </Badge>
      );
    case "pending":
      return (
        <Badge
          variant="outline"
          className="border-yellow-500/50 text-yellow-600 bg-yellow-500/5"
        >
          Chờ duyệt
        </Badge>
      );
    case "rejected":
      return <Badge variant="destructive">Từ chối</Badge>;
    default:
      return <Badge variant="outline">N/A</Badge>;
  }
}
