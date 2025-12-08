// Ví dụ trong một FilterButtons Component

import PillButton from '@/components/ui/PillButton';
import { useState } from 'react';

export default function FilterButtons() {
  const [activeFilter, setActiveFilter] = useState('newest');

  return (
    <div className="flex space-x-2">
      <PillButton 
        isActive={activeFilter === 'newest'} 
        onClick={() => setActiveFilter('newest')}
      >
        Mới nhất
      </PillButton>
      
      <PillButton 
        isActive={activeFilter === 'popular'} 
        onClick={() => setActiveFilter('popular')}
      >
        Phổ biến
      </PillButton>
      
      <PillButton 
        isActive={activeFilter === 'resolved'} 
        onClick={() => setActiveFilter('resolved')}
      >
        Đã Giải quyết
      </PillButton>
    </div>
  );
}