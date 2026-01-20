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
import { IUser } from "../../types";
import { UserIdentity } from "@/components/shared/UserIdentity";
import { UserRowActions } from "./UserRowActions";
import {
  FileText,
  ShieldCheck,
  User as UserIcon,
  Clock,
  Mail,
} from "lucide-react";

export function UserDataTable({ users }: { users: IUser[] }) {
  return (
    <div className="flex flex-col h-full w-full overflow-auto custom-scrollbar border rounded-md bg-card">
      <Table className="min-w-[1100px] w-full border-separate border-spacing-0">
        <TableHeader className="sticky top-0 z-30 bg-muted/100">
          <TableRow>
            <TableHead className="w-[20%] font-bold px-6 py-4">
              Người dùng
            </TableHead>
            <TableHead className="w-[20%] font-bold px-6 py-4">Email</TableHead>
            <TableHead className="w-[12%] font-bold px-6 py-4">
              Vai trò
            </TableHead>
            <TableHead className="w-[15%] text-center font-bold px-6 py-4">
              Bài viết
            </TableHead>
            <TableHead className="w-[13%] text-center font-bold px-6 py-4">
              Trạng thái
            </TableHead>
            <TableHead className="w-[15%] text-center font-bold px-6 py-4">
              Ngày tham gia
            </TableHead>
            <TableHead className="w-[5%]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length > 0 ? (
            users.map((u) => (
              <TableRow
                key={u.userId}
                className="group hover:bg-muted/30 transition-colors"
              >
                {/* CỘT 1: IDENTITY (Chỉ tên và Avatar) */}
                <TableCell className="py-4 px-6 border-b">
                  <UserIdentity
                    user={{
                      userId: u.userId,
                      name: u.name,
                      avatar: u.avatar || undefined,
                    }}
                    size="md"
                  />
                </TableCell>

                {/* CỘT 2: EMAIL RIÊNG BIỆT */}
                <TableCell className="py-4 px-6 border-b text-sm text-muted-foreground italic">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 opacity-60" />
                    {u.email || "---"}
                  </div>
                </TableCell>

                {/* CỘT 3: VAI TRÒ */}
                <TableCell className="py-4 px-6 border-b">
                  {u.role === "admin" ? (
                    <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/10 flex w-fit gap-1 shadow-none">
                      <ShieldCheck className="w-3 h-3" /> Admin
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="flex w-fit gap-1 shadow-none"
                    >
                      <UserIcon className="w-3 h-3" /> Member
                    </Badge>
                  )}
                </TableCell>

                {/* CỘT 4: THỐNG KÊ BÀI VIẾT */}
                <TableCell className="py-4 px-6 border-b text-center">
                  <div className="flex justify-center gap-3">
                    <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-500/10 px-2 py-1 rounded">
                      <FileText className="w-3.5 h-3.5" />
                      {u.postCount?.published || 0}
                    </div>
                    {u.postCount?.pending !== undefined &&
                      u.postCount.pending > 0 && (
                        <div className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-500/10 px-2 py-1 rounded">
                          <Clock className="w-3.5 h-3.5" />
                          {u.postCount.pending}
                        </div>
                      )}
                  </div>
                </TableCell>

                {/* CỘT 5: TRẠNG THÁI */}
                <TableCell className="py-4 px-6 border-b text-center">
                  <Badge
                    variant={u.status === "active" ? "outline" : "destructive"}
                    className={
                      u.status === "active"
                        ? "border-green-500 text-green-600 bg-green-500/5"
                        : "shadow-none"
                    }
                  >
                    {u.status === "active" ? "Hoạt động" : "Bị khóa"}
                  </Badge>
                </TableCell>

                {/* CỘT 6: NGÀY THAM GIA */}
                <TableCell className="py-4 px-6 border-b text-center text-[13px] text-muted-foreground whitespace-nowrap">
                  {format(new Date(u.createdAt), "dd/MM/yyyy", { locale: vi })}
                </TableCell>

                {/* CỘT 7: ACTIONS */}
                <TableCell className="py-4 px-6 border-b text-right">
                  <UserRowActions user={u} />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={7}
                className="h-40 text-center text-muted-foreground"
              >
                Không tìm thấy người dùng nào phù hợp.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
