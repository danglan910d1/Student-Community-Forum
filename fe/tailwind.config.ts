// tailwind.config.ts
import type { Config } from 'tailwindcss';
import HomePage from '@/app/page';

const config: Config = {
  // SỬA LỖI ĐƯỜNG DẪN CONTENT (Quan trọng nhất)
  content: ['./**/*.{js,ts,jsx,tsx,mdx}',],
  theme: {
    extend: {
      // THÊM CÁC MÀU THEME TÙY CHỈNH CỦA BẠN
      colors: {
        'fe-bg': '#fff',
        'fe-nav': '#1c395f',
        'fe-icon': '#c26b32',
        'fe-title': '#041434',
        'fe-text-light': '#fff',
        // ... các màu khác của bạn
      },
      // ... thêm các cấu hình khác (font, shadow)
    },
  },
  plugins: [],
};

export default config;
