import { CardLayout } from "@/components/layout/CardLayout";
import { QUICK_NAV_ITEMS } from "@/constants/navigation";
import { QuickNavItem } from "./QuickNavItem";

export const QuickNavigation = () => {
  return (
    <CardLayout className="shadow-sm border-none">
      {QUICK_NAV_ITEMS.map((item, index) => (
        <QuickNavItem key={item.label} item={item} showBorder={index > 0} />
      ))}
    </CardLayout>
  );
};
