"use client";

import { useState, type ReactNode } from "react";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";

interface PageLayoutProps {
  children: ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar (desktop always visible, mobile via overlay) */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0">
        <TopNav onHamburgerClick={() => setMobileSidebarOpen(true)} />

        <main className="flex-1 bg-[#f9fafb] p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
