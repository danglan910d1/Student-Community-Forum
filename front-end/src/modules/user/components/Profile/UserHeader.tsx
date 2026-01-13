"use client";

import { useMe } from "@/modules/user/hooks/useMe";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, Edit3, MapPin } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { getInitials } from "@/utils/string";
import { getAssetUrl } from "@/lib/utils";

export function UserHeader() {
  const { data: user, isLoading } = useMe();

  if (isLoading) return <UserHeaderSkeleton />;
  if (!user) return null;

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between pb-8 border-b">
      <div className="flex flex-col gap-6 md:flex-row md:items-end">
        {/* AVATAR */}
        <Avatar className="h-24 w-24 rounded-lg border-2 border-background md:h-28 md:w-28">
          <AvatarImage
            src={getAssetUrl(user.avatar)}
            alt={user.name}
            className="object-cover"
          />
          <AvatarFallback className="rounded-lg bg-muted text-2xl font-medium">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>

        {/* INFO */}
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{user.name}</h1>
              <Badge variant="secondary" className="capitalize">
                {user.role === "admin" ? "Quản trị viên" : "Thành viên"}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4 opacity-70" />
                <span>
                  Gia nhập{" "}
                  {user.createdAt
                    ? format(new Date(user.createdAt), "MM/yyyy", {
                        locale: vi,
                      })
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 opacity-70" />
                <span>Việt Nam</span>
              </div>
            </div>
          </div>

          {/* STATS */}
          <div className="flex gap-6">
            <StatItem label="Bài viết" value={user.postCount?.published || 0} />
            {(user.postCount?.pending ?? 0) > 0 && (
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

// Sub-component cho Stat để code sạch hơn
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
    <div className="flex flex-col">
      <span
        className={`text-lg font-bold ${highlight ? "text-orange-500" : ""}`}
      >
        {value}
      </span>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
        {label}
      </span>
    </div>
  );
}

// SKELETON chuẩn Shadcn
function UserHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-end pb-8 border-b">
      <Skeleton className="h-24 w-24 rounded-lg md:h-28 md:w-28" />
      <div className="flex-1 space-y-3">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-6">
          <Skeleton className="h-10 w-16" />
          <Skeleton className="h-10 w-16" />
        </div>
      </div>
    </div>
  );
}
