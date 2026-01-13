import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationSectionProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function PaginationSection({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationSectionProps) {
  // Hàm render các con số trang
  const renderPages = () => {
    const pages = [];

    // Luôn hiển thị 3 trang đầu (hoặc ít hơn nếu tổng trang < 3)
    const maxInitialPages = Math.min(3, totalPages);

    for (let i = 1; i <= maxInitialPages; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            href="#"
            isActive={currentPage === i}
            onClick={(e) => {
              e.preventDefault();
              onPageChange(i);
            }}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Nếu tổng trang > 3, hiển thị dấu ba chấm và trang cuối
    if (totalPages > 3) {
      if (currentPage > 3 && currentPage < totalPages) {
        // Nếu đang ở giữa, có thể hiển thị thêm trang hiện tại ở đây
        // Nhưng theo yêu cầu của bạn là 1-3 rồi ..., ta giữ đơn giản:
        pages.push(
          <PaginationItem key="ellipsis">
            <PaginationEllipsis />
          </PaginationItem>
        );
        pages.push(
          <PaginationItem key={currentPage}>
            <PaginationLink href="#" isActive>
              {currentPage}
            </PaginationLink>
          </PaginationItem>
        );
      }

      if (currentPage < totalPages - 1) {
        pages.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Luôn hiển thị trang cuối
      pages.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            href="#"
            isActive={currentPage === totalPages}
            onClick={(e) => {
              e.preventDefault();
              onPageChange(totalPages);
            }}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return pages;
  };

  return (
    <div className="mt-4 border-t pt-4">
      <Pagination>
        <PaginationContent>
          {/* Nút Previous */}
          <PaginationItem>
            <PaginationPrevious
              href="#"
              className={
                currentPage === 1
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) onPageChange(currentPage - 1);
              }}
            />
          </PaginationItem>

          {/* Render danh sách số trang đã tính toán */}
          {renderPages()}

          {/* Nút Next */}
          <PaginationItem>
            <PaginationNext
              href="#"
              className={
                currentPage === totalPages
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < totalPages) onPageChange(currentPage + 1);
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
