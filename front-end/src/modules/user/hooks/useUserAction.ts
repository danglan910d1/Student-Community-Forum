// modules/user/hooks/useUserActions.ts
"use client";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ActionItemConfig } from "@/types/actionMenu";
import { UserRole, UserStatus } from "@/types/common";
import { userService } from "@/modules/user/services/userService";
import { USER_ACTION_TYPES } from "../../tag/utils/userActionConfig";
import { IUser } from "@/modules/user/types";

export function useUserActions(user: IUser) {
  const queryClient = useQueryClient();

  // Định nghĩa payload rõ ràng thay vì 'any'
  const handleUpdate = async (payload: {
    status?: UserStatus;
    role?: UserRole;
  }) => {
    try {
      await userService.updateUserStatus(user.userId, payload);
      toast.success("Cập nhật thông tin thành công");
      // Invalidate để refetch lại bảng user
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    } catch (error) {
      toast.error("Không thể cập nhật người dùng");
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `Bạn có chắc muốn xóa tài khoản ${user.name}? Hành động này sẽ thực hiện xóa mềm (Soft Delete) và ẩn toàn bộ dữ liệu liên quan.`,
      )
    )
      return;

    try {
      await userService.deleteUser(user.userId);
      toast.success("Đã xóa người dùng thành công");
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    } catch (error) {
      toast.error("Lỗi khi xóa người dùng");
    }
  };

  const prepare = (groups: ActionItemConfig[][]): ActionItemConfig[][] =>
    groups.map((group) =>
      group.map((item) => {
        let finalOnClick = item.onClick;

        // Logic xử lý Role
        if (item.label?.includes("Admin") || item.label?.includes("User")) {
          finalOnClick = () =>
            handleUpdate({ role: user.role === "admin" ? "user" : "admin" });
        }

        // Logic xử lý Trạng thái (Status)
        if (item.label?.includes("Khóa") || item.label?.includes("Mở khóa")) {
          finalOnClick = () =>
            handleUpdate({
              status: user.status === "banned" ? "active" : "banned",
            });
        }

        // Logic xóa
        if (item.label === "Xóa vĩnh viễn" || item.variant === "destructive") {
          // Kiểm tra text hoặc variant tùy theo config của bạn
          if (item.label?.includes("Xóa")) {
            finalOnClick = handleDelete;
          }
        }

        return {
          ...item,
          onClick: finalOnClick,
        } as ActionItemConfig; // Ép kiểu để đảm bảo khớp với interface
      }),
    );

  return {
    adminActions: prepare(USER_ACTION_TYPES.ADMIN(user)),
  };
}
