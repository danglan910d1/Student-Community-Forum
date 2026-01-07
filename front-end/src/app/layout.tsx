import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { InitialLoadProvider } from "@/providers/InitialLoadProvider";
import { NavSync } from "@/components/shared/Navigation/NavSync";
import { HEADER, COMMON } from "@/constants/commom";
import { Inter } from "next/font/google";
import { AuthCacheWatcher } from "@/components/shared/AuthCacheWatcher";

const fontSans = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sans",
});

const fontHeader = Inter({
  subsets: ["vietnamese"], // Quan trọng nhất là dòng này
  weight: ["600", "700", "800"], // Chọn các weight đậm cho Title
  variable: "--font-header",
});

// const fontHeader = Montserrat({
//   subsets: ["vietnamese"],
//   weight: ["700"],
//   variable: "--font-header",
// });

export const metadata: Metadata = {
  title: HEADER.TITLE,
  description: COMMON.PAGE_DES,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontHeader.variable}`}
    >
      <body className="antialiased bg-base-background">
        <QueryProvider>
          <AuthCacheWatcher />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <NavSync />
            <InitialLoadProvider>{children}</InitialLoadProvider>
            <Toaster />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
