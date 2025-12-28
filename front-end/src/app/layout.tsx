import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { InitialLoadProvider } from "@/providers/InitialLoadProvider";

const fontSans = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sans",
});

const fontHeader = localFont({
  src: "../../public/fonts/StackSansHeadline-VariableFont_wght.ttf",
  display: "swap",
  variable: "--font-header",
});

export const metadata: Metadata = {
  title: "Student Community Forum",
  description: "Diễn đàn kết nối sinh viên CNTT",
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
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <InitialLoadProvider>{children}</InitialLoadProvider>
            <Toaster />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
