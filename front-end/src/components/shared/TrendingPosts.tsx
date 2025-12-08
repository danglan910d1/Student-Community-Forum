// src/components/layout/TrendingPosts.tsx

import TrendingPostItem from '../ui/TrendingPostItem';
import { Cpu } from 'lucide-react'; 

export default function TrendingPosts() {
    const trendingData = [
        { 
            title: '[Review] Môn học CT201 - Khó hay Dễ?', 
            author: 'Minh T.', 
            details: '250 lượt xem', 
            tags: 'Tag: #Review, #CT201 | 30 bình luận',
            isTop: true 
        },
        { 
            title: 'Giải quyết vấn đề CSS Flexbox trong React', 
            author: 'An N.', 
            details: '150 lượt xem', 
            tags: 'Tag: #React, #CSS | 15 bình luận',
            isTop: false 
        },
        { 
            title: '5 công cụ AI hữu ích cho sinh viên IT', 
            author: 'Bảo Đ.', 
            details: 'Cập nhật: 12/2024', 
            tags: 'Tag: #AI, #Công cụ | 10 bình luận',
            isTop: false,
            // Ví dụ dùng icon tùy chỉnh nếu muốn
            icon: <Cpu className="w-5 h-5" /> 
        },
    ];

    return (
        // Khối chính: Nền trắng, bo góc, bóng đổ
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
            
            {/* Tiêu đề Khối */}
            <h3 className="text-base font-bold text-red-600 p-3 border-b-2 border-red-200">
                BÀI VIẾT NỔI BẬT (TOP)
            </h3>

            {/* Danh sách Bài viết */}
            <div className="divide-y divide-highlight">
                {trendingData.map((post, index) => (
                    <TrendingPostItem
                        key={index}
                        title={post.title}
                        author={post.author}
                        details={post.details}
                        tags={post.tags}
                        isTop={post.isTop}
                        icon={post.icon}
                    />
                ))}
            </div>
        </div>
    );
}