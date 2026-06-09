"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import type { Announcement } from "@/types/announcement";

interface TopNavProps {
  onHamburgerClick?: () => void;
}

export default function TopNav({ onHamburgerClick }: TopNavProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleBellClick = async () => {
    setDropdownOpen((prev) => !prev);
    if (!dropdownOpen && notifications.length === 0) {
      setLoading(true);
      try {
        const res = await fetch("/api/portal/announcements?limit=5");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.items ?? []);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
  };

  return (
    <header className="h-14 bg-white border-b border-[#e5e7eb] flex items-center px-4 gap-3 shrink-0 shadow-[0_1px_0_0_#e5e7eb]">
      {/* Mobile hamburger */}
      <button
        className="md:hidden p-2 rounded hover:bg-[#f3f4f6] transition-colors"
        onClick={onHamburgerClick}
        aria-label="Open menu"
      >
        <svg className="w-5 h-5 text-[#111827]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Logo (mobile only — desktop shows it in sidebar) */}
      <Link href="/" className="md:hidden font-semibold text-[#111827] text-sm">
        Digital Workplace
      </Link>

      <div className="flex-1" />

      {/* Bell / notification */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={handleBellClick}
          className="relative p-2 rounded-full hover:bg-[#f3f4f6] transition-colors"
          aria-label="Notifications"
          aria-expanded={dropdownOpen}
          aria-haspopup="true"
        >
          <svg className="w-5 h-5 text-[#111827]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {/* Unread badge */}
          <span className="absolute top-1 right-1 w-4 h-4 bg-[#ff6b2b] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            3
          </span>
        </button>

        {/* Notifications dropdown */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-1 w-80 bg-white rounded-lg shadow-lg border border-[#e5e7eb] z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-[#e5e7eb] flex items-center justify-between">
              <span className="text-sm font-semibold text-[#111827]">通知</span>
              <Link
                href="/announcements"
                className="text-xs text-[#ff6b2b] hover:underline"
                onClick={() => setDropdownOpen(false)}
              >
                查看全部
              </Link>
            </div>

            {loading ? (
              <div className="px-4 py-6 text-center text-sm text-gray-400">加载中...</div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-400">暂无通知</div>
            ) : (
              <ul>
                {notifications.map((n) => (
                  <li key={n.id} className="border-b border-[#e5e7eb] last:border-0">
                    <Link
                      href={`/announcements/${n.id}`}
                      className="block px-4 py-3 hover:bg-[#f3f4f6] transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <p className="text-sm font-medium text-[#111827] line-clamp-1">{n.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {n.department} · {formatDate(n.publishedAt)}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* User avatar */}
      <div className="flex items-center gap-2">
        <span
          className="w-8 h-8 rounded-full bg-[#005e6f] text-white flex items-center justify-center text-sm font-semibold select-none"
          aria-label="User: Alex Chen"
        >
          A
        </span>
        <span className="hidden sm:block text-sm text-[#111827] font-medium">Alex Chen</span>
      </div>
    </header>
  );
}
