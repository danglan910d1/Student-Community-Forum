"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle2, XCircle } from "lucide-react";
import { PostStatusAction } from "../../types";

// Định nghĩa Interface nội bộ để đảm bảo Type Safety tuyệt đối
interface DecisionCardProps {
  id: string;
  value: PostStatusAction;
  label: string;
  desc: string;
  icon: React.ReactNode;
  isActive: boolean;
  isDestructive?: boolean;
}

const DecisionCard = ({
  id,
  value,
  label,
  desc,
  icon,
  isActive,
  isDestructive,
}: DecisionCardProps) => {
  // Logic chọn style dựa trên trạng thái active và destructive
  // Sử dụng màu từ hệ thống theme của bạn: primary, destructive, card, border
  const activeStyles = isDestructive
    ? "border-destructive ring-1 ring-destructive/20 bg-destructive/5"
    : "border-primary ring-1 ring-primary/20 bg-primary/5";

  const inactiveStyles =
    "bg-card opacity-60 grayscale-[0.5] hover:bg-accent/50 hover:grayscale-0";

  return (
    <Label
      htmlFor={id}
      className={`flex items-start space-x-4 p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
        isActive ? activeStyles : inactiveStyles
      }`}
    >
      <div className="mt-1">
        <RadioGroupItem value={value} id={id} className="sr-only" />
        <div
          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
            isActive
              ? isDestructive
                ? "border-destructive bg-destructive"
                : "border-primary bg-primary"
              : "border-muted-foreground"
          }`}
        >
          {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
        </div>
      </div>

      <div className="flex-1 flex gap-3">
        <div className="flex-shrink-0">{icon}</div>
        <div className="flex flex-col">
          <span
            className={`font-black text-[11px] uppercase tracking-wider transition-colors ${
              isDestructive && isActive ? "text-destructive" : "text-foreground"
            }`}
          >
            {label}
          </span>
          <span className="text-[10px] text-muted-foreground uppercase mt-0.5 leading-tight">
            {desc}
          </span>
        </div>
      </div>
    </Label>
  );
};

export function StatusDecision({
  status,
  onStatusChange,
}: {
  status: PostStatusAction;
  onStatusChange: (val: PostStatusAction) => void;
}) {
  return (
    <div className="space-y-4 pt-6">
      <RadioGroup
        value={status}
        onValueChange={(val) => onStatusChange(val as PostStatusAction)}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <DecisionCard
          id="approve"
          value="approved"
          label="Chấp nhận"
          desc="Bài viết sẽ được công khai ngay"
          icon={
            <CheckCircle2
              className={`w-5 h-5 ${status === "approved" ? "text-primary" : "text-muted-foreground"}`}
            />
          }
          isActive={status === "approved"}
        />
        <DecisionCard
          id="reject"
          value="rejected"
          label="Từ chối"
          desc="Ẩn nội dung và thông báo tác giả"
          icon={
            <XCircle
              className={`w-5 h-5 ${status === "rejected" ? "text-destructive" : "text-muted-foreground"}`}
            />
          }
          isActive={status === "rejected"}
          isDestructive
        />
      </RadioGroup>
    </div>
  );
}
