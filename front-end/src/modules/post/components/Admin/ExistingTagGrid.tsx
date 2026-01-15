"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface ExistingTagGridProps {
  tags: { tagId: string; name: string }[];
  keepTagIds: string[];
  onToggle: (tagId: string, checked: boolean) => void;
}

export const ExistingTagGrid = ({
  tags,
  keepTagIds,
  onToggle,
}: ExistingTagGridProps) => (
  <div className="space-y-4 bg-muted/30 p-4 rounded-xl border">
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
          Thẻ hiện tại
        </Label>
      </div>
      <Badge variant="secondary" className="font-mono text-[10px]">
        {tags?.length || 0}
      </Badge>
    </div>

    <div className="flex flex-wrap gap-2">
      {tags?.length > 0 ? (
        tags.map((tag) => {
          const isActive = keepTagIds.includes(tag.tagId);
          return (
            <div
              key={tag.tagId}
              className={`flex items-center space-x-2 p-2 px-3 rounded-md border transition-all ${
                isActive
                  ? "bg-card border-primary/50"
                  : "bg-muted/50 opacity-50 grayscale"
              }`}
            >
              <Checkbox
                id={`keep-${tag.tagId}`}
                checked={isActive}
                onCheckedChange={(checked) => onToggle(tag.tagId, !!checked)}
              />
              <Label
                htmlFor={`keep-${tag.tagId}`}
                className="text-xs font-bold cursor-pointer"
              >
                {tag.name}
              </Label>
            </div>
          );
        })
      ) : (
        <div className="w-full py-6 text-center border border-dashed rounded-lg">
          <p className="text-xs italic text-muted-foreground">
            Không có thẻ cũ
          </p>
        </div>
      )}
    </div>
  </div>
);
