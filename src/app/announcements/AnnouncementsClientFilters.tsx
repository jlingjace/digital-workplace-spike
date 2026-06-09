"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Announcement } from "@/types/announcement";
import Badge from "@/components/ui/Badge";

interface Props {
  departments: string[];
  allItems: Announcement[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default function AnnouncementsClientFilters({ departments, allItems }: Props) {
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");

  const filtered = useMemo(() => {
    let list = allItems;
    if (selectedDept !== "all") {
      list = list.filter((a) => a.department === selectedDept);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allItems, search, selectedDept]);

  const required = filtered.filter((a) => a.isRequired);
  const regular = filtered.filter((a) => !a.isRequired);

  return (
    <>
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            placeholder="搜索公告标题..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6b2b] focus:border-transparent"
            aria-label="搜索公告"
          />
        </div>

        {/* Department filter */}
        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="px-3 py-2 text-sm bg-white border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6b2b] cursor-pointer"
          aria-label="按部门筛选"
        >
          <option value="all">全部部门</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Must-read section */}
      {required.length > 0 && (
        <section className="mb-6" aria-label="必读公告">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-semibold text-[#111827]">必读公告</h2>
            <span className="text-xs bg-[#fff0e8] text-[#ff6b2b] px-2 py-0.5 rounded-full font-medium">
              {required.length} 项
            </span>
          </div>
          <ul className="space-y-2">
            {required.map((item) => (
              <AnnouncementCard key={item.id} item={item} highlighted />
            ))}
          </ul>
        </section>
      )}

      {/* Regular announcements */}
      {regular.length > 0 ? (
        <section aria-label="全部公告">
          <h2 className="text-sm font-semibold text-[#111827] mb-3">全部公告</h2>
          <ul className="space-y-2">
            {regular.map((item) => (
              <AnnouncementCard key={item.id} item={item} />
            ))}
          </ul>
        </section>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <svg className="w-10 h-10 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p>未找到匹配的公告</p>
        </div>
      ) : null}
    </>
  );
}

function AnnouncementCard({
  item,
  highlighted = false,
}: {
  item: Announcement;
  highlighted?: boolean;
}) {
  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }

  return (
    <li>
      <Link
        href={`/announcements/${item.id}`}
        className={`
          block rounded-xl border px-4 py-3.5 transition-colors group
          ${
            highlighted
              ? "border-l-4 border-[#ff6b2b] bg-[#fff8f5] hover:bg-[#fff0e8]"
              : "border-[#e5e7eb] bg-white hover:bg-[#f9fafb]"
          }
        `}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Badges + title */}
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {item.isRequired && <Badge variant="required">必读</Badge>}
              {!item.readAt && <Badge variant="new">NEW</Badge>}
              {item.readAt && (
                <span className="inline-flex items-center gap-0.5 text-xs text-green-600">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  已读
                </span>
              )}
            </div>
            <h3 className="text-sm font-medium text-[#111827] group-hover:text-[#ff6b2b] transition-colors line-clamp-1">
              {item.title}
            </h3>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.excerpt}</p>
          </div>

          <div className="shrink-0 flex flex-col items-end gap-1">
            <time className="text-xs text-gray-400" dateTime={item.publishedAt}>
              {formatDate(item.publishedAt)}
            </time>
            <span className="text-xs text-[#005e6f] bg-[#e6f4f7] px-1.5 py-0.5 rounded font-medium">
              {item.department}
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
}
