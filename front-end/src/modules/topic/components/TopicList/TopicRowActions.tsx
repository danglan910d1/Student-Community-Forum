"use client";

import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ITopic } from "../../types";
import { ActionMenuContainer } from "@/components/shared/DropdownMenu/ActionMenuContainer";
import { useTopicActions } from "../../hooks/useTopicActions";
import { UpdateTopicDialog } from "../TopicForm/UpdateTopicDialog";

interface TopicRowActionsProps {
  topic: ITopic;
}

export function TopicRowActions({ topic }: TopicRowActionsProps) {
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);

  // Truyền 2 tham số: Hợp lệ theo định nghĩa mới của hook
  const { adminActions } = useTopicActions(topic, {
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

      <UpdateTopicDialog
        topicId={topic.topicId}
        open={isUpdateOpen}
        onOpenChange={setIsUpdateOpen}
      />
    </>
  );
}
