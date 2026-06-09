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
        // Logistics Modernism Design Tokens
        primary: "#ff6b2b",
        secondary: "#005e6f",
        tertiary: "#689ab5",
        "on-surface": "#111827",
        "surface-gray": "#f3f4f6",
        "primary-container": "#fff0e8",
        "border-subtle": "#e5e7eb",
        // Legacy vars
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ["Hanken Grotesk", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.06)",
        nav: "0 1px 0 0 #e5e7eb",
      },
    },
  },
  plugins: [],
};

export default config;
