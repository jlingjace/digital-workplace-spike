"use client";

import type { QuickAccessGridConfig } from "@/types/blocks";

interface Props {
  config: QuickAccessGridConfig;
}

// Mock items for Spike — real data comes from FE-2
const MOCK_ITEMS = [
  { label: "HR Portal", url: "#", icon: "👥" },
  { label: "IT Help Desk", url: "#", icon: "🛠️" },
  { label: "Expense Reports", url: "#", icon: "💰" },
  { label: "Time Off", url: "#", icon: "🌴" },
];

export default function QuickAccessGrid({ config }: Props) {
  const items = config.items.length > 0 ? config.items : MOCK_ITEMS;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{config.title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map((item, i) => (
          <a
            key={i}
            href={item.url}
            className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors text-center"
          >
            {item.icon && <span className="text-2xl mb-2">{item.icon}</span>}
            <span className="text-sm font-medium text-gray-700">{item.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
