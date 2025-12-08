// src/components/layout/NotificationBlock.tsx

import NotificationItem from '@/components/ui/NotificationItem';

export default function NotificationBlock() {
    const notifications = [
        { 
            title: 'Báo trì hệ thống', 
            details: 'Thời gian: 2h sáng ngày mai (24/12). Dự kiến 1 giờ.',
            isHighlight: true
        },
        { 
            title: 'Cuộc thi Code - Winter Hackathon', 
            details: 'Bắt đầu: 20/12. Đăng ký ngay để nhận giải thưởng!',
            isHighlight: false
        },
    ];

    return (
        // Khối chính: Nền trắng, bo góc, bóng đổ
        <div className="mt-6 bg-white rounded-xl shadow-md overflow-hidden">
            
            {/* Tiêu đề Khối */}
            {/* Màu tiêu đề xanh lá đậm (text-green-600), viền dưới xanh lá nhạt */}
            <h3 className="text-base font-bold text-green-600 p-3 border-b-2 border-green-200">
                THÔNG BÁO ADMIN
            </h3>

            {/* Danh sách Thông báo */}
            <div className="p-3 space-y-3">
                {notifications.map((notif, index) => (
                    <NotificationItem
                        key={index}
                        title={notif.title}
                        details={notif.details}
                        isHighlight={notif.isHighlight}
                    />
                ))}
            </div>
        </div>
    );
}