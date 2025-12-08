// src/components/layout/PostCard.tsx

'use client'; 
import Avatar from '@/components/ui/Avatar'; 
import Chip from '@/components/ui/Chip';
// Import các Icons từ lucide-react
import { Eye, MessageSquare, ThumbsUp } from 'lucide-react'; 

// Giả định kiểu dữ liệu bài viết
interface PostCardProps {
  id: string;
  title: string;
  summary: string;
  authorName: string;
  authorAvatarSrc?: string;
  date: string;
  views: number;
  comments: number;
  votes: number;
  tags: { label: string; variant: 'tech' | 'performance' | 'highlight' | 'default' }[];
  isSolved?: boolean;
  className?: string;
}

export default function PostCard({
  title,
  summary,
  authorName,
  authorAvatarSrc,
  date,
  views,
  comments,
  votes,
  tags,
  isSolved = false,
  className = '',
}: PostCardProps) {

  return (
    // Sử dụng border-b để tạo đường chia giữa các bài viết, khớp với hình mẫu
    <article className={`bg-white p-5 border-b border-highlight last:border-b-0 ${className}`}>
      
      {/* 1. Tiêu đề và Tóm tắt */}
      <h2 className="text-xl font-bold text-text-title hover:text-nav-bg cursor-pointer transition duration-150 leading-snug">
        {title}
      </h2>
      <p className="text-base text-text-title/90 mt-2 line-clamp-2">
        {summary}
      </p>

      {/* 2. Thông tin Tác giả và Meta */}
      <div className="flex items-center justify-between mt-3 text-sm text-text-title/70">
        
        {/* Tác giả & Ngày đăng */}
        <div className="flex items-center space-x-2">
          {/* Avatar nhỏ (md) */}
          <Avatar 
            src={authorAvatarSrc} 
            alt={authorName} 
            size="md" 
          />
          <span className="font-semibold">{authorName}</span>
          <span className="mx-1">•</span>
          <span>{date}</span>
        </div>

        {/* Lượt xem, Bình luận, Votes */}
        <div className="flex items-center space-x-3">
          
          {/* Lượt xem */}
          <span className="flex items-center space-x-1">
            <Eye className="w-4 h-4" />
            <span>{views.toLocaleString()}</span>
          </span>
          
          {/* Bình luận */}
          <span className="flex items-center space-x-1">
            <MessageSquare className="w-4 h-4" />
            <span>{comments.toLocaleString()} Comments</span>
          </span>

          {/* Votes (Giả định nằm bên cạnh) */}
          <span className="flex items-center space-x-1">
            <ThumbsUp className="w-4 h-4" />
            <span>{votes.toLocaleString()} Votes</span>
          </span>
        </div>
      </div>
      
      {/* 3. Tags (Sử dụng component Chip) */}
      <div className="flex space-x-2 mt-4">
        {tags.map((tag) => (
          <Chip key={tag.label} variant={tag.variant}>
            {tag.label}
          </Chip>
        ))}
        {/* Nếu bài viết đã giải quyết, thêm tag nổi bật */}
        {isSolved && (
          <Chip variant="highlight">Đã Giải quyết</Chip>
        )}
      </div>

    </article>
  );
}