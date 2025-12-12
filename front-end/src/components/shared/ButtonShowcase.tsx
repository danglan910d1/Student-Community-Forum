// src/components/docs/buttons/ButtonShowcase.tsx

import { Button } from "../ui/button"; // Button base
import CustomButton from "../ui/CustomButton"; // Button mở rộng
import OuterContainer from "@/components/shared/OuterContainer";
import CodeContainer from "@/components/shared/CodeContainer";

import {
  Check,
  Download,
  Settings,
  Trash2,
  AlertTriangle,
  Plus,
  Bell,
  Search,
  Loader2, // Thêm Loader2 nếu muốn dùng trực tiếp trong Button
} from "lucide-react";

export const ButtonShowcase = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* 1. Primary Actions (Sử dụng CustomButton cho Icon/Loading) */}
      <OuterContainer>
        <div className="border-b border-border-light pb-4">
          <h3 className="text-xl font-bold text-text-title mb-1">
            Primary Actions
          </h3>
          <p className="text-sm text-gray-500">
            Sử dụng cho các hành động quan trọng nhất.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Sử dụng variant="default" (tương đương Primary) */}
          <Button>Default Button</Button>

          {/* Dùng CustomButton để thêm Icon */}
          <CustomButton variant="default" leftIcon={<Check size={18} />}>
            Save
          </CustomButton>

          {/* Dùng CustomButton để hiển thị Loading */}
          <CustomButton variant="default" isLoading>
            Saving...
          </CustomButton>

          {/* Dùng Button base cho trạng thái Disabled */}
          <Button variant="secondary" disabled>
            Disabled
          </Button>
        </div>

        <CodeContainer>{`<CustomButton variant="default" leftIcon={<Check />}>Save</CustomButton>`}</CodeContainer>
      </OuterContainer>

      {/* 2. Secondary Actions */}
      <OuterContainer>
        <div className="border-b border-border-light pb-4">
          <h3 className="text-xl font-bold text-text-title mb-1">
            Secondary Actions
          </h3>
          <p className="text-sm text-gray-500">
            Sử dụng cho các hành động thay thế hoặc ưu tiên thấp hơn.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Button variant="secondary">Cancel</Button>

          {/* Dùng CustomButton cho Icon */}
          <CustomButton variant="secondary" leftIcon={<Download size={18} />}>
            Export
          </CustomButton>

          {/* Dùng CustomButton cho Icon */}
          <CustomButton variant="secondary" leftIcon={<Settings size={18} />}>
            Configure
          </CustomButton>

          <Button variant="secondary" disabled>
            Disabled
          </Button>
        </div>

        <CodeContainer>{`<Button variant="secondary">Cancel</Button>`}</CodeContainer>
      </OuterContainer>

      {/* 3. Tertiary / Danger */}
      <OuterContainer>
        <div className="border-b border-border-light pb-4">
          <h3 className="text-xl font-bold text-text-title mb-1">
            Tertiary & Danger
          </h3>
          <p className="text-sm text-gray-500">
            Sử dụng cho hành động hủy diệt (Destructive) hoặc cảnh báo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Thay tertiary bằng destructive (chuẩn Shadcn/UI) */}
          <CustomButton variant="destructive" leftIcon={<Trash2 size={18} />}>
            Delete Account
          </CustomButton>

          {/* Giả định "tertiary-light" là "outline" để minh họa style nhạt hơn */}
          <CustomButton
            variant="outline"
            leftIcon={<AlertTriangle size={18} />}
          >
            Report Issue
          </CustomButton>

          <Button variant="destructive" size="sm">
            Small Alert
          </Button>
        </div>

        <CodeContainer>{`<CustomButton variant="destructive">Delete</CustomButton>`}</CodeContainer>
      </OuterContainer>

      {/* 4. Special Variants */}
      <OuterContainer>
        <div className="border-b border-border-light pb-4">
          <h3 className="text-xl font-bold text-text-title mb-1">
            Special Variants
          </h3>
          <p className="text-sm text-gray-500">
            Styles và kích cỡ đặc biệt (Soft styles, Ghosts, Icons).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Giả định "primary-light" là "outline" hoặc "ghost" */}
          <CustomButton variant="outline" leftIcon={<Plus size={18} />}>
            New Item
          </CustomButton>

          <Button variant="ghost">Ghost Button</Button>
          <Button variant="link">Read More</Button>

          <div className="w-px h-8 bg-gray-300 mx-2"></div>

          {/* Buttons chỉ chứa Icon */}
          <Button variant="secondary" size="icon" aria-label="Notifications">
            <Bell size={20} />
          </Button>
          <Button variant="default" size="icon" aria-label="Search">
            <Search size={20} />
          </Button>
        </div>

        <CodeContainer>{`<Button variant="ghost">Ghost</Button>`}</CodeContainer>
      </OuterContainer>

      {/* 5. Size Comparison */}
      <OuterContainer>
        <div className="border-b border-border-light pb-4">
          <h3 className="text-xl font-bold text-text-title mb-1">
            Size Comparison
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <Button size="sm" variant="default">
            Small Button
          </Button>
          {/* Thay size="md" bằng size="default" */}
          <Button size="default" variant="default">
            Medium Button (Default)
          </Button>
          <Button size="lg" variant="default">
            Large Button
          </Button>
        </div>
      </OuterContainer>
    </div>
  );
};

export default ButtonShowcase;
