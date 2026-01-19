import React from "react";
import { BaseDialog } from "./DialogContent";
import { CreateTopicContainer } from "../../containers/CreateTopicContainer";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CreateTopicDialog() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlusCircle className="w-4 h-4" />
        <span>New Topic</span>
      </Button>

      <BaseDialog
        open={open}
        onOpenChange={setOpen}
        title="Tạo chủ đề mới"
        description="Phân loại bài viết của bạn vào các chủ đề cụ thể."
      >
        <CreateTopicContainer
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </BaseDialog>
    </>
  );
}
