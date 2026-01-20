// src/modules/notifications/components/NotificationItem.tsx
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { INotification } from "../types";
import { UserAvatar } from "@/components/shared/UserAvatar"; // Sử dụng component avatar chung
import { cn } from "@/lib/utils";
import {
  Heart,
  MessageSquare,
  Reply,
  ShieldCheck,
  XCircle,
  Bell,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { NotificationType } from "../types/enum";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const getNotiConfig = (type: NotificationType) => {
  switch (type) {
    case NotificationType.NEW_LIKE:
      return {
        icon: <Heart className="h-3 w-3 fill-red-500 text-red-500" />,
        color: "bg-red-100",
      };
    case NotificationType.NEW_COMMENT:
      return {
        icon: <MessageSquare className="h-3 w-3 text-blue-500" />,
        color: "bg-blue-100",
      };
    case NotificationType.NEW_REPLY:
      return {
        icon: <Reply className="h-3 w-3 text-purple-500" />,
        color: "bg-purple-100",
      };
    case NotificationType.POST_APPROVED:
      return {
        icon: <ShieldCheck className="h-3 w-3 text-green-500" />,
        color: "bg-green-100",
      };
    case NotificationType.POST_REJECTED:
      return {
        icon: <XCircle className="h-3 w-3 text-destructive" />,
        color: "bg-red-100",
      };
    default:
      return {
        icon: <Bell className="h-3 w-3 text-gray-500" />,
        color: "bg-gray-100",
      };
  }
};

// const getNotiConfig = (type: NotificationType) => {
//   switch (type) {
//     case NotificationType.NEW_LIKE:
//       return {
//         icon: <Heart className="h-3 w-3 fill-destructive text-destructive" />,
//         color: "bg-destructive/10 border-destructive/20",
//       };
//     case NotificationType.NEW_COMMENT:
//       return {
//         icon: <MessageSquare className="h-3 w-3 fill-primary text-primary" />,
//         color: "bg-primary/10 border-primary/20",
//       };
//     case NotificationType.NEW_REPLY:
//       return {
//         icon: <Reply className="h-3 w-3 text-indigo-500" />,
//         color: "bg-indigo-500/10 border-indigo-500/20",
//       };
//     case NotificationType.POST_APPROVED:
//       return {
//         icon: <ShieldCheck className="h-3 w-3 text-emerald-500" />,
//         color: "bg-emerald-500/10 border-emerald-500/20",
//       };
//     case NotificationType.POST_REJECTED:
//       return {
//         icon: <XCircle className="h-3 w-3 text-destructive" />,
//         color: "bg-destructive/10 border-destructive/20",
//       };
//     default:
//       return {
//         icon: <Bell className="h-3 w-3 text-muted-foreground" />,
//         color: "bg-muted border-border",
//       };
//   }
// };

export function NotificationItem({
  noti,
  onMarkRead,
  onDelete,
  onClose,
}: {
  noti: INotification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  const router = useRouter();
  const config = getNotiConfig(noti.type);
  const href = `/posts/${noti.targetId}/${noti.targetSlug || "view"}`;

  const handleItemClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!noti.is_read) onMarkRead(noti.notificationId);
    onClose();
    router.push(href);
  };

  return (
    <div
      onClick={handleItemClick}
      className={cn(
        "group flex items-start gap-4 p-4 transition-all hover:bg-accent border-b last:border-0 relative cursor-pointer",
        !noti.is_read
          ? "bg-primary/[0.08] dark:bg-primary/[0.15]"
          : "hover:bg-accent bg-transparent opacity-90",
      )}
    >
      {/* AVATAR BLOCK */}
      <div
        className="relative flex-shrink-0 mt-1"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <UserAvatar
          user={noti.sender}
          size="md"
          className="h-11 w-11 border border-border shadow-sm" // Dùng h-11/w-11 để avatar cân xứng với chữ to
        />
        <div
          className={cn(
            "absolute -bottom-1 -right-1 rounded-full p-1 border-2 border-background shadow-sm",
            config.color,
          )}
        >
          {config.icon}
        </div>
      </div>

      {/* CONTENT BLOCK */}
      <div className="flex-1 space-y-1.5 min-w-0 pr-10">
        <p
          className={cn(
            "text-base leading-snug break-words tracking-tight", // text-base cho nội dung chính
          )}
        >
          <span className="font-bold text-foreground">
            {noti.sender?.name || "Hệ thống"}
          </span>{" "}
          {noti.content}
        </p>

        <p className="text-xs text-muted-foreground/80 font-medium flex items-center">
          {formatDistanceToNow(new Date(noti.createdAt), {
            addSuffix: true,
            locale: vi,
          })}
        </p>
      </div>

      {/* ACTION BLOCK (Absolute) */}
      <div
        className="absolute right-3 top-5 flex flex-col items-center gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Chấm xanh */}
        <div className="h-2 flex items-center justify-center">
          {!noti.is_read && (
            <div className="h-2.5 w-2.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
          )}
        </div>

        {/* Nút 3 chấm */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-background border border-transparent hover:border-border shadow-sm"
            >
              <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 shadow-md">
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer py-3 text-sm"
              onClick={() => onDelete(noti.notificationId)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Xóa thông báo này</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
