/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        "base-bg": "#fff",
        "nav-bg": "#1c395f",
        "container-bg": "#fff",
        highlight: "#dcdad9",
        "icon-color": "#c26b32",
        "text-title": "#041434",
        "text-light": "#fff",
        "btn-accent": "#3b6cb5",
        "btn-hover": "#2e4a6e",
        "yellow-100": "#fff4d4", // Tông màu vàng nhạt tùy chỉnh
        "blue-100": "#dbe4f9", // Tông màu xanh nhạt tùy chỉnh (gần với nền post)
        "purple-100": "#f0eafc", // Tông màu tím nhạt tùy chỉnh
        // Màu Tùy chỉnh cho Tag (để thay thế CSS tùy chỉnh)
        "tag-performance-bg": "#ffe8e8", // Nền đỏ/hồng nhạt (tương đương bg-red-100 cũ)
        "tag-performance-text": "#c26b32", // Text màu cam (tương đương icon-color)

        "tag-tech-bg": "#e6f0ff", // Nền xanh nhạt cho Tech/AI/React
        "tag-tech-text": "#1c395f", // Text màu xanh đậm (tương đương nav-bg)
      },
      fontFamily: {
        // Thay thế chuỗi tên font bằng biến CSS
        headline: ["var(--font-headline)", "sans-serif"],
        body: ["var(--font-roboto)", "sans-serif"],
      },
      boxShadow: {
        "default-card":
          "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        "post-shadow":
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
        "header-shadow": "0 4px 6px -1px rgba(0, 0, 0, 0.3)",
      },
      borderRadius: {
        xl: "0.75rem", // Tăng độ bo góc để khớp
      },
    },
  },
  plugins: [],
};
