"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { GenericDropdown } from "@/components/shared/GenericDropdown"; // Đường dẫn tới file bạn vừa gửi

const STATUS_OPTIONS = [
  { label: "Hoạt động (Approved)", value: "approved" },
  { label: "Chờ duyệt (Pending)", value: "pending" },
  { label: "Tạm ẩn (Rejected)", value: "rejected" },
];

export function StatusFormSelect({ disabled }: { disabled?: boolean }) {
  const { control } = useFormContext();

  return (
    <div className="grid gap-2">
      <Label className="font-semibold text-sm">Trạng thái</Label>
      <Controller
        name="status"
        control={control}
        render={({ field }) => {
          // Tìm label tương ứng với value đang active
          const activeLabel =
            STATUS_OPTIONS.find((opt) => opt.value === field.value)?.label ||
            "Chọn trạng thái";

          return (
            <GenericDropdown
              label={activeLabel}
              items={STATUS_OPTIONS}
              activeValue={field.value}
              onSelect={field.onChange}
              className={disabled ? "opacity-50 pointer-events-none" : ""}
            />
          );
        }}
      />
    </div>
  );
}
