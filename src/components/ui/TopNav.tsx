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
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch unread count on mount
  useEffect(() => {
    fetch("/api/portal/unread-count")
      .then((r) => r.json())
      .then((d) => setUnreadCount(d.count ?? 0))
      .catch(() => {});
  }, []);

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
    <header className="h-14 bg-white border-b border-border-subtle flex items-center px-4 gap-3 shrink-0 shadow-nav">
      {/* Mobile hamburger */}
      <button
        className="md:hidden p-2 rounded hover:bg-surface-gray transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
        onClick={onHamburgerClick}
        aria-label="Open menu"
      >
        <svg className="w-5 h-5 text-on-surface" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Logo (mobile only — desktop shows it in sidebar) */}
      <Link href="/" className="md:hidden font-semibold text-on-surface text-sm">
        Digital Workplace
      </Link>

      <div className="flex-1" />

      {/* Bell / notification */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={handleBellClick}
          className="relative p-2 rounded-full hover:bg-surface-gray transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
          aria-label={`通知，${unreadCount} 条未读`}
          aria-expanded={dropdownOpen}
          aria-haspopup="menu"
        >
          <svg className="w-5 h-5 text-on-surface" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {/* Unread badge — hidden when count is 0 */}
          {unreadCount > 0 && (
            <span
              className="absolute top-1 right-1 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center"
              aria-hidden="true"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* Notifications dropdown — bounded to viewport on narrow screens */}
        {dropdownOpen && (
          <div
            className="absolute right-0 mt-1 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-lg border border-border-subtle z-50 overflow-hidden"
            role="menu"
            aria-label="最新通知"
          >
            <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between">
              <span className="text-sm font-semibold text-on-surface">通知</span>
              <Link
                href="/announcements"
                className="text-xs text-primary hover:underline"
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
              <ul role="none">
                {notifications.map((n) => (
                  <li key={n.id} className="border-b border-border-subtle last:border-0" role="none">
                    <Link
                      href={`/announcements/${n.id}`}
                      className="block px-4 py-3 hover:bg-surface-gray transition-colors"
                      role="menuitem"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <p className="text-sm font-medium text-on-surface line-clamp-1">{n.title}</p>
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
          className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center text-sm font-semibold select-none"
          aria-label="User: Alex Chen"
        >
          A
        </span>
        <span className="hidden sm:block text-sm text-on-surface font-medium">Alex Chen</span>
      </div>
    </header>
  );
}
