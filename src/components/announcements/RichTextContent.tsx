"use client";

/**
 * Client wrapper for rendering rich-text (HTML) announcement content.
 *
 * SECURITY NOTE: Content is rendered via dangerouslySetInnerHTML.
 * TODO: Integrate DOMPurify for client-side sanitization once the dependency
 * is added.  DOMPurify is browser-only so it cannot run in RSC / SSR without
 * a dynamic import or client wrapper.
 *
 * Example integration:
 *   import DOMPurify from "dompurify";
 *   const clean = DOMPurify.sanitize(html);
 */

interface Props {
  html: string;
  className?: string;
}

export default function RichTextContent({ html, className = "" }: Props) {
  return (
    <div
      className={`rich-text ${className}`}
      // TODO: sanitize with DOMPurify before passing to dangerouslySetInnerHTML
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
