import { Logo } from "@/components/shared/Logo";
import { SearchBar } from "@/components/shared/SearchBar";
import { TopicDropdownContainer } from "@/modules/topic/containers/TopicDropdownContainer";
import { Bell, HelpCircle } from "lucide-react";

export function Header() {
  return (
    <header className="bg-header-footer sticky top-0 z-50 w-full border-b-2 border-primary dark:border-warning shadow-md h-14">
      <div className="mx-auto grid w-full h-full max-w-[1800px] grid-cols-9 gap-4 px-2 items-center">
        {/* Logo chiếm 2 cột (2fr) */}
        <div className="col-span-2">
          <Logo />
        </div>

        {/* Cụm Nav + Search + Actions chiếm 7 cột (7fr) */}
        <div className="col-span-7 flex items-center space-x-4">
          <div className="flex-shrink-0">
            <TopicDropdownContainer />
          </div>

          <div className="flex-1">
            <SearchBar />
          </div>

          <div className="flex items-center space-x-4 text-gray-500 flex-shrink-0">
            <button className="p-1.5 rounded-full hover:bg-gray-100 transition-shadow shadow-sm">
              <HelpCircle className="h-5 w-5" />
            </button>
            <div className="relative p-1.5 rounded-full hover:bg-gray-100 transition-shadow shadow-sm cursor-pointer">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                3
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
