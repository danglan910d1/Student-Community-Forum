// src/modules/notifications/containers/NotificationDropdown.tsx
import { useState } from "react";
import {
  Bell,
  MoreVertical,
  CheckCheck,
  SlidersHorizontal,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "../hooks/useNotifications";
import { useNotificationActions } from "../hooks/useNotificationActions";
import { useUnreadCount } from "../hooks/useUnreadCount";
import { NotificationItem } from "./NotiItem";

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useNotifications(10);
  const { markRead, markAllRead, deleteNoti } = useNotificationActions();
  const { data: unreadCount = 0 } = useUnreadCount();

  const allNotifications =
    data?.pages.flatMap((page) => page.notifications) ?? [];
  const uniqueNotifications = Array.from(
    new Map(
      allNotifications.map((item) => [item.notificationId, item]),
    ).values(),
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon-lg"
          className="relative rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-all active:scale-95 group"
        >
          <Bell
            className="text-gray-500 group-hover:text-primary transition-colors"
            strokeWidth={2.5} // Tăng độ đậm nét vẽ ở đây
          />

          {!!unreadCount && unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-black text-white border-2 border-background shadow-sm animate-in zoom-in duration-300">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[420px] p-0 shadow-2xl border-border bg-popover text-popover-foreground overflow-hidden rounded-2xl"
        align="end"
        sideOffset={12}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b bg-muted/20">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-base tracking-tight text-foreground">
              Thông báo
            </h3>
            {unreadCount > 0 && (
              <div className="bg-primary/10 text-primary text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                {unreadCount}
              </div>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 rounded-full hover:bg-muted"
              >
                <MoreVertical className="h-5 w-5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="rounded-xl w-60 p-1.5 shadow-xl"
            >
              <DropdownMenuItem
                onClick={() => {
                  markAllRead();
                  setOpen(false);
                }}
                className="cursor-pointer gap-3 py-3 text-sm font-medium"
              >
                <CheckCheck className="h-5 w-5 text-emerald-500" />
                <span>Đánh dấu tất cả là đã đọc</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer gap-3 py-3 text-sm font-medium">
                <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
                <span>Cài đặt thông báo</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* LIST AREA */}
        <ScrollArea className="h-[520px]">
          {uniqueNotifications.length > 0 ? (
            <div className="flex flex-col">
              {uniqueNotifications.map((noti) => (
                <NotificationItem
                  key={noti.notificationId}
                  noti={noti}
                  onMarkRead={markRead}
                  onClose={() => setOpen(false)}
                  onDelete={deleteNoti}
                />
              ))}

              {hasNextPage && (
                <div className="p-5 border-t bg-muted/5">
                  <Button
                    variant="outline"
                    size="default"
                    className="w-full text-sm font-bold border-dashed hover:bg-accent transition-colors"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                  >
                    {isFetchingNextPage
                      ? "Đang tải dữ liệu..."
                      : "Xem thông báo cũ hơn"}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-28 px-10 text-center">
              <button className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              <p className="text-base font-semibold text-foreground">
                Hộp thư trống
              </p>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-[200px]">
                Chúng tôi sẽ thông báo cho bạn khi có hoạt động mới.
              </p>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
