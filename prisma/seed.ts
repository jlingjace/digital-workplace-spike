import { PrismaClient, PageLayoutStatus } from '@prisma/client'

const prisma = new PrismaClient()

const homeBlocks = [
  {
    id: crypto.randomUUID(),
    type: 'dept_hero_banner',
    position: 0,
    visible: true,
    config: {
      title: 'Welcome to Digital Workplace',
      subtitle: 'Your central hub for everything at work',
      backgroundUrl: '',
      ctaLabel: 'Explore Systems',
      ctaUrl: '/systems',
    },
  },
  {
    id: crypto.randomUUID(),
    type: 'announcements_feed',
    position: 1,
    visible: true,
    config: {
      title: 'Latest Announcements',
      count: 5,
      showImages: true,
      audienceScope: 'all',
    },
  },
  {
    id: crypto.randomUUID(),
    type: 'quick_access_grid',
    position: 2,
    visible: true,
    config: {
      count: 6,
      systemCategories: ['all'],
    },
  },
]

const hrDeptBlocks = [
  {
    id: crypto.randomUUID(),
    type: 'dept_hero_banner',
    position: 0,
    visible: true,
    config: {
      title: 'Human Resources',
      subtitle: 'People, policies, and everything in between',
      backgroundUrl: '',
      ctaLabel: 'Contact HR',
      ctaUrl: '/dept/hr/contact',
    },
  },
  {
    id: crypto.randomUUID(),
    type: 'announcements_feed',
    position: 1,
    visible: true,
    config: {
      title: 'HR Announcements',
      count: 3,
      showImages: false,
      audienceScope: 'dept',
    },
  },
  {
    id: crypto.randomUUID(),
    type: 'resources_policies_table',
    position: 2,
    visible: true,
    config: {
      title: 'HR Policies',
      categories: ['Benefits', 'Leave', 'Onboarding'],
      showSearch: true,
      maxItems: 20,
    },
  },
]

async function main() {
  // Home page
  const homePage = await prisma.portalPage.upsert({
    where: { slug: 'home' },
    update: { title: 'Corporate Portal Home' },
    create: {
      slug: 'home',
      pageType: 'home',
      title: 'Corporate Portal Home',
    },
  })

  const existingHomePublished = await prisma.pageLayout.findFirst({
    where: { pageId: homePage.id, status: PageLayoutStatus.PUBLISHED },
  })
  if (!existingHomePublished) {
    await prisma.pageLayout.create({
      data: {
        pageId: homePage.id,
        version: 1,
        blocks: homeBlocks as any,
        status: PageLayoutStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    })
    console.log('Created home published layout')
  }

  // HR department page
  const hrPage = await prisma.portalPage.upsert({
    where: { slug: 'dept/hr' },
    update: { title: 'Human Resources' },
    create: {
      slug: 'dept/hr',
      pageType: 'department',
      title: 'Human Resources',
    },
  })

  const existingHrPublished = await prisma.pageLayout.findFirst({
    where: { pageId: hrPage.id, status: PageLayoutStatus.PUBLISHED },
  })
  if (!existingHrPublished) {
    await prisma.pageLayout.create({
      data: {
        pageId: hrPage.id,
        version: 1,
        blocks: hrDeptBlocks as any,
        status: PageLayoutStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    })
    console.log('Created HR dept published layout')
  }

  console.log('Seed complete:', { home: homePage.id, hr: hrPage.id })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
