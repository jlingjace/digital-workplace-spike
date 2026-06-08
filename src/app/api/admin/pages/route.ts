import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/admin/pages — list all portal pages
export async function GET() {
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
  return NextResponse.json({ pages });
}
