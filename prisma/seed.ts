import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Seed homepage
  const homePage = await prisma.portalPage.upsert({
    where: { slug: "home" },
    update: {},
    create: {
      slug: "home",
      pageType: "home",
      title: "Digital Workplace Home",
    },
  });

  // Seed initial published layout for home
  const existingLayout = await prisma.pageLayout.findFirst({
    where: { pageId: homePage.id, status: "PUBLISHED" },
  });

  if (!existingLayout) {
    await prisma.pageLayout.create({
      data: {
        pageId: homePage.id,
        version: 1,
        status: "PUBLISHED",
        publishedAt: new Date(),
        blocks: [
          {
            id: "block-1",
            type: "announcements_feed",
            order: 0,
            config: { title: "Latest Announcements", count: 5 },
          },
          {
            id: "block-2",
            type: "quick_access_grid",
            order: 1,
            config: { title: "Quick Access", items: [] },
          },
        ],
      },
    });
  }

  console.log("Seed complete. Home page and initial layout created.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
