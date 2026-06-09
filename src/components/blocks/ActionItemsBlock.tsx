import type { ActionItemsConfig } from "@/types/blocks";

interface Props {
  config: ActionItemsConfig;
}

type Priority = "high" | "medium" | "low";

interface ActionItem {
  id: string;
  label: string;
  count?: number;
  priority: Priority;
  href: string;
}

// Mock action items — V1, real data will come from workflow engine
const MOCK_ITEMS: ActionItem[] = [
  {
    id: "ai-1",
    label: "审批待处理",
    count: 3,
    priority: "high",
    href: "#",
  },
  {
    id: "ai-2",
    label: "报销申请待确认",
    priority: "medium",
    href: "#",
  },
  {
    id: "ai-3",
    label: "考勤异常需处理",
    priority: "high",
    href: "#",
  },
];

const priorityConfig: Record<Priority, { dot: string; badge: string; label: string }> = {
  high: {
    dot: "bg-red-500",
    badge: "bg-red-100 text-red-700",
    label: "紧急",
  },
  medium: {
    dot: "bg-yellow-400",
    badge: "bg-yellow-100 text-yellow-700",
    label: "一般",
  },
  low: {
    dot: "bg-green-400",
    badge: "bg-green-100 text-green-700",
    label: "低优先级",
  },
};

export default function ActionItemsBlock({ config }: Props) {
  return (
    <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-[#e5e7eb] flex items-center justify-between">
        <h2 className="text-base font-semibold text-[#111827]">{config.title}</h2>
        <span className="text-xs font-medium bg-[#fff0e8] text-[#ff6b2b] px-2 py-0.5 rounded-full">
          {MOCK_ITEMS.length} 项待办
        </span>
      </div>

      <ul className="divide-y divide-[#e5e7eb]">
        {MOCK_ITEMS.map((item) => {
          const pc = priorityConfig[item.priority];
          return (
            <li key={item.id}>
              <a
                href={item.href}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#f3f4f6] transition-colors group"
              >
                {/* Priority indicator */}
                <span
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${pc.dot}`}
                  aria-label={`优先级：${pc.label}`}
                />

                <span className="flex-1 text-sm font-medium text-[#111827] group-hover:text-[#ff6b2b] transition-colors">
                  {item.label}
                  {item.count !== undefined && (
                    <span className="ml-1 text-gray-500">({item.count}项)</span>
                  )}
                </span>

                <span
                  className={`text-xs px-1.5 py-0.5 rounded font-medium shrink-0 ${pc.badge}`}
                >
                  {pc.label}
                </span>

                <svg
                  className="w-4 h-4 text-gray-400 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
