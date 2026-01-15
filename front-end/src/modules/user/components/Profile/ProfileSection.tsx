"use client";

import { UseFormReturn } from "react-hook-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CardLayout } from "@/components/layout/CardLayout";

import { ProfileFormValues } from "../../schemas/profileSchema";
import { PROFILE_FIELDS, PROFILE_TABS } from "../../constants/profile";
import { ProfileTabContent } from "./ProfileTabContent";
import { PasswordTabContent } from "./PasswordTabContent";

interface ProfileSectionProps {
  form: UseFormReturn<ProfileFormValues>;
  onSubmit: (values: ProfileFormValues) => void;
  isUpdating: boolean;
  isMine: boolean; // Thêm prop này
}

export function ProfileSection({
  form,
  onSubmit,
  isUpdating,
  isMine,
}: ProfileSectionProps) {
  return (
    <main className="animate-in fade-in duration-500">
      <Tabs defaultValue="profile" className="w-full">
        <CardLayout className="p-0 border-none shadow-sm overflow-hidden flex flex-col h-[650px]">
          <div className="px-6 pt-6 flex-none">
            <header className="mb-6">
              <h2 className="text-2xl font-bold uppercase tracking-tight">
                {isMine ? "Thiết lập tài khoản" : "Thông tin cá nhân"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isMine
                  ? "Quản lý định danh và bảo mật."
                  : "Thông tin công khai của thành viên."}
              </p>
            </header>

            {/* Chỉ hiển thị Tab điều hướng nếu là chính chủ */}
            {isMine && (
              <TabsList className="grid w-full grid-cols-2 mb-3">
                {PROFILE_TABS.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="font-semibold"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-6">
            <TabsContent value="profile" className="mt-0 outline-none">
              <ProfileTabContent
                form={form}
                onSubmit={onSubmit}
                isUpdating={isUpdating}
                fields={PROFILE_FIELDS}
                isMine={isMine} // Truyền xuống tầng cuối
              />
            </TabsContent>

            {isMine && (
              <TabsContent value="password" className="mt-0 outline-none">
                <PasswordTabContent />
              </TabsContent>
            )}
          </div>
        </CardLayout>
      </Tabs>
    </main>
  );
}
