// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "media",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "light-bb": "var(--primary)",
        "dark-bb": "var(--warning)",
      },
      boxShadow: {
        container: "0 10px 20px rgba(0, 0, 0, 0.1)",
        "item-hover":
          "0 5px 10px -3px rgba(0, 0, 0, 0.1), 0 2px 4px -4px rgba(0, 0, 0, 0.05)",
        "user-panel":
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
