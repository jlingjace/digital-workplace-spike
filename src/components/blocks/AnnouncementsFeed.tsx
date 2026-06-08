"use client";

import type { AnnouncementsFeedConfig } from "@/types/blocks";

interface Props {
  config: AnnouncementsFeedConfig;
}

// Mock announcements for Spike — real data comes from BE-3
const MOCK_ANNOUNCEMENTS = [
  { id: "1", title: "Welcome to Digital Workplace", date: "2026-06-08", excerpt: "Platform is now live." },
  { id: "2", title: "System Maintenance on Saturday", date: "2026-06-07", excerpt: "Scheduled downtime 2-4 AM." },
  { id: "3", title: "New HR Policy Update", date: "2026-06-06", excerpt: "Please review the updated policies." },
];

export default function AnnouncementsFeed({ config }: Props) {
  const items = MOCK_ANNOUNCEMENTS.slice(0, config.count);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{config.title}</h2>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id} className="border-b pb-3 last:border-0">
            <div className="flex items-start justify-between gap-2">
              <span className="font-medium text-gray-700">{item.title}</span>
              <span className="text-xs text-gray-400 whitespace-nowrap">{item.date}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{item.excerpt}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
