import { notFound } from "next/navigation";
import Link from "next/link";
import { getAnnouncement } from "@/lib/announcements";
import PageLayout from "@/components/ui/PageLayout";
import RichTextContent from "@/components/announcements/RichTextContent";
import ReadConfirmButton from "@/components/announcements/ReadConfirmButton";

export const revalidate = 60;

interface Props {
  params: { id: string };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export default async function AnnouncementDetailPage({ params }: Props) {
  const announcement = await getAnnouncement(params.id);

  if (!announcement) {
    notFound();
  }

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-xs text-gray-500 mb-5" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#ff6b2b] transition-colors">
            首页
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/announcements" className="hover:text-[#ff6b2b] transition-colors">
            公告
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-[#111827] font-medium truncate max-w-[200px]">
            {announcement.title}
          </span>
        </nav>

        {/* Must-read banner */}
        {announcement.isRequired && (
          <div className="mb-5 flex items-start gap-3 bg-[#fff0e8] border border-[#ff6b2b]/30 rounded-xl px-4 py-3">
            <svg
              className="w-5 h-5 text-[#ff6b2b] shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-[#ff6b2b]">此公告需要您确认已读</p>
              <p className="text-xs text-gray-600 mt-0.5">
                {announcement.expiresAt
                  ? `请在 ${formatDate(announcement.expiresAt)} 前完成确认。`
                  : "请尽快完成阅读确认。"}
              </p>
            </div>
            <ReadConfirmButton
              announcementId={announcement.id}
              initialConfirmed={!!announcement.readAt}
            />
          </div>
        )}

        {/* Article card */}
        <article className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden shadow-card">
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#e5e7eb]">
            <h1 className="text-lg font-semibold text-[#111827] leading-snug mb-3">
              {announcement.title}
            </h1>
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 text-xs">
              <div>
                <dt className="text-gray-400">发布部门</dt>
                <dd className="font-medium text-[#005e6f] mt-0.5">{announcement.department}</dd>
              </div>
              <div>
                <dt className="text-gray-400">发布人</dt>
                <dd className="font-medium text-[#111827] mt-0.5">{announcement.publishedBy}</dd>
              </div>
              <div>
                <dt className="text-gray-400">发布日期</dt>
                <dd className="font-medium text-[#111827] mt-0.5">
                  {formatDate(announcement.publishedAt)}
                </dd>
              </div>
              {announcement.expiresAt && (
                <div>
                  <dt className="text-gray-400">有效期至</dt>
                  <dd className="font-medium text-[#111827] mt-0.5">
                    {formatDate(announcement.expiresAt)}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            <RichTextContent html={announcement.content} />
          </div>

          {/* Attachments */}
          {announcement.attachments.length > 0 && (
            <div className="px-6 py-4 border-t border-[#e5e7eb] bg-[#f9fafb]">
              <h2 className="text-sm font-semibold text-[#111827] mb-3">附件</h2>
              <ul className="space-y-2">
                {announcement.attachments.map((att) => (
                  <li key={att.id}>
                    <a
                      href={att.url}
                      className="inline-flex items-center gap-2 text-sm text-[#005e6f] hover:text-[#ff6b2b] transition-colors group"
                      download
                    >
                      <svg
                        className="w-4 h-4 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="group-hover:underline">{att.name}</span>
                      <span className="text-xs text-gray-400">
                        ({formatFileSize(att.size)})
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contact info */}
          {announcement.contactInfo && (
            <div className="px-6 py-4 border-t border-[#e5e7eb] bg-[#f9fafb]">
              <h2 className="text-sm font-semibold text-[#111827] mb-2">联系方式</h2>
              <address className="not-italic text-sm text-gray-600 space-y-1">
                <p className="font-medium text-[#111827]">{announcement.contactInfo.name}</p>
                {announcement.contactInfo.department && (
                  <p>{announcement.contactInfo.department}</p>
                )}
                {announcement.contactInfo.email && (
                  <p>
                    <a
                      href={`mailto:${announcement.contactInfo.email}`}
                      className="text-[#005e6f] hover:underline"
                    >
                      {announcement.contactInfo.email}
                    </a>
                  </p>
                )}
                {announcement.contactInfo.phone && (
                  <p>{announcement.contactInfo.phone}</p>
                )}
              </address>
            </div>
          )}
        </article>

        {/* Back link */}
        <div className="mt-4">
          <Link
            href="/announcements"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#ff6b2b] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            返回公告列表
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
