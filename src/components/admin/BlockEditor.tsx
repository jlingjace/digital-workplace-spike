"use client";

import { useState, useCallback, useRef } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Block, BlockType } from "@/types/blocks";
import { BLOCK_META } from "@/types/blocks";
import BlockConfigDrawer from "./BlockConfigDrawer";
import VersionHistoryDialog from "./VersionHistoryDialog";

// ─── Drag handle icon ─────────────────────────────────────────────────────────

function DragHandleIcon() {
  return (
    <svg width="14" height="18" viewBox="0 0 14 18" fill="currentColor">
      <circle cx="4" cy="3" r="1.5" />
      <circle cx="10" cy="3" r="1.5" />
      <circle cx="4" cy="9" r="1.5" />
      <circle cx="10" cy="9" r="1.5" />
      <circle cx="4" cy="15" r="1.5" />
      <circle cx="10" cy="15" r="1.5" />
    </svg>
  );
}

// ─── Config summary ───────────────────────────────────────────────────────────

function ConfigSummary({ block }: { block: Block }) {
  const cfg = block.config as unknown as Record<string, unknown>;
  const parts: string[] = [];

  if ("count" in cfg && typeof cfg.count === "number") parts.push(`count: ${cfg.count}`);
  if ("daysAhead" in cfg && typeof cfg.daysAhead === "number") parts.push(`${cfg.daysAhead} 天`);
  if ("variant" in cfg && typeof cfg.variant === "string") parts.push(cfg.variant);
  if ("embedUrl" in cfg && typeof cfg.embedUrl === "string" && cfg.embedUrl) {
    const url = cfg.embedUrl as string;
    parts.push(url.length > 30 ? url.slice(0, 30) + "…" : url);
  }
  if ("endpointUrl" in cfg && typeof cfg.endpointUrl === "string" && cfg.endpointUrl) {
    const url = cfg.endpointUrl as string;
    parts.push(url.length > 30 ? url.slice(0, 30) + "…" : url);
  }
  if ("links" in cfg && Array.isArray(cfg.links)) parts.push(`${cfg.links.length} 个链接`);
  if ("stats" in cfg && Array.isArray(cfg.stats)) parts.push(`${cfg.stats.length} 项统计`);

  if (parts.length === 0) return null;
  return <p className="text-xs text-gray-400 font-mono mt-0.5">{parts.join(" · ")}</p>;
}

// ─── Sortable block card ──────────────────────────────────────────────────────

interface SortableBlockCardProps {
  block: Block;
  onToggleVisible: (id: string) => void;
  onOpenConfig: (id: string) => void;
  onDelete: (id: string) => void;
}

