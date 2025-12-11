/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // 1. MÀU GIAO DIỆN CHUNG (GENERAL UI COLORS)
        "base-bg": "#e5e7eb",
        "container-bg": "#fff",
        "text-default": "#374151",
        "text-title": "#041434",
        "text-light": "#fff",

        "hover-light-bg": "#f7f7f7",
        "border-light": "#e5e5e5",

        // 2. MÀU VAI TRÒ CHÍNH (PRIMARY - Approved)
        "primary-dark": "#1c395f",
        "primary-light": "#e6f0ff",

        // 3. MÀU VAI TRÒ PHỤ (SECONDARY - Xám/Xanh trung lập)
        "secondary-dark": "#dcdad9",
        "secondary-light": "#edecec",

        // 4. MÀU CẢNH BÁO/LỖI (TERTIARY - Cam/Hồng)
        "tertiary-dark": "#c26b32",
        "tertiary-light": "#ffe8e8",
        "tertiary-light-text": "#c26b32",

        // 5. MÀU TIỆN ÍCH KHÁC (UTILITY COLORS)
        "yellow-100": "#fff4d4",
        "blue-100": "#dbe4f9",
        "purple-100": "#f0eafc",
      },
      fontFamily: {
        // Thay thế chuỗi tên font bằng biến CSS
        headline: ["var(--font-headline)", "sans-serif"],
        body: ["var(--font-roboto)", "sans-serif"],
      },
      boxShadow: {
        "post-shadow": "0 10px 20px rgba(0, 0, 0, 0.1)",
        "hover-shadow":
          "0 5px 10px -3px rgba(0, 0, 0, 0.1), 0 2px 4px -4px rgba(0, 0, 0, 0.05)",
      },
    },
  },
  plugins: [],
};
