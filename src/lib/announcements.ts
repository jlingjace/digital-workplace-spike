import type { Announcement } from "@/types/announcement";

// ---------------------------------------------------------------------------
// Mock data — replace with real DB / API calls once SNOW-187 auth is done
// ---------------------------------------------------------------------------

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "ann-001",
    title: "【必读】2026年度员工手册更新",
    content: `<p>尊敬的各位同事：</p>
<p>我们已对2026年度员工手册进行了全面修订，新版手册涵盖了以下几个主要变更：</p>
<ul>
  <li>薪酬福利政策调整（第三章）</li>
  <li>远程办公规范更新（第五章）</li>
  <li>绩效考核流程优化（第七章）</li>
</ul>
<p>请所有员工在 <strong>2026年6月30日</strong> 前完成阅读并确认。</p>
<p>如有疑问，请联系HR部门。</p>`,
    excerpt: "我们已对2026年度员工手册进行了全面修订，涵盖薪酬福利、远程办公规范及绩效考核流程等重要变更，请务必在6月30日前完成阅读确认。",
    department: "人力资源部",
    publishedBy: "Sarah Johnson",
    publishedAt: "2026-06-01T09:00:00Z",
    expiresAt: "2026-06-30T23:59:59Z",
    status: "PUBLISHED",
    isRequired: true,
    readAt: null,
    attachments: [
      {
        id: "att-001",
        name: "2026员工手册_v3.2.pdf",
        url: "/files/employee-handbook-2026.pdf",
        size: 2457600,
        mimeType: "application/pdf",
      },
    ],
    contactInfo: {
      name: "HR Service Center",
      email: "hr@company.com",
      department: "人力资源部",
    },
  },
  {
    id: "ann-002",
    title: "【必读】信息安全合规培训通知",
    content: `<p>根据公司年度信息安全合规要求，所有员工需完成以下培训：</p>
<ol>
  <li>网络安全基础知识（约45分钟）</li>
  <li>数据隐私保护实践（约30分钟）</li>
  <li>钓鱼邮件识别与防范（约20分钟）</li>
</ol>
<p>培训截止日期：<strong>2026年6月15日</strong></p>
<p>请登录学习平台完成培训并参加考核，通过率需达到80分以上。</p>`,
    excerpt: "年度信息安全合规培训已开放，包含网络安全、数据隐私及钓鱼邮件识别等模块，所有员工须在6月15日前完成并通过考核。",
    department: "信息技术部",
    publishedBy: "Michael Zhang",
    publishedAt: "2026-06-03T10:00:00Z",
    expiresAt: "2026-06-15T23:59:59Z",
    status: "PUBLISHED",
    isRequired: true,
    readAt: null,
    attachments: [],
    contactInfo: {
      name: "IT Security Team",
      email: "security@company.com",
      phone: "ext. 8899",
      department: "信息技术部",
    },
  },
  {
    id: "ann-003",
    title: "6月员工关怀活动：团建健步走",
    content: `<p>为促进员工身心健康，公司将于本月举办"绿色健步走"团建活动。</p>
<p><strong>活动详情：</strong></p>
<ul>
  <li>时间：2026年6月14日（周六）上午9:00</li>
  <li>地点：城市绿道公园南门集合</li>
  <li>距离：约5公里</li>
  <li>参与方式：自愿报名，携带家属</li>
</ul>
<p>完成活动可获得公司积分奖励，可兑换礼品。</p>`,
    excerpt: "6月14日周六举办绿色健步走团建活动，地点城市绿道公园，约5公里，欢迎携带家属参与，完成活动可获公司积分奖励。",
    department: "行政部",
    publishedBy: "Lisa Wang",
    publishedAt: "2026-06-05T11:00:00Z",
    expiresAt: "2026-06-14T12:00:00Z",
    status: "PUBLISHED",
    isRequired: false,
    readAt: "2026-06-05T14:23:00Z",
    attachments: [],
  },
  {
    id: "ann-004",
    title: "系统维护通知：周六凌晨停服2小时",
    content: `<p>为优化系统性能，IT部门将于本周六（6月7日）进行计划维护。</p>
<p><strong>维护窗口：</strong>2026年6月7日 02:00 - 04:00（北京时间）</p>
<p><strong>影响范围：</strong></p>
<ul>
  <li>员工门户（本系统）</li>
  <li>邮件系统（部分功能）</li>
  <li>VPN 接入</li>
</ul>
<p>请提前保存工作，维护期间请勿进行重要操作。</p>`,
    excerpt: "IT部门将于6月7日凌晨2:00-4:00进行计划系统维护，员工门户、邮件及VPN将短暂中断，请提前保存工作。",
    department: "信息技术部",
    publishedBy: "Tom Li",
    publishedAt: "2026-06-04T16:00:00Z",
    expiresAt: "2026-06-07T06:00:00Z",
    status: "PUBLISHED",
    isRequired: false,
    readAt: "2026-06-04T17:10:00Z",
    attachments: [],
  },
  {
    id: "ann-005",
    title: "2026 Q2 全体员工大会纪要",
    content: `<p>2026年第二季度全体员工大会已于6月2日顺利举行，以下为主要议程摘要：</p>
<h3>业务进展</h3>
<p>Q1整体业绩超预期12%，多个核心产品线实现突破。</p>
<h3>战略方向</h3>
<p>下半年将重点推进数字化转型，加大AI能力建设投入。</p>
<h3>组织调整</h3>
<p>技术中台部门正式成立，由CTO直线汇报。</p>`,
    excerpt: "Q2全员大会纪要：Q1业绩超预期12%，下半年重点推进数字化转型与AI能力建设，技术中台部门正式成立。",
    department: "战略发展部",
    publishedBy: "CEO Office",
    publishedAt: "2026-06-03T18:00:00Z",
    expiresAt: null,
    status: "PUBLISHED",
    isRequired: false,
    readAt: null,
    attachments: [
      {
        id: "att-005",
        name: "Q2全员大会PPT.pptx",
        url: "/files/q2-allhands-2026.pptx",
        size: 5242880,
        mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      },
    ],
  },
  {
    id: "ann-006",
    title: "新员工入职欢迎：6月批次",
    content: `<p>热烈欢迎6月份加入我们大家庭的新同事！</p>
<p>本月共有 <strong>23位新员工</strong> 加入，分布于产品、技术、运营及市场等部门。</p>
<p>新员工入职引导活动将于 6月10日（周二）10:00 在3楼多功能厅举行，请各部门导师提前做好接待准备。</p>`,
    excerpt: "6月共23位新员工加入，覆盖产品、技术、运营及市场部门，入职引导活动将于6月10日举行，请各部门导师做好接待准备。",
    department: "人力资源部",
    publishedBy: "Sarah Johnson",
    publishedAt: "2026-06-06T09:30:00Z",
    expiresAt: null,
    status: "PUBLISHED",
    isRequired: false,
    readAt: null,
    attachments: [],
  },
  {
    id: "ann-007",
    title: "企业文化 | 我们的价值观故事征集活动",
    content: `<p>为庆祝公司成立十周年，我们发起「价值观故事」征集活动。</p>
<p>欢迎每位员工分享你在工作中体现公司价值观的真实故事：</p>
<ul>
  <li>字数：500-1000字</li>
  <li>投稿邮箱：culture@company.com</li>
  <li>截止日期：2026年6月30日</li>
</ul>
<p>优秀故事将收录于十周年纪念册，作者可获精美礼品一份。</p>`,
    excerpt: "公司十周年价值观故事征集活动启动，欢迎所有员工投稿分享工作中体现价值观的真实故事，字数500-1000字，截止6月30日。",
    department: "品牌文化部",
    publishedBy: "Amy Chen",
    publishedAt: "2026-06-07T10:00:00Z",
    expiresAt: "2026-06-30T23:59:59Z",
    status: "PUBLISHED",
    isRequired: false,
    readAt: null,
    attachments: [],
    contactInfo: {
      name: "品牌文化部",
      email: "culture@company.com",
    },
  },
  {
    id: "ann-008",
    title: "食堂菜单更新 & 健康餐饮新方案",
    content: `<p>自6月9日起，公司食堂将推出全新健康餐饮方案：</p>
<ul>
  <li>引入轻食专区，提供沙拉、低卡套餐等选项</li>
  <li>每周三设立"无肉日"，推广植物性饮食</li>
  <li>增加营养标签显示，帮助员工做出健康选择</li>
</ul>
<p>新方案已由营养师团队审核，兼顾口味与健康。欢迎在用餐后扫码评分反馈。</p>`,
    excerpt: "食堂自6月9日起推出健康餐饮新方案，新增轻食专区，每周三无肉日，并增加营养标签显示，欢迎扫码评分反馈。",
    department: "行政部",
    publishedBy: "Admin Team",
    publishedAt: "2026-06-08T08:00:00Z",
    expiresAt: null,
    status: "PUBLISHED",
    isRequired: false,
    readAt: null,
    attachments: [],
  },
];

