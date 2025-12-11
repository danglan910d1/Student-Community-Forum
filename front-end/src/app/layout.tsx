// src/app/layout.tsx
import { QueryProvider } from "@/providers/QueryProvider";
import "./globals.css";
// Import fonts
import { Roboto } from "next/font/google";
import localFont from "next/font/local"; // Dùng localFont cho Stack Sans Headline nếu không có trên Google Fonts

// Cấu hình Roboto (text)
const roboto = Roboto({
  weight: ["400", "500", "700"], // Chọn các trọng lượng font bạn muốn dùng
  subsets: ["latin"],
  variable: "--font-roboto",
});

// Cấu hình Stack Sans Headline (giả sử bạn đã đặt font file trong thư mục 'public/fonts')
// Nếu bạn không có file font, hãy sử dụng một font sans-serif mặc định.
// Nếu Stack Sans Headline không có trên Google Fonts, bạn phải tải font về.
// Ví dụ: Sử dụng Inter thay thế nếu bạn muốn dùng Google Font ngay lập tức
// Hoặc nếu bạn muốn dùng Stack Sans Headline, bạn cần download file .woff2 và đặt trong public/fonts
const stackSansHeadline = localFont({
  src: [
    {
      path: "../../public/fonts/StackSansHeadline-VariableFont_wght.ttf", // Cập nhật đường dẫn thực tế
      weight: "400",
    },
  ],
  variable: "--font-headline",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Xóa tất cả khoảng trắng và xuống dòng khỏi thẻ <html> mở
    <html
      lang="en"
      className={`${roboto.variable} ${stackSansHeadline.variable}`}
    >
      <body>
        <QueryProvider>
          {" "}
          {/* QueryProvider phải bọc nội dung bên trong HTML */}
          {/* Children của layout thường được đặt trong body */}
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
