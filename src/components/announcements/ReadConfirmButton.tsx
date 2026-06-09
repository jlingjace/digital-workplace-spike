"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";

interface Props {
  announcementId: string;
  /** Pass true if the user already confirmed (readAt !== null) */
  initialConfirmed?: boolean;
}

export default function ReadConfirmButton({ announcementId, initialConfirmed = false }: Props) {
  const [confirmed, setConfirmed] = useState(initialConfirmed);
  const [loading, setLoading] = useState(false);

  // Auto-mark as read on page load (silent, non-blocking)
  // announcementId is stable for the lifetime of this component instance
  useEffect(() => {
    if (!confirmed) {
      fetch(`/api/portal/announcements/${announcementId}/read`, {
        method: "POST",
      }).catch(() => {
        // Silently ignore network errors on auto-read
      });
    }
  }, [announcementId]); // intentionally runs once per mount; announcementId is stable

  const handleConfirm = async () => {
    if (confirmed || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/portal/announcements/${announcementId}/read`, {
        method: "POST",
      });
      if (res.ok) {
        setConfirmed(true);
      }
    } catch {
      // ignore for now — could show a toast in a future iteration
    } finally {
      setLoading(false);
    }
  };

  if (confirmed) {
    return (
      <div className="inline-flex items-center gap-1.5 text-sm text-green-700 font-medium">
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        已确认
      </div>
    );
  }

  return (
    <Button
      variant="primary"
      size="sm"
      loading={loading}
      onClick={handleConfirm}
      aria-label="确认已读此公告"
    >
      确认已读
    </Button>
  );
}
