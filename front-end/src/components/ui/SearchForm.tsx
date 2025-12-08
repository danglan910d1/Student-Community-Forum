// src/components/ui/SearchForm.tsx

'use client'; 
import { Search } from 'lucide-react';
import { FormEvent, useState } from 'react';

export default function SearchForm() {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        // Logic tìm kiếm sẽ được thêm vào đây sau
        console.log('Searching for:', searchTerm);
    };

    return (
        <form 
            onSubmit={handleSubmit} 
            className="flex items-center w-full max-w-lg bg-white rounded-lg p-2 shadow-md"
        >
            <Search className="w-5 h-5 text-text-title/50 ml-2 flex-shrink-0" />
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm bài viết, chủ đề, thành viên..."
                className="w-full bg-transparent text-text-title text-sm focus:outline-none px-3"
            />
            {/* Nếu bạn muốn nút tìm kiếm rõ ràng, thêm button ở đây */}
            
        </form>
    );
}