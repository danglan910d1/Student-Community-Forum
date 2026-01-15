"use client";

import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IPost } from "../../types";
import { ActionMenuContainer } from "@/components/shared/DropdownMenu/ActionMenuContainer";
import { usePostActions } from "../../hooks/usePostActionGroups";

interface PostRowActionsProps {
  post: IPost;
  isAdminView?: boolean;
  isMine?: boolean;
}

export function PostRowActions({
  post,
  isAdminView,
  isMine,
}: PostRowActionsProps) {
  // Hook này đã "nấu chín" toàn bộ logic router.push và icons
  const { authorActions, adminActions } = usePostActions(post);

  // Quyết định dùng bộ menu nào dựa trên Props truyền vào
  const actions = isAdminView ? adminActions : isMine ? authorActions : [];

  if (actions.length === 0) return null;

  return (
    <ActionMenuContainer
      trigger={
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      }
      groups={actions}
    />
  );
}
