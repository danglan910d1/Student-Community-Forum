import { useState } from "react";
import { ITag } from "../../types";
import { useTagActions } from "../../hooks/useTagAction";
import { ActionMenuContainer } from "@/components/shared/DropdownMenu/ActionMenuContainer";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { UpdateTagDialog } from "../TagForm/UpdateTagDialog";

export function TagRowActions({ tag }: { tag: ITag }) {
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);

  // Khởi tạo adminActions thông qua Hook
  const { adminActions } = useTagActions(tag, {
    onEdit: () => setIsUpdateOpen(true),
  });

  return (
    <>
      <ActionMenuContainer
        trigger={
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        }
        groups={adminActions}
      />

      <UpdateTagDialog
        tagId={tag.tagId}
        open={isUpdateOpen}
        onOpenChange={setIsUpdateOpen}
      />
    </>
  );
}
