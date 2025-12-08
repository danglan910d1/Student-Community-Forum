// src/app/layout.tsx

import './globals.css';
import { QueryProvider } from '@/providers/QueryProvider'; // Import provider

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider> {/* Bọc children với QueryProvider */}
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}