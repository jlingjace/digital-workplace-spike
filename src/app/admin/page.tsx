import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminPagesPage() {
  const pages = await prisma.portalPage.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      layouts: {
        where: { status: { in: ["PUBLISHED", "DRAFT"] } },
        orderBy: { version: "desc" },
        take: 2,
        select: { id: true, version: true, status: true, publishedAt: true, updatedAt: true },
      },
    },
  });

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Portal Pages</h1>
        <p className="text-xs text-gray-400">管理所有可配置页面的区块布局</p>
      </div>

      <div className="bg-white rounded-card border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">页面</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Slug</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">最后发布</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">状态</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => {
              const published = page.layouts.find((l) => l.status === "PUBLISHED");
              const draft = page.layouts.find((l) => l.status === "DRAFT");
              return (
                <tr key={page.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-800">{page.title}</td>
                  <td className="px-4 py-3.5 text-gray-400 font-mono text-xs">{page.slug}</td>
                  <td className="px-4 py-3.5 text-gray-500 text-xs font-mono">
                    {published
                      ? `v${published.version} · ${new Date(published.publishedAt!).toLocaleDateString("zh-CN")}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {published && (
                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded font-mono">已发布</span>
                      )}
                      {draft && (
                        <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded font-mono">有草稿</span>
                      )}
                      {!published && !draft && (
                        <span className="text-xs text-gray-400">未配置</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={`/admin/pages/${page.id}`}
                      className="text-xs px-3 py-1.5 border border-gray-200 rounded-btn text-gray-600 hover:border-[#ff6b2b] hover:text-[#ff6b2b] hover:bg-[#fff0e8] transition-colors font-medium"
                    >
                      编辑 →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