// ---------------------------------------------------------------------------
// Fetch helpers
// ---------------------------------------------------------------------------

export interface GetAnnouncementsParams {
  search?: string;
  department?: string;
  cursor?: string;
  limit?: number;
}

export interface PaginatedAnnouncements {
  items: Announcement[];
  nextCursor: string | null;
  total: number;
}

export async function getAnnouncements(
  params: GetAnnouncementsParams = {}
): Promise<PaginatedAnnouncements> {
  const { search, department, cursor, limit = 10 } = params;

  // Filter
  let items = MOCK_ANNOUNCEMENTS.filter((a) => a.status === "PUBLISHED");

  if (search) {
    const q = search.toLowerCase();
    items = items.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q)
    );
  }

  if (department) {
    items = items.filter((a) => a.department === department);
  }

  // Cursor-based pagination (cursor = last item id)
  const total = items.length;
  let startIndex = 0;
  if (cursor) {
    const idx = items.findIndex((a) => a.id === cursor);
    if (idx !== -1) startIndex = idx + 1;
  }

  const page = items.slice(startIndex, startIndex + limit);
  const nextCursor =
    startIndex + limit < total ? page[page.length - 1]?.id ?? null : null;

  return { items: page, nextCursor, total };
}

export async function getAnnouncement(id: string): Promise<Announcement | null> {
  return MOCK_ANNOUNCEMENTS.find((a) => a.id === id) ?? null;
}

export async function getUnreadCount(): Promise<number> {
  // Mock: 3 unread
  return 3;
}
