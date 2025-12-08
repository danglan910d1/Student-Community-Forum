// src/components/layout/PopularTagsList.tsx

import TagItem from '@/components/ui/TagItem';
// Import các Icons từ lucide-react
import { Code, DollarSign, PenTool, TrendingUp } from 'lucide-react'; 

export default function PopularTagsList() {
    // Dữ liệu mẫu (sẽ được fetch từ API sau)
    const tagsData = [
        { label: 'javascript', count: 82645, status: 'Đang thịnh hành', color: 'border-blue-500', icon: <Code /> },
        { label: 'bitcoin', count: 65523, status: 'Đang thịnh hành', color: 'border-yellow-500', icon: <DollarSign /> },
        { label: 'design', count: 51354, status: 'Đang thịnh hành', color: 'border-red-500', icon: <PenTool /> },
        { label: 'innovation', count: 48029, status: '', color: 'border-transparent', icon: <TrendingUp /> },
    ];

    return (
        <div className="mt-6 bg-white rounded-xl shadow-md overflow-hidden">
            
            {/* Tiêu đề Khối */}
            <h3 className="text-lg font-bold text-text-title p-3 border-b border-highlight">
                Popular Tags
            </h3>

            {/* Danh sách Tags */}
            <div className="divide-y divide-highlight">
                {tagsData.map((tag) => (
                    <TagItem
                        key={tag.label}
                        icon={tag.icon}
                        label={tag.label}
                        count={tag.count}
                        status={tag.status}
                        borderColor={tag.color} // Ví dụ: border-blue-500
                    />
                ))}
            </div>
        </div>
    );
}
// // src/components/layout/PopularTagsList.tsx

// import TagItem from '@/components/ui/TagItem';
// import { Code, DollarSign, PenTool, TrendingUp } from 'lucide-react'; 

// export default function PopularTagsList() {
//     // Dữ liệu mẫu (sẽ được fetch từ API sau)
//     const tagsData = [
//         // JavaScript: Icon xanh, Nền xanh nhạt, Highlight cam
//         { label: 'javascript', count: 82645, status: 'Đang thịnh hành', highlightColor: 'border-icon-color', iconBgColor: '#e0f2fe', iconColor: '#0b79e2', icon: <Code /> },
        
//         // Bitcoin: Icon vàng, Nền vàng nhạt, Highlight cam
//         { label: 'bitcoin', count: 65523, status: 'Đang thịnh hành', highlightColor: 'border-icon-color', iconBgColor: '#fff9e6', iconColor: '#c26b32', icon: <DollarSign /> },
        
//         // Design: Icon tím, Nền tím nhạt, Highlight cam
//         { label: 'design', count: 51354, status: 'Đang thịnh hành', highlightColor: 'border-icon-color', iconBgColor: '#eee5ff', iconColor: '#7b3eab', icon: <PenTool /> },
        
//         // Innovation: Không highlight
//         { label: 'innovation', count: 48029, status: '', highlightColor: 'border-transparent', iconBgColor: '#e6f7eb', iconColor: '#45b854', icon: <TrendingUp /> },
//     ];

//     return (
//         <div className="mt-6 bg-white rounded-xl shadow-md overflow-hidden">
            
//             {/* Tiêu đề Khối */}
//             <h3 className="text-lg font-bold text-text-title p-3 border-b border-highlight">
//                 Popular Tags
//             </h3>

//             {/* Danh sách Tags */}
//             <div className="divide-y divide-highlight">
//                 {tagsData.map((tag) => (
//                     <TagItem
//                         key={tag.label}
//                         icon={tag.icon}
//                         label={tag.label}
//                         count={tag.count}
//                         status={tag.status}
//                         highlightColor={tag.highlightColor} // Màu viền bên phải (Highlight)
//                         iconBgColor={tag.iconBgColor} // Màu nền icon
//                         iconColor={tag.iconColor} // Màu icon
//                     />
//                 ))}
//             </div>
//         </div>
//     );
// }