import Link from "next/link";
import { getAnnouncements } from "@/lib/announcements";
import type { AnnouncementsFeedConfig } from "@/types/blocks";
import Badge from "@/components/ui/Badge";

interface Props {
  config: AnnouncementsFeedConfig;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default async function AnnouncementsBlock({ config }: Props) {
  const { items } = await getAnnouncements({ limit: config.count ?? 5 });

  const required = items.filter((a) => a.isRequired);
  const regular = items.filter((a) => !a.isRequired);

  return (
    <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-card overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#e5e7eb] flex items-center justify-between">
        <h2 className="text-base font-semibold text-[#111827]">{config.title}</h2>
        <Link
          href="/announcements"
          className="text-xs text-[#ff6b2b] hover:underline font-medium"
        >
          查看全部
        </Link>
      </div>

      <ul className="divide-y divide-[#e5e7eb]">
        {/* Must-read pinned */}
        {required.map((item) => (
          <li
            key={item.id}
            className="pl-0 border-l-4 border-[#ff6b2b]"
          >
            <Link
              href={`/announcements/${item.id}`}
              className="flex items-start gap-3 px-5 py-3.5 hover:bg-[#fff0e8] transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="required">必读</Badge>
                  {!item.readAt && <Badge variant="new">NEW</Badge>}
                  <span className="font-medium text-[#111827] text-sm group-hover:text-primary group-hover:underline transition-colors line-clamp-1">
                    {item.title}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.excerpt}</p>
              </div>
              <time
                className="text-xs text-gray-400 whitespace-nowrap shrink-0 mt-0.5"
                dateTime={item.publishedAt}
              >
                {formatDate(item.publishedAt)}
              </time>
            </Link>
          </li>
        ))}

        {/* Regular announcements */}
        {regular.map((item) => (
          <li key={item.id}>
            <Link
              href={`/announcements/${item.id}`}
              className="flex items-start gap-3 px-5 py-3.5 hover:bg-[#f3f4f6] transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {!item.readAt && <Badge variant="new">NEW</Badge>}
                  <span className="font-medium text-[#111827] text-sm group-hover:text-primary group-hover:underline transition-colors line-clamp-1">
                    {item.title}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.excerpt}</p>
              </div>
              <time
                className="text-xs text-gray-400 whitespace-nowrap shrink-0 mt-0.5"
                dateTime={item.publishedAt}
              >
                {formatDate(item.publishedAt)}
              </time>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
