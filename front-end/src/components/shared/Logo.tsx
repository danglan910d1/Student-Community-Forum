"use client";

export const Logo = ({ className = "" }: { className?: string }) => {
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Thay vì dùng router.push (chỉ load nội bộ),
    // ta dùng window.location để ép trình duyệt tải lại toàn trang
    window.location.href = "/";
  };

  return (
    <button
      onClick={handleLogoClick}
      className={`flex items-center gap-2 border-none bg-transparent cursor-pointer ${className}`}
    >
      <h1 className="text-title text-lg tracking-tighter">STUDENT FORUM</h1>
    </button>
  );
};
