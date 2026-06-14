"use client";

import type { QuickAccessGridConfig } from "@/types/blocks";

interface Props {
  config: QuickAccessGridConfig;
}

const MOCK_ITEMS = [
  { label: "HR Portal", url: "#", icon: "👥" },
  { label: "IT Help Desk", url: "#", icon: "🛠️" },
  { label: "Expense Reports", url: "#", icon: "💰" },
  { label: "Time Off", url: "#", icon: "🌴" },
  { label: "Benefits", url: "#", icon: "❤️" },
  { label: "Payroll", url: "#", icon: "📊" },
];

export default function QuickAccessGrid({ config }: Props) {
  const items = MOCK_ITEMS.slice(0, config.count);

  return (
    <div className="bg-white rounded-card border border-gray-200 p-6">
      <h2 className="text-base font-semibold text-gray-800 mb-4">🔲 Quick Access</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {items.map((item, i) => (
          <a
            key={i}
            href={item.url}
            className="flex flex-col items-center p-4 bg-gray-50 rounded-btn hover:bg-[#fff0e8] hover:border-[#ff6b2b] border border-transparent transition-colors text-center"
          >
            {item.icon && <span className="text-2xl mb-2">{item.icon}</span>}
            <span className="text-xs font-medium text-gray-700">{item.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
