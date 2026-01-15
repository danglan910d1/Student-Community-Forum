"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useNavStore } from "@/stores/useNavStore";
import { determineActiveLabel } from "@/lib/navigation";

export const NavSync = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const setActiveLabel = useNavStore((state) => state.setActiveLabel);

  useEffect(() => {
    const label = determineActiveLabel(pathname, searchParams);
    setActiveLabel(label);
  }, [pathname, searchParams, setActiveLabel]);

  return null;
};
