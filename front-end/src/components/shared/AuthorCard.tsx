import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/utils/string";
import { getAssetUrl } from "@/lib/utils";

interface AuthorCardProps {
  user: {
    userId: string;
    name: string;
    avatar?: string;
    role?: string;
  };
  createdAt: string;
  label?: string;
}

export function AuthorCard({
  user,
  createdAt,
  label = "Đã hỏi lúc",
}: AuthorCardProps) {
  return (
    <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 w-full max-w-[240px]">
      {/* TIME LABEL */}
      <p className="text-xs mb-3">
        {label}{" "}
        {format(new Date(createdAt), "HH:mm, 'ngày' dd/MM", { locale: vi })}
      </p>

      {/* AUTHOR */}
      <div className="flex items-center gap-3">
        <Avatar className="w-9 h-9 rounded shrink-0">
          <AvatarImage
            src={getAssetUrl(user.avatar)}
            alt={user.name}
            className="object-cover"
          />
          <AvatarFallback className="bg-blue-100 dark:bg-primary text-foreground font-bold text-md">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <Link
            href={`/profile/${user.userId}`}
            className="text-foreground font-bold truncat hover:underline leading-tight text-md"
          >
            {user.name}
          </Link>
          <p className="text-xs text-muted-foreground truncate italic mt-1">
            {user.role === "admin" ? "Quản trị viên" : "Thành viên"}
          </p>
        </div>
      </div>
    </div>
  );
}
