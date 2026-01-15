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
    <SidebarLayoutWrapper sidebar={<ProfileSidebar userId={userId} />}>
      <div className="animate-in fade-in duration-500">{children}</div>
    </SidebarLayoutWrapper>
  );
};
