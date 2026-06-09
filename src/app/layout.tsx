import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Digital Workplace",
  description: "Internal employee portal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-[#f9fafb] font-sans antialiased text-[#111827]">
        {children}
      </body>
    </html>
  );
}
