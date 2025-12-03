// src/providers/QueryProvider.tsx

'use client'; // Bắt buộc là Client Component

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, ReactNode } from 'react';
// Tùy chọn: Devtools chỉ hiện khi ENV không phải là production
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'; 

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Tùy chọn: Cấu hình mặc định cho các query
            staleTime: 1000 * 60 * 5, // 5 phút
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
}