'use client';
import { useState } from 'react';
// Đảm bảo import đúng vị trí mới của ActionItem sau khi đổi tên
import ActionItemCheck from '@/components/ui/ActionItemCheck';
import ActionItem from '../ui/ActionItem';


// Import các Icons từ lucide-react
import { FileEdit, Folder } from 'lucide-react';
// Lưu ý: Tùy thuộc vào phiên bản, bạn có thể dùng Pencil hoặc FileEdit cho Post.
// FileEdit có hình dạng bút chì và trang giấy, rất phù hợp cho "Post/Viết bài mới".


export default function PostActions() {
  const [activeTab, setActiveTab] = useState('post');


  return (
    // Khối chính với nền xám nhạt và bo góc (bg-highlight/50 p-2 rounded-xl)
    <div>
        <div className="bg-highlight/50 p-2 rounded-xl space-y-2">
     
      <ActionItem
        // Dùng Icon FileEdit (hoặc Pencil) của Lucide
        icon={<FileEdit className="w-5 h-5" />}
        label="Post"
        isActive={activeTab === 'post'}
        onClick={() => setActiveTab('post')}
      />
     
      <ActionItem
        // Dùng Icon Folder của Lucide
        icon={<Folder className="w-5 h-5" />}
        label="Topics"
        isActive={activeTab === 'topics'}
        onClick={() => setActiveTab('topics')}
      />
     
    </div>
    <div className="bg-highlight/50 p-2 rounded-xl space-y-2">
     
      <ActionItemCheck
        // Dùng Icon FileEdit (hoặc Pencil) của Lucide
        icon={<FileEdit className="w-5 h-5" />}
        label="Post"
        isActive={activeTab === 'post'}
        onClick={() => setActiveTab('post')}
      />
     
      <ActionItemCheck
        // Dùng Icon Folder của Lucide
        icon={<Folder className="w-5 h-5" />}
        label="Topics"
        isActive={activeTab === 'topics'}
        onClick={() => setActiveTab('topics')}
      />
     
    </div>
    </div>

    
  );
}
