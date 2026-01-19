// modules/topic/components/TopicList/TopicDataTable.tsx
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
import { ITopic } from "../../types";
import { UserIdentity } from "@/components/shared/UserIdentity";
import { TopicRowActions } from "./TopicRowActions";
import { TOPIC_STATUS_LABELS } from "../../constants/topic";
import { TruncatedTooltip } from "@/components/shared/TruncatedTooltip";
import Link from "next/link";
import { FileText, Tag } from "lucide-react";

interface TopicDataTableProps {
  topics: ITopic[];
}

export function TopicDataTable({ topics }: TopicDataTableProps) {
  return (
    <div className="flex flex-col h-full w-full min-h-0">
      <div className="relative flex-1 overflow-auto border rounded-md shadow-sm bg-card custom-scrollbar">
        <Table className="min-w-[1000px] w-full border-separate border-spacing-0">
          <TableHeader className="sticky top-0 z-30">
            <TableRow className="bg-muted/100 hover:bg-muted/100">
              <TableHead className="sticky top-0 bg-muted z-20 w-[20%] text-base font-bold px-6 py-4 border-b">
                Chủ đề
              </TableHead>

              <TableHead className="sticky top-0 bg-muted z-20 w-[30%] text-base font-bold px-6 py-4 border-b">
                Mô tả
              </TableHead>

              <TableHead className="sticky top-0 bg-muted z-20 w-[18%] text-base font-bold px-6 py-4 border-b">
                Người tạo
              </TableHead>

              <TableHead className="sticky top-0 bg-muted z-20 w-[12%] text-center text-base font-bold px-4 py-4 border-b">
                Trạng thái
              </TableHead>

              <TableHead className="sticky top-0 bg-muted z-20 w-[12%] text-center text-base font-bold px-4 py-4 border-b">
                Ngày tạo
              </TableHead>

              <TableHead className="sticky top-0 bg-muted z-20 w-[8%] border-b"></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {topics.length > 0 ? (
              topics.map((topic) => (
                <TableRow
                  key={topic.topicId}
                  className="group hover:bg-muted/30 transition-colors"
                >
                  {/* Tên & Slug */}
                  <TableCell className="align-top py-5 px-6 border-b">
                    <div className="flex flex-col gap-1.5 w-full">
                      <Link
                        href={`/posts?topic=${topic.slug}`}
                        className="font-semibold text-[15px] hover:text-primary transition-colors leading-tight line-clamp-2"
                      >
                        {topic.name}
                      </Link>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                          <FileText className="w-3 h-3" />
                          {topic._count?.posts || 0} bài viết
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                          <Tag className="w-3 h-3" />
                          {topic._count?.tags || 0} thẻ
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Mô tả với Tooltip tái sử dụng */}
                  <TableCell className="align-top py-5 px-6 border-b">
                    <TruncatedTooltip
                      content={
                        topic.description || "Không có mô tả cho chủ đề này."
                      }
                      className="text-[14px] text-muted-foreground leading-relaxed antialiased"
                      maxLines={2}
                    />
                  </TableCell>

                  {/* Người tạo */}
                  <TableCell className="align-top py-5 px-6 border-b">
                    <UserIdentity
                      user={{
                        userId: topic.user?.userId || "",
                        name: topic.user?.name || "Hệ thống",
                        avatar: topic.user?.avatar ?? undefined,
                      }}
                      size="sm"
                    />
                  </TableCell>

                  {/* Trạng thái */}
                  <TableCell className="text-center align-top py-5 px-4 border-b">
                    <StatusBadge status={topic.status} />
                  </TableCell>

                  {/* Ngày tạo */}
                  <TableCell className="text-center align-top py-5 px-4 text-[13px] text-muted-foreground border-b">
                    {format(new Date(topic.createdAt), "dd/MM/yyyy", {
                      locale: vi,
                    })}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right align-top py-5 px-6 border-b">
                    <TopicRowActions topic={topic} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground"
                >
                  Không tìm thấy chủ đề nào trong hệ thống.
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
  const currentStatus = TOPIC_STATUS_LABELS.find((f) => f.value === status);
  const label = currentStatus?.label || "N/A";

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
      return (
        <Badge
          variant="outline"
          className="border-yellow-500/50 text-yellow-600 bg-yellow-500/5"
        >
          {label}
        </Badge>
      );
    case "rejected":
      return <Badge variant="destructive">{label}</Badge>;
    default:
      return <Badge variant="outline">{label}</Badge>;
  }
}
