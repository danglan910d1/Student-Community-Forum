"use client";

import Link from "next/link";
import { ITag } from "@/modules/tag/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface TagCardProps {
  tag: ITag;
}

export function TagCard({ tag }: TagCardProps) {
  return (
    <Link href={`/posts?tag=${tag?.slug}`} className="block h-full">
      <Card className="group h-full transition-all hover:bg-muted hover:shadow-lg cursor-pointer">
        <CardContent className="flex justify-between items-center">
          <Badge className="rounded-sm font-medium">{tag.name}</Badge>

          <span className="text-xs text-muted-foreground">
            <span className="opacity-60 text-xs">×</span>{" "}
            {tag.postCount?.toLocaleString() || 0}
          </span>
        </CardContent>

        <CardFooter className="border-t">
          <p className="text-xs text-muted-foreground uppercase">
            Cập nhật: {new Date(tag.updatedAt).toLocaleDateString("vi-VN")}
          </p>
        </CardFooter>
      </Card>
    </Link>
  );
}
