import { getAnnouncements } from "@/lib/announcements";
import PageLayout from "@/components/ui/PageLayout";
import AnnouncementsClientFilters from "./AnnouncementsClientFilters";

export const revalidate = 60;

export default async function AnnouncementsPage() {
  const { items } = await getAnnouncements({ limit: 20 });

  // Unique departments for filter dropdown
  const departments = Array.from(new Set(items.map((a) => a.department)));

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-[#111827]">公告中心</h1>
          <p className="text-sm text-gray-500 mt-0.5">查看公司最新通知与公告</p>
        </div>

        {/* Client-side filters + search (thin wrapper) */}
        <AnnouncementsClientFilters departments={departments} allItems={items} />
      </div>
    </PageLayout>
  );
}
