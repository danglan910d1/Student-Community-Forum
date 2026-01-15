import ProfileDashboardLayout from "@/components/layout/ProfileDashboardLayout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProfileDashboardLayout>{children}</ProfileDashboardLayout>;
}
