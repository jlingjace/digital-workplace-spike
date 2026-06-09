import type { EventsCalendarConfig } from "@/types/blocks";

interface Props {
  config: EventsCalendarConfig;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO date
  time?: string;
  type: "company" | "team" | "training";
  location?: string;
}

// Mock events — V1
const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: "ev-1",
    title: "Q2 全员大会",
    date: "2026-06-11",
    time: "14:00",
    type: "company",
    location: "1楼大会议室",
  },
  {
    id: "ev-2",
    title: "新员工入职培训",
    date: "2026-06-10",
    time: "10:00",
    type: "training",
    location: "3楼多功能厅",
  },
  {
    id: "ev-3",
    title: "绿色健步走团建",
    date: "2026-06-14",
    time: "09:00",
    type: "team",
    location: "城市绿道公园南门",
  },
];

const typeConfig: Record<CalendarEvent["type"], { bg: string; text: string; dot: string }> = {
  company: { bg: "bg-[#fff0e8]", text: "text-[#ff6b2b]", dot: "bg-[#ff6b2b]" },
  team: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  training: { bg: "bg-[#e6f4f7]", text: "text-[#005e6f]", dot: "bg-[#005e6f]" },
};

const typeLabel: Record<CalendarEvent["type"], string> = {
  company: "公司",
  team: "团队",
  training: "培训",
};

function formatEventDate(iso: string) {
  const d = new Date(iso);
  const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const weekday = weekdays[d.getDay()];
  return { short: `${month}/${day}`, weekday };
}

export default function EventsCalendarBlock({ config }: Props) {
  const sorted = [...MOCK_EVENTS].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-[#e5e7eb] flex items-center justify-between">
        <h2 className="text-base font-semibold text-[#111827]">{config.title}</h2>
        <a href="#" className="text-xs text-[#ff6b2b] hover:underline font-medium">
          查看日历
        </a>
      </div>

      <ul className="divide-y divide-[#e5e7eb]">
        {sorted.map((event) => {
          const tc = typeConfig[event.type];
          const { short, weekday } = formatEventDate(event.date);
          return (
            <li key={event.id}>
              <a
                href="#"
                className="flex items-start gap-4 px-5 py-3.5 hover:bg-[#f3f4f6] transition-colors group"
              >
                {/* Date badge */}
                <div className="flex flex-col items-center w-12 shrink-0">
                  <span
                    className={`text-sm font-bold ${tc.text}`}
                  >
                    {short}
                  </span>
                  <span className="text-xs text-gray-400">{weekday}</span>
                </div>

                {/* Event info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded font-medium ${tc.bg} ${tc.text}`}
                    >
                      {typeLabel[event.type]}
                    </span>
                    <span className="text-sm font-medium text-[#111827] group-hover:text-[#ff6b2b] transition-colors line-clamp-1">
                      {event.title}
                    </span>
                  </div>
                  {(event.time || event.location) && (
                    <p className="text-xs text-gray-400 mt-1">
                      {event.time && <span>{event.time}</span>}
                      {event.time && event.location && <span className="mx-1">·</span>}
                      {event.location && <span>{event.location}</span>}
                    </p>
                  )}
                </div>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
