// modules/user/constants/userActionConfig.tsx
import {
  ShieldAlert,
  ShieldCheck,
  UserX,
  UserCheck,
  Trash2,
} from "lucide-react";

import { ActionItemConfig } from "@/types/actionMenu";
import { IUser } from "@/modules/user/types";

export const USER_ACTION_TYPES = {
  ADMIN: (user: IUser): ActionItemConfig[][] => {
    const isAdmin = user.role === "admin";
    const isBanned = user.status === "banned";

    return [
      [
        {
          label: isAdmin ? "Hạ cấp xuống User" : "Nâng cấp lên Admin",
          icon: isAdmin ? ShieldAlert : ShieldCheck,
          // logic sẽ được hook tiêm vào dựa trên label hoặc một id định danh
        },
        {
          label: isBanned ? "Mở khóa tài khoản" : "Khóa tài khoản",
          icon: isBanned ? UserCheck : UserX,
          variant: isBanned ? "default" : "destructive",
        },
      ],
      [
        {
          label: "Xóa vĩnh viễn",
          icon: Trash2,
          variant: "destructive",
        },
      ],
    ];
  },
};
