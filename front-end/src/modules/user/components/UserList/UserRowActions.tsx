// modules/user/components/UserList/UserRowActions.tsx
"use client";

import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IUser } from "../../types";
import { ActionMenuContainer } from "@/components/shared/DropdownMenu/ActionMenuContainer";
import { useUserActions } from "../../hooks/useUserAction";

interface UserRowActionsProps {
  user: IUser;
}

export function UserRowActions({ user }: UserRowActionsProps) {
  const { adminActions } = useUserActions(user);

  return (
    <ActionMenuContainer
      trigger={
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      }
      groups={adminActions}
    />
  );
}
