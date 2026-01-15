import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ActionMenuItem } from "./ActionMenuItem";
import { ActionItemConfig } from "@/types/actionMenu";
import React from "react";

interface Props {
  trigger: React.ReactNode;
  groups: ActionItemConfig[][];
}

export const ActionMenuContainer = ({ trigger, groups }: Props) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {groups.map((group, gIndex) => {
          const visibleItems = group.filter((i) => i.show !== false);
          if (visibleItems.length === 0) return null;

          return (
            <React.Fragment key={gIndex}>
              {visibleItems.map((item, iIndex) => (
                <ActionMenuItem key={iIndex} item={item} />
              ))}
              {gIndex < groups.length - 1 &&
                groups
                  .slice(gIndex + 1)
                  .some((next) => next.some((i) => i.show !== false)) && (
                  <DropdownMenuSeparator />
                )}
            </React.Fragment>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
