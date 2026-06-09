import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PAGES = [
  { slug: "home", pageType: "home", title: "Corporate Portal Home" },
  { slug: "dept/hr", pageType: "department", title: "Human Resources" },
  { slug: "dept/engineering", pageType: "department", title: "Engineering" },
  { slug: "dept/finance", pageType: "department", title: "Finance" },
  { slug: "hub/product", pageType: "division", title: "Product Division Hub" },
];

async function main() {
  for (const p of PAGES) {
    const page = await prisma.portalPage.upsert({
      where: { slug: p.slug },
      update: {},
      create: { slug: p.slug, pageType: p.pageType, title: p.title },
    });

    const existing = await prisma.pageLayout.findFirst({
      where: { pageId: page.id, status: "PUBLISHED" },
    });

    if (!existing) {
      const blocks =
        p.pageType === "home"
          ? [
              { id: "block-h1", type: "announcements_feed", position: 0, visible: true, config: { count: 5, showImages: true, audienceScope: "all" } },
              { id: "block-h2", type: "quick_access_grid", position: 1, visible: true, config: { count: 6, systemCategories: ["all"] } },
              { id: "block-h3", type: "events_calendar", position: 2, visible: true, config: { calendarIds: [], daysAhead: 30 } },
            ]
          : p.pageType === "department"
          ? [
              { id: `block-${p.slug}-1`, type: "dept_hero_banner", position: 0, visible: true, config: { title: p.title, stats: [], backgroundStyle: "gradient" } },
              { id: `block-${p.slug}-2`, type: "team_directory", position: 1, visible: true, config: { deptScope: p.slug.split("/")[1] ?? "all" } },
            ]
          : [
              { id: `block-${p.slug}-1`, type: "announcements_feed", position: 0, visible: true, config: { count: 3, showImages: false, audienceScope: "dept" } },
            ];

      await prisma.pageLayout.create({
        data: {
          pageId: page.id,
          version: 1,
          status: "PUBLISHED",
          publishedAt: new Date(),
          blocks: blocks,
        },
      });
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
