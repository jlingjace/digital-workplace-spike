"use client";

import { useState, useEffect } from "react";

interface Version {
  id: string;
  version: number;
  status: string;
  publishedAt: string | null;
  createdAt: string;
  createdBy?: { name?: string; email?: string } | null;
}

interface VersionHistoryDialogProps {
  pageId: string;
  onRollback: (versionId: string) => void;
  onClose: () => void;
}

export default function VersionHistoryDialog({ pageId, onRollback, onClose }: VersionHistoryDialogProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rollingBack, setRollingBack] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    fetch(`/api/admin/pages/${pageId}/layout/versions`)
      .then((r) => r.json())
      .then((data) => { setVersions(data.versions ?? []); setLoading(false); })
      .catch(() => { setError("加载失败，请重试"); setLoading(false); });
  }, [pageId]);

  const handleRollback = async (id: string) => {
    setRollingBack(id);
    setConfirmId(null);
    await onRollback(id);
    setRollingBack(null);
  };

  const focusRingGray = "focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1";
  const focusRingSecondary = "focus:outline-none focus:ring-2 focus:ring-[#005e6f] focus:ring-offset-1";
  const focusRingAmber = "focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-1";

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" aria-hidden="true" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="vh-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Fade-in + scale-in animation */}
        <div
          className={`bg-white rounded-card shadow-2xl w-full max-w-lg transition-all duration-150 ease-out
            ${visible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <h2 id="vh-title" className="text-base font-semibold text-gray-800">版本历史</h2>
            <button
              onClick={onClose}
              aria-label="关闭版本历史"
              className={`p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors ${focusRingGray}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="px-5 py-4 max-h-96 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-8 text-gray-400 text-sm">加载中…</div>
            )}
            {error && (
              <div className="text-center py-8 text-red-500 text-sm">{error}</div>
            )}
            {!loading && !error && versions.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">暂无历史版本</div>
            )}
            {!loading && !error && versions.length > 0 && (
              <div className="space-y-2">
                {versions.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between px-4 py-3 border border-gray-100 rounded-btn hover:border-gray-200 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-800">v{v.version}</span>
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded font-mono ${
                            v.status === "PUBLISHED"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {v.status === "PUBLISHED" ? "已发布" : "归档"}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5 font-mono">
                        {new Date(v.publishedAt ?? v.createdAt).toLocaleString("zh-CN")}
                        {v.createdBy?.name && ` · ${v.createdBy.name}`}
                      </div>
                    </div>

                    {confirmId === v.id ? (
                      <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded px-2.5 py-1.5">
                        <span className="text-xs text-amber-700 font-medium">回滚到此版本?</span>
                        <button
                          onClick={() => handleRollback(v.id)}
                          disabled={!!rollingBack}
                          className={`text-xs text-amber-700 font-semibold hover:text-amber-900 rounded ${focusRingAmber}`}
                        >
                          确认
                        </button>
                        <span className="text-amber-300 text-xs">·</span>
                        <button
                          onClick={() => setConfirmId(null)}
                          className={`text-xs text-gray-500 hover:text-gray-700 rounded ${focusRingGray}`}
                        >
                          取消
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmId(v.id)}
                        disabled={!!rollingBack}
                        className={`text-xs px-3 py-1.5 border border-gray-200 rounded-btn text-gray-600 hover:border-[#005e6f] hover:text-[#005e6f] hover:bg-[#e0f4f7] transition-colors ${focusRingSecondary} disabled:opacity-40`}
                      >
                        {rollingBack === v.id ? "回滚中…" : "回滚到此版本"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-card">
            <p className="text-xs text-gray-400">最多保留 5 个历史版本。回滚将创建新草稿，不会自动发布。</p>
          </div>
        </div>
      </div>
    </>
  );
}
