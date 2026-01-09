import { Button } from "@/components/ui/button";
import { Loader2, SendHorizontal } from "lucide-react";

interface PostFormActionsProps {
  isPending: boolean;
  onCancel: () => void;
  submitText: string;
  cancelText: string;
}

export function PostFormActions({
  isPending,
  onCancel,
  submitText,
  cancelText,
}: PostFormActionsProps) {
  return (
    <div className="flex justify-end items-center gap-4 pt-6 border-t">
      <Button variant="ghost" type="button" onClick={onCancel}>
        {cancelText}
      </Button>
      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử lý
          </>
        ) : (
          <>
            <SendHorizontal className="mr-2 h-4 w-4" /> {submitText}
          </>
        )}
      </Button>
    </div>
  );
}
