"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, MapPin } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { IUser } from "../../types";
import Link from "next/link";

interface UserHeaderProps {
  user?: IUser | null;
  isLoading?: boolean;
  isMine?: boolean;
}

export function UserHeader({
  user,
  isLoading,
  isMine = false,
}: UserHeaderProps) {
  if (isLoading) return <UserHeaderSkeleton />;
  if (!user) return null;

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between pb-8 border-b">
      <div className="flex flex-col gap-5 md:flex-row md:items-center">
        <UserAvatar
          user={{
            name: user.name,
            avatar: user.avatar ?? undefined,
          }}
          size="lg"
          className="border-2 border-background shadow-sm"
        />

        {/* INFO */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/profile/${user.userId}`}
                className="text-2xl font-bold tracking-tight text-foreground hover:underline decoration-2 underline-offset-4 transition-all"
              >
                {user.name}
              </Link>
              <Badge
                variant="secondary"
                className="font-semibold text-[10px] uppercase tracking-wider"
              >
                {user.role === "admin" ? "Quản trị viên" : "Thành viên"}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 opacity-70" />
                <span>
                  Tham gia{" "}
                  {user.createdAt
                    ? format(new Date(user.createdAt), "MMMM yyyy", {
                        locale: vi,
                      })
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 opacity-70" />
                <span>Việt Nam</span>
              </div>
            </div>
          </div>

          {/* STATS */}
          <div className="flex gap-8 pt-1">
            <StatItem label="Bài viết" value={user.postCount?.published || 0} />
            {isMine && (user.postCount?.pending ?? 0) > 0 && (
              <StatItem
                label="Đang chờ"
                value={user.postCount?.pending}
                highlight
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatItem({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number | undefined;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span
        className={`text-xl font-bold leading-none ${
          highlight ? "text-orange-500" : "text-foreground"
        }`}
      >
        {value}
      </span>
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
        {label}
      </span>
    </div>
  );
}

function UserHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-center pb-8 border-b">
      <Skeleton className="h-24 w-24 rounded-lg md:h-28 md:w-28" />
      <div className="flex-1 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="flex gap-8">
          <Skeleton className="h-10 w-16" />
          <Skeleton className="h-10 w-16" />
        </div>
      </div>
    </div>
  );
}
