import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Seed departments
  const depts = await Promise.all([
    prisma.department.upsert({
      where: { slug: "engineering" },
      update: {},
      create: { name: "Engineering", slug: "engineering" },
    }),
    prisma.department.upsert({
      where: { slug: "hr" },
      update: {},
      create: { name: "HR & Benefits", slug: "hr" },
    }),
    prisma.department.upsert({
      where: { slug: "finance" },
      update: {},
      create: { name: "Finance", slug: "finance" },
    }),
  ]);
  console.log(`Seeded ${depts.length} departments.`);

  // Seed homepage portal page
  const homePage = await prisma.portalPage.upsert({
    where: { slug: "home" },
    update: {},
    create: {
      slug: "home",
      pageType: "home",
      title: "Digital Workplace Home",
    },
  });

  // Seed initial draft layout (not published — Admin should publish manually)
  const existingLayout = await prisma.pageLayout.findFirst({
    where: { pageId: homePage.id },
  });

  if (!existingLayout) {
    await prisma.pageLayout.create({
      data: {
        pageId: homePage.id,
        version: 1,
        status: "DRAFT",
        blocks: [
          {
            id: "block-initial-1",
            type: "announcements_feed",
            order: 0,
            config: { title: "Latest Announcements", count: 5 },
          },
          {
            id: "block-initial-2",
            type: "quick_access_grid",
            order: 1,
            config: { title: "Quick Access", items: [] },
          },
        ],
      },
    });
    console.log("Seeded home page draft layout.");
  }

  console.log("Seed complete.");
  console.log(
    "\n⚠️  To grant PLATFORM_ADMIN to the first user after Google login, run:\n" +
    "   UPDATE \"User\" SET role = 'PLATFORM_ADMIN' WHERE email = 'admin@yourcompany.com';"
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