function SortableBlockCard({ block, onToggleVisible, onOpenConfig, onDelete }: SortableBlockCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const meta = BLOCK_META[block.type];

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`bg-white border rounded-btn p-3 flex gap-2.5 items-start transition-all ${
        isDragging
          ? "opacity-30 shadow-lg"
          : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
      } ${!block.visible ? "opacity-60" : ""}`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="mt-1 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1 rounded"
        aria-label="拖拽排序"
        tabIndex={0}
      >
        <DragHandleIcon />
      </button>

      {/* Block icon */}
      <span className="text-lg flex-shrink-0 mt-0.5" aria-hidden="true">
        {meta.icon}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-medium text-gray-800 text-sm">{meta.label}</span>
          {!block.visible && (
            <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-mono leading-tight">
              隐藏
            </span>
          )}
        </div>
        <ConfigSummary block={block} />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* Visibility toggle */}
        <button
          onClick={() => onToggleVisible(block.id)}
          title={block.visible ? "隐藏区块" : "显示区块"}
          aria-label={block.visible ? "隐藏区块" : "显示区块"}
          aria-pressed={!block.visible}
          className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-300"
        >
          {block.visible ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          )}
        </button>

        {/* Configure */}
        <button
          onClick={() => onOpenConfig(block.id)}
          title="配置区块"
          aria-label={`配置 ${meta.label}`}
          className="p-1.5 rounded text-gray-400 hover:text-[#005e6f] hover:bg-[#e0f4f7] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#005e6f]"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        </button>

        {/* Delete — 2-step confirmation */}
        {confirmDelete ? (
          <div className="flex items-center gap-1 bg-red-50 border border-red-200 rounded px-2 py-1">
            <span className="text-xs text-red-700 font-medium">删除？</span>
            <button
              onClick={() => onDelete(block.id)}
              className="text-xs text-red-700 font-semibold hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-1 rounded"
              aria-label="确认删除"
            >
              确认
            </button>
            <span className="text-red-300 text-xs">·</span>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-xs text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1 rounded"
              aria-label="取消删除"
            >
              取消
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            title="删除区块"
            aria-label={`删除 ${meta.label}`}
            className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-300"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Block Library ────────────────────────────────────────────────────────────

function BlockLibrary({ onAdd }: { onAdd: (type: BlockType) => void }) {
  return (
    <aside className="w-60 flex-shrink-0 bg-gray-50 border border-gray-200 rounded-card p-3 overflow-y-auto">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">区块库</h2>
      <div className="space-y-1">
        {(Object.keys(BLOCK_META) as BlockType[]).map((type) => {
          const meta = BLOCK_META[type];
          return (
            <button
              key={type}
              onClick={() => onAdd(type)}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-btn text-left bg-white border border-gray-200 hover:border-[#ff6b2b] hover:bg-[#fff0e8] transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff6b2b] group"
            >
              <span className="text-base flex-shrink-0">{meta.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-gray-700 leading-tight">{meta.label}</div>
                {meta.description && (
                  <div className="text-xs text-gray-400 leading-tight mt-0.5 truncate">{meta.description}</div>
                )}
              </div>
              <span className="text-[#ff6b2b] opacity-0 group-hover:opacity-100 text-sm font-bold flex-shrink-0">+</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

// ─── Preview Panel ────────────────────────────────────────────────────────────

function PreviewPanel({ pageId }: { pageId: string }) {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <aside className="w-80 flex-shrink-0 bg-gray-50 border border-gray-200 rounded-card p-3 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">预览</h2>
        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          className="text-xs text-gray-400 hover:text-[#005e6f] flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-[#005e6f] focus:ring-offset-1 rounded"
          aria-label="刷新预览"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
          </svg>
          刷新
        </button>
      </div>
      <div className="flex-1 bg-white rounded border border-gray-200 overflow-hidden min-h-0">
        <iframe
          key={refreshKey}
          src={`/preview/${pageId}?draft=1`}
          className="w-full h-full"
          style={{ minHeight: 480 }}
          title="草稿预览"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
      <p className="text-xs text-gray-400 mt-1.5 text-center">保存草稿后刷新预览</p>
    </aside>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ type, text }: { type: "success" | "error" | "warning"; text: string }) {
  const styles = {
    success: "bg-green-50 text-green-800 border-green-200",
    error: "bg-red-50 text-red-800 border-red-200",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
  };
  const icons = { success: "✓", error: "✕", warning: "⚠" };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] px-4 py-3 rounded-btn shadow-lg text-sm font-medium flex items-center gap-2 border ${styles[type]}`}
    >
      <span>{icons[type]}</span>
      {text}
    </div>
  );
}

// ─── BlockEditor (main) ───────────────────────────────────────────────────────

export interface BlockEditorProps {
  pageId: string;
  pageTitle: string;
  initialBlocks: Block[];
  initialVersionId?: string;
}

export default function BlockEditor({ pageId, pageTitle, initialBlocks, initialVersionId }: BlockEditorProps) {
  const [blocks, setBlocks] = useState<Block[]>(
    initialBlocks.map((b, i) => ({
      ...b,
      position: b.position ?? i,
      visible: b.visible ?? true,
    }))
  );
  const [isDirty, setIsDirty] = useState(false);
  const [versionId, setVersionId] = useState<string | undefined>(initialVersionId);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [configBlockId, setConfigBlockId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error" | "warning"; text: string } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Fix P2: avoid stacking multiple setTimeout by clearing previous timer
  const showToast = useCallback((type: "success" | "error" | "warning", text: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ type, text });
    toastTimerRef.current = setTimeout(() => setToast(null), 4000);
  }, []);

  const handleDragStart = (e: DragStartEvent) => setActiveId(e.active.id as string);

  const handleDragEnd = useCallback((e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setBlocks((prev) => {
      const oi = prev.findIndex((b) => b.id === active.id);
      const ni = prev.findIndex((b) => b.id === over.id);
      return arrayMove(prev, oi, ni).map((b, i) => ({ ...b, position: i }));
    });
    setIsDirty(true);
  }, []);

  const addBlock = useCallback((type: BlockType) => {
    const id = `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const meta = BLOCK_META[type];
    setBlocks((prev) => [
      ...prev,
      { id, type, position: prev.length, visible: true, config: { ...meta.defaultConfig } as Block["config"] },
    ]);
    setIsDirty(true);
    setConfigBlockId(id);
  }, []);

  const toggleVisible = useCallback((id: string) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, visible: !b.visible } : b)));
    setIsDirty(true);
  }, []);

  const deleteBlock = useCallback((id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id).map((b, i) => ({ ...b, position: i })));
    setIsDirty(true);
  }, []);

  const updateBlockConfig = useCallback((id: string, config: Block["config"]) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, config } : b)));
    setIsDirty(true);
  }, []);

  const saveDraft = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/pages/${pageId}/layout/draft`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks, versionId }),
      });
      if (res.status === 409) { showToast("error", "版本冲突，请刷新页面后重试"); return; }
      if (!res.ok) throw new Error();
      const data = await res.json();
      setVersionId(data.id);
      setIsDirty(false);
      showToast("success", "草稿已保存");
    } catch {
      showToast("error", "保存失败，请重试");
    } finally {
      setSaving(false);
    }
  }, [blocks, pageId, versionId, showToast]);

  const publish = useCallback(async () => {
    setShowPublishConfirm(false);
    setPublishing(true);
    try {
      const saveRes = await fetch(`/api/admin/pages/${pageId}/layout/draft`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks, versionId }),
      });
      if (saveRes.status === 409) { showToast("error", "版本冲突，请刷新页面后重试"); return; }
      if (!saveRes.ok) throw new Error();
      const saved = await saveRes.json();
      setVersionId(saved.id);

      const pubRes = await fetch(`/api/admin/pages/${pageId}/layout/publish`, { method: "POST" });
      if (!pubRes.ok) throw new Error();
      setIsDirty(false);
      showToast("success", "已成功发布");
    } catch {
      showToast("error", "发布失败，请重试");
    } finally {
      setPublishing(false);
    }
  }, [blocks, pageId, versionId, showToast]);

  const handleRollback = useCallback(async (targetVersionId: string) => {
    setShowVersionHistory(false);
    try {
      const res = await fetch(`/api/admin/pages/${pageId}/layout/rollback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionId: targetVersionId }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setVersionId(data.id);
      showToast("success", `已回滚，新草稿 v${data.version} 已创建`);

      const currentRes = await fetch(`/api/admin/pages/${pageId}/layout/current`);
      if (currentRes.ok) {
        const current = await currentRes.json();
        setBlocks((current.blocks as Block[]).map((b: Block, i: number) => ({
          ...b,
          position: b.position ?? i,
          visible: b.visible ?? true,
        })));
        setIsDirty(false);
      }
    } catch {
      showToast("error", "回滚失败，请重试");
    }
  }, [pageId, showToast]);

  const sortedBlocks = [...blocks].sort((a, b) => a.position - b.position);
  const activeBlock = activeId ? blocks.find((b) => b.id === activeId) : null;
  const configBlock = configBlockId ? blocks.find((b) => b.id === configBlockId) : null;

  // Fix P2: use flex-1 instead of hardcoded height calc
  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Toolbar */}
      <header className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold text-gray-800">{pageTitle}</h1>
          {isDirty && (
            <span className="text-xs text-amber-600 flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
              未保存
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowVersionHistory(true)}
            className="px-3 py-1.5 text-xs border border-gray-200 rounded-btn text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            版本历史
          </button>
          <button
            onClick={saveDraft}
            disabled={saving}
            className="px-3 py-1.5 text-xs border border-gray-200 rounded-btn text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            {saving ? "保存中…" : "保存草稿"}
          </button>
          <button
            onClick={() => setShowPublishConfirm(true)}
            disabled={publishing}
            className="px-4 py-1.5 text-xs bg-[#ff6b2b] text-white rounded-btn hover:bg-[#e55a1c] disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff6b2b] font-medium"
          >
            {publishing ? "发布中…" : "发布"}
          </button>
        </div>
      </header>

      {/* Three-column layout */}
      <div className="flex flex-1 gap-4 p-4 overflow-hidden min-h-0">
        <BlockLibrary onAdd={addBlock} />

        {/* Center: sortable list */}
        <main className="flex-1 overflow-y-auto" aria-label="页面区块列表">
          {sortedBlocks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-card">
              <span className="text-4xl mb-3" aria-hidden="true">📦</span>
              <p className="text-sm font-medium">还没有区块</p>
              <p className="text-xs mt-1">从左侧区块库中点击添加</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={sortedBlocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2" role="list" aria-label="可拖拽区块列表">
                  {sortedBlocks.map((block) => (
                    <div key={block.id} role="listitem">
                      <SortableBlockCard
                        block={block}
                        onToggleVisible={toggleVisible}
                        onOpenConfig={setConfigBlockId}
                        onDelete={deleteBlock}
                      />
                    </div>
                  ))}
                </div>
              </SortableContext>
              <DragOverlay>
                {activeBlock && (
                  <div className="bg-white border-2 border-[#ff6b2b] rounded-btn px-3 py-2 shadow-xl flex items-center gap-2 opacity-95">
                    <span className="text-lg" aria-hidden="true">{BLOCK_META[activeBlock.type].icon}</span>
                    <span className="text-sm font-medium text-gray-800">{BLOCK_META[activeBlock.type].label}</span>
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          )}
        </main>

        <PreviewPanel pageId={pageId} />
      </div>

      {/* Block Config Drawer */}
      {configBlock && (
        <BlockConfigDrawer
          block={configBlock}
          onSave={(cfg) => { updateBlockConfig(configBlock.id, cfg); setConfigBlockId(null); }}
          onClose={() => setConfigBlockId(null)}
        />
      )}

      {/* Publish confirmation */}
      {showPublishConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="publish-title"
        >
          <div className="bg-white rounded-card shadow-2xl p-6 max-w-sm w-full mx-4">
            <h2 id="publish-title" className="text-base font-semibold text-gray-800 mb-2">确认发布</h2>
            <p className="text-sm text-gray-500 mb-5">
              发布后，当前草稿将立即对所有用户可见。确定要发布吗？
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowPublishConfirm(false)}
                className="px-4 py-2 text-sm border border-gray-200 rounded-btn text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                取消
              </button>
              <button
                onClick={publish}
                className="px-4 py-2 text-sm bg-[#ff6b2b] text-white rounded-btn hover:bg-[#e55a1c] transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff6b2b]"
              >
                确认发布
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Version History Dialog */}
      {showVersionHistory && (
        <VersionHistoryDialog
          pageId={pageId}
          onRollback={handleRollback}
          onClose={() => setShowVersionHistory(false)}
        />
      )}

      {/* Toast notification */}
      {toast && <Toast type={toast.type} text={toast.text} />}
    </div>
  );
}
