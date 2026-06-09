import { getPublishedLayout } from "@/lib/page-layouts";
import { getUnreadCount } from "@/lib/announcements";
import BlockRenderer from "@/components/blocks/BlockRenderer";
import PageLayout from "@/components/ui/PageLayout";
import type { Block } from "@/types/blocks";

// ISR: revalidate every 60 seconds; publish calls revalidatePath() for immediate effect
export const revalidate = 60;

// Mock user — replace once SNOW-187 (auth) is integrated
const MOCK_USER = { name: "Alex Chen" };

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "早上好";
  if (hour < 18) return "下午好";
  return "晚上好";
}

function formatTodayDate() {
  return new Date().toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

// Fallback blocks when no layout is published in DB
const FALLBACK_BLOCKS: Block[] = [
  {
    id: "fallback-actions",
    type: "action_items",
    order: 1,
    config: { title: "待办事项" },
  },
  {
    id: "fallback-announcements",
    type: "announcements_feed",
    order: 2,
    config: { title: "最新公告", count: 5 },
  },
  {
    id: "fallback-events",
    type: "events_calendar",
    order: 3,
    config: { title: "近期活动" },
  },
  {
    id: "fallback-news",
    type: "news_culture",
    order: 4,
    config: { title: "企业文化 & 资讯", count: 3 },
  },
];

export default async function HomePage() {
  let blocks: Block[] | null = null;
  let unreadCount = 3;

  try {
    blocks = await getPublishedLayout("home");
  } catch {
    // DB not available at build time — fall back to defaults
  }

  try {
    unreadCount = await getUnreadCount();
  } catch {
    // ignore
  }

  const displayBlocks = blocks && blocks.length > 0 ? blocks : FALLBACK_BLOCKS;

  return (
    <PageLayout>
      {/* Welcome hero */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[#111827]">
          {getGreeting()}，{MOCK_USER.name}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">{formatTodayDate()}</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-[#e5e7eb] px-4 py-3 flex flex-col gap-1 shadow-card">
          <span className="text-xs text-gray-500">待办事项</span>
          <span className="text-2xl font-bold text-[#ff6b2b]">5</span>
        </div>
        <div className="bg-white rounded-xl border border-[#e5e7eb] px-4 py-3 flex flex-col gap-1 shadow-card">
          <span className="text-xs text-gray-500">未读公告</span>
          <span className="text-2xl font-bold text-[#005e6f]">{unreadCount}</span>
        </div>
        <div className="bg-white rounded-xl border border-[#e5e7eb] px-4 py-3 flex flex-col gap-1 shadow-card">
          <span className="text-xs text-gray-500">本周活动</span>
          <span className="text-2xl font-bold text-[#689ab5]">3</span>
        </div>
        <div className="bg-white rounded-xl border border-[#e5e7eb] px-4 py-3 flex flex-col gap-1 shadow-card">
          <span className="text-xs text-gray-500">必读未确认</span>
          <span className="text-2xl font-bold text-error">2</span>
        </div>
      </div>

      {/* Block content */}
      <BlockRenderer blocks={displayBlocks} />
    </PageLayout>
  );
}
