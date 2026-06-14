import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — Digital Workplace",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Admin notice banner */}
      <div className="bg-amber-50 border-b border-amber-200 text-center py-1.5 text-xs text-amber-800 font-medium flex-shrink-0">
        您正在以管理员身份操作
      </div>

      {/* Top nav */}
      <nav className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-sm">Digital Workplace</span>
          <span className="text-gray-600 text-xs">|</span>
          <span className="text-xs px-2 py-0.5 bg-[#ff6b2b]/20 text-[#ff6b2b] rounded font-mono">ADMIN</span>
          <a href="/admin" className="text-gray-400 hover:text-white text-xs ml-2 transition-colors">
            Pages
          </a>
        </div>
        <a href="/" className="text-gray-400 hover:text-white text-xs transition-colors">
          ← View Site
        </a>
      </nav>

      <main className="flex-1 flex flex-col min-h-0">{children}</main>
    </div>
  );
}
