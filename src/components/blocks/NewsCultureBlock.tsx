import type { NewsCultureConfig } from "@/types/blocks";

interface Props {
  config: NewsCultureConfig;
}

interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  /** Placeholder color for the image */
  colorClass: string;
}

// Mock culture/news items — V1
const MOCK_NEWS: NewsItem[] = [
  {
    id: "news-1",
    title: "十周年庆典：我们一起走过的故事",
    excerpt: "回顾公司成立十年来的高光时刻，感受每一位同事的奋斗足迹。",
    date: "2026-06-07",
    category: "企业文化",
    colorClass: "bg-[#ff6b2b]",
  },
  {
    id: "news-2",
    title: "优秀员工专访：从实习生到技术负责人",
    excerpt: "专访技术中台负责人 David，分享他在公司七年间的成长心路历程。",
    date: "2026-06-05",
    category: "人物故事",
    colorClass: "bg-[#005e6f]",
  },
  {
    id: "news-3",
    title: "绿色办公倡议：我们的环保行动报告",
    excerpt: "2026年Q1减碳成果出炉，员工绿色通勤参与率达到历史新高。",
    date: "2026-06-03",
    category: "社会责任",
    colorClass: "bg-[#689ab5]",
  },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("zh-CN", {
    month: "short",
    day: "numeric",
  });
}

export default function NewsCultureBlock({ config }: Props) {
  const count = config.count ?? 3;
  const items = MOCK_NEWS.slice(0, count);

  return (
    <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-[#e5e7eb] flex items-center justify-between">
        <h2 className="text-base font-semibold text-[#111827]">{config.title}</h2>
        <a href="#" className="text-xs text-[#ff6b2b] hover:underline font-medium">
          更多资讯
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-[#e5e7eb]">
        {items.map((item) => (
          <a
            key={item.id}
            href="#"
            className="group flex flex-col hover:bg-[#f3f4f6] transition-colors"
          >
            {/* Placeholder image */}
            <div
              className={`h-28 ${item.colorClass} flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity`}
              aria-hidden="true"
            >
              <svg
                className="w-10 h-10 text-white/70"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M4.5 20.25h15a.75.75 0 00.75-.75V6.75a.75.75 0 00-.75-.75h-15a.75.75 0 00-.75.75v12.75c0 .414.336.75.75.75z"
                />
              </svg>
            </div>

            {/* Content */}
            <div className="px-4 py-3 flex flex-col flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-medium text-[#005e6f] bg-[#e6f4f7] px-1.5 py-0.5 rounded">
                  {item.category}
                </span>
                <time className="text-xs text-gray-400" dateTime={item.date}>
                  {formatDate(item.date)}
                </time>
              </div>
              <h3 className="text-sm font-semibold text-[#111827] group-hover:text-[#ff6b2b] transition-colors line-clamp-2">
                {item.title}
              </h3>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.excerpt}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
