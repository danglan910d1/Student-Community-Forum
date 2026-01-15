import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ActionItemConfig } from "@/types/actionMenu";

export const ActionMenuItem = ({ item }: { item: ActionItemConfig }) => {
  if (item.show === false) return null;

  if (item.component) {
    return (
      <DropdownMenuItem
        onSelect={(e) => e.preventDefault()}
        className={cn(
          "cursor-pointer p-0 focus:bg-destructive/10",
          item.variant === "destructive" && "text-destructive"
        )}
      >
        <div className="w-full px-2 py-1.5">{item.component}</div>
      </DropdownMenuItem>
    );
  }

  const Icon = item.icon;
  return (
    <DropdownMenuItem
      onClick={item.onClick}
      className={cn(
        "cursor-pointer",
        item.variant === "destructive" &&
          "text-destructive focus:bg-destructive/10 focus:text-destructive"
      )}
    >
      {Icon && <Icon className="mr-2 h-4 w-4" />}
      <span>{item.label}</span>
    </DropdownMenuItem>
  );
};
