// src/components/ui/NotificationItem.tsx

interface NotificationItemProps {
  title: string;
  details: string; // Ví dụ: Thời gian: 2h sáng ngày 24/12
  isHighlight?: boolean; // Tùy chọn để làm nổi bật hơn
  className?: string;
}

export default function NotificationItem({ 
  title, 
  details, 
  isHighlight = false, 
  className = '' 
}: NotificationItemProps) {
  
  // Nền xanh lá nhạt cố định (Tương đương bg-green-100)
  const baseBg = 'bg-[#e6f7eb]'; 
  
  return (
    <div className={`p-3 rounded-lg ${baseBg} ${className}`}>
      
      {/* Tiêu đề thông báo */}
      <h4 className="text-base font-bold text-text-title leading-tight">
        {title}
      </h4>
      
      {/* Chi tiết và Thời gian */}
      <p className="text-xs mt-1 text-text-title/80">
        {details}
      </p>
    </div>
  );
}