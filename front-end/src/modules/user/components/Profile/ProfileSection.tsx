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
}

export function ProfileSection({
  form,
  onSubmit,
  isUpdating,
}: ProfileSectionProps) {
  return (
    <main className="animate-in fade-in duration-500">
      <Tabs defaultValue="profile" className="w-full">
        <CardLayout className="p-0 border-none shadow-sm overflow-hidden flex flex-col h-[650px]">
          <div className="px-6 pt-6 flex-none">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold uppercase tracking-tight">
                  Thiết lập tài khoản
                </h2>
                <p className="text-sm text-muted-foreground">
                  Quản lý định danh và bảo mật cá nhân.
                </p>
              </div>
            </header>

            <TabsList className="grid w-full grid-cols-2 mb-3">
              {PROFILE_TABS.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="font-semibold transition-all cursor-pointer"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* 3. Phần nội dung này sẽ nhận hết diện tích còn lại và TỰ SCROLL */}
          <div className="flex-1 overflow-y-auto px-6">
            <TabsContent value="profile" className="mt-0 outline-none">
              <ProfileTabContent
                form={form}
                onSubmit={onSubmit}
                isUpdating={isUpdating}
                fields={PROFILE_FIELDS}
              />
            </TabsContent>

            <TabsContent value="password" className="mt-0 outline-none">
              <PasswordTabContent />
            </TabsContent>

            {/* Vùng đệm test height nằm bên trong vùng scroll */}
            <div className="mt-10 p-4 border-2 border-dashed border-muted rounded-lg opacity-50">
              <p className="text-xs text-center text-muted-foreground italic">
                Nội dung dài sẽ scroll bên trong Card này
              </p>
              <div className="h-[500px]" />
            </div>
          </div>
        </CardLayout>
      </Tabs>
    </main>
  );
}
