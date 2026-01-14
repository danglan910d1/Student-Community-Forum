// modules/post/components/PostList/AdminContentFilter.tsx
import { ContentFilter } from "@/components/shared/FilterMenu";
import { MY_POST_FILTERS, POST_FILTERS } from "../../constants/post";

interface AdminContentFilterProps {
  statusValue: string;
  sortValue: string;
  totalCount: number;
  onUpdateParams: (next: Record<string, string | number | null>) => void;
}

export const AdminFilter = ({
  statusValue,
  sortValue,
  totalCount,
  onUpdateParams,
}: AdminContentFilterProps) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Nhóm 1: Lọc Trạng thái */}
      <ContentFilter
        titlePrefix="Trạng thái hệ thống"
        totalCount={totalCount}
        options={MY_POST_FILTERS}
        currentValue={statusValue}
        onFilterChange={(val) => onUpdateParams({ status: val, page: 1 })}
        className="mb-0" // Bỏ margin bottom để sát nhau hơn
      />

      {/* Nhóm 2: Lọc Sắp xếp */}
      <ContentFilter
        titlePrefix="Sắp xếp theo"
        totalCount={totalCount}
        options={POST_FILTERS}
        currentValue={sortValue}
        onFilterChange={(val) => onUpdateParams({ sort: val, page: 1 })}
        className="mb-0 border-t pt-4" // Thêm đường kẻ phân cách nhẹ
      />
    </div>
  );
};
