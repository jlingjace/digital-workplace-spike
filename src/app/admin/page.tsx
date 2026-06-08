import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminPagesPage() {
  const pages = await prisma.portalPage.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      layouts: {
        where: { status: "PUBLISHED" },
        orderBy: { version: "desc" },
        take: 1,
        select: { version: true, publishedAt: true },
      },
    },
  });

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Portal Pages</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-gray-600">Page</th>
              <th className="text-left px-4 py-3 text-gray-600">Slug</th>
              <th className="text-left px-4 py-3 text-gray-600">Published Version</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-700">{page.title}</td>
                <td className="px-4 py-3 text-gray-500 font-mono">{page.slug}</td>
                <td className="px-4 py-3 text-gray-500">
                  {page.layouts[0]
                    ? `v${page.layouts[0].version} (${new Date(page.layouts[0].publishedAt!).toLocaleDateString()})`
                    : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/pages/${page.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Edit →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
