import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#ff6b2b",
          container: "#fff0e8",
          hover: "#e55a1c",
        },
        secondary: {
          DEFAULT: "#005e6f",
          container: "#e0f4f7",
        },
        tertiary: "#689ab5",
        surface: {
          DEFAULT: "#ffffff",
          gray: "#f3f4f6",
          subtle: "#e5e7eb",
        },
        "on-surface": "#111827",
        "success-bg": "#dcfce7",
        "warning-bg": "#fef3c7",
        "error-bg": "#fee2e2",
        "info-bg": "#dbeafe",
      },
      fontFamily: {
        sans: ["Hanken Grotesk", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Menlo", "monospace"],
      },
      borderRadius: {
        btn: "8px",
        card: "16px",
      },
    },
  },
  plugins: [],
};
export default config;
