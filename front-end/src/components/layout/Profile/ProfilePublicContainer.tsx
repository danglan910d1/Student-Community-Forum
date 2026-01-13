"use client";

import { useParams } from "next/navigation";
import { SidebarLayoutWrapper } from "../SideBarWrapper";
import { ProfileSidebar } from "./ProfileSidebar";

export const ProfilePublicContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const params = useParams();
  // Nếu folder là [id] -> params.id
  // Nếu folder là [userId] -> params.userId
  const userId = params.id as string;

  return (
    <SidebarLayoutWrapper
      sidebar={<ProfileSidebar userId={userId} />}
      sidebarClassName="w-64"
      stickyClassName="sticky top-2 h-[calc(100vh-20px)]" // Trừ đi khoảng cách top
    >
      <div className="animate-in fade-in duration-500">{children}</div>
    </SidebarLayoutWrapper>
  );
};
