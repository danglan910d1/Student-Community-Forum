/** @type {import('tailwindcss').Config} */
import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";
const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        "base-bg": "#e5e7eb",
        "container-bg": "#fff",
        "text-default": "#374151",
        "text-title": "#041434",
        "text-light": "#fff",
        "hover-light-bg": "#f7f7f7",
        "border-light": "#e5e5e5",
        "primary-dark": "#1c395f",
        "primary-light": "#e6f0ff",
        "secondary-dark": "#dcdad9",
        "secondary-light": "#edecec",
        "tertiary-dark": "#c26b32",
        "tertiary-light": "#ffe8e8",
        "tertiary-light-text": "#c26b32",
        "yellow-100": "#fff4d4",
        "blue-100": "#dbe4f9",
        "purple-100": "#f0eafc",
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card))",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
      },
      fontFamily: {
        headline: ["var(--font-headline)", "sans-serif"],
        body: ["var(--font-roboto)", "sans-serif"],
      },
      boxShadow: {
        "post-shadow": "0 10px 20px rgba(0, 0, 0, 0.1)",
        "hover-shadow":
          "0 5px 10px -3px rgba(0, 0, 0, 0.1), 0 2px 4px -4px rgba(0, 0, 0, 0.05)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [animate],
};

export default config;
