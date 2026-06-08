import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — Digital Workplace",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-semibold">Digital Workplace Admin</span>
          <a href="/admin" className="text-gray-300 hover:text-white text-sm">
            Pages
          </a>
        </div>
        <a href="/" className="text-gray-300 hover:text-white text-sm">
          ← View Site
        </a>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  );
}
