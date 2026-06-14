"use client";

import type { AnnouncementsFeedConfig } from "@/types/blocks";

interface Props {
  config: AnnouncementsFeedConfig;
}

const MOCK_ANNOUNCEMENTS = [
  { id: "1", title: "Welcome to Digital Workplace", date: "2026-06-08", excerpt: "Platform is now live." },
  { id: "2", title: "System Maintenance on Saturday", date: "2026-06-07", excerpt: "Scheduled downtime 2-4 AM." },
  { id: "3", title: "New HR Policy Update", date: "2026-06-06", excerpt: "Please review the updated policies." },
  { id: "4", title: "Q2 Town Hall Recording Available", date: "2026-06-05", excerpt: "Watch the recording in the portal." },
  { id: "5", title: "New Employee Onboarding Cohort", date: "2026-06-04", excerpt: "5 new team members joined this week." },
];

export default function AnnouncementsFeed({ config }: Props) {
  const items = MOCK_ANNOUNCEMENTS.slice(0, config.count);

  return (
    <div className="bg-white rounded-card border border-gray-200 p-6">
      <h2 className="text-base font-semibold text-gray-800 mb-4">📢 Announcements</h2>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
            <div className="flex items-start justify-between gap-2">
              <span className="font-medium text-gray-700 text-sm">{item.title}</span>
              <span className="text-xs text-gray-400 whitespace-nowrap font-mono">{item.date}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{item.excerpt}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
