"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Block, BlockType, AnnouncementsFeedConfig, QuickAccessGridConfig } from "@/types/blocks";

interface SortableBlockItemProps {
  block: Block;
  onRemove: (id: string) => void;
  onConfigChange: (id: string, config: Block["config"]) => void;
}

function SortableBlockItem({ block, onRemove, onConfigChange }: SortableBlockItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-gray-200 rounded-lg p-4 flex gap-3 items-start"
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="mt-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        ⠿
      </button>

      <div className="flex-1">
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium text-gray-700 capitalize">
            {block.type.replace(/_/g, " ")}
          </span>
          <button
            onClick={() => onRemove(block.id)}
            className="text-red-400 hover:text-red-600 text-sm"
          >
            Remove
          </button>
        </div>

        {block.type === "announcements_feed" && (
          <div className="space-y-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Title</label>
              <input
                type="text"
                value={(block.config as AnnouncementsFeedConfig).title}
                onChange={(e) =>
                  onConfigChange(block.id, {
                    ...(block.config as AnnouncementsFeedConfig),
                    title: e.target.value,
                  })
                }
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Count</label>
              <input
                type="number"
                min={1}
                max={20}
                value={(block.config as AnnouncementsFeedConfig).count}
                onChange={(e) =>
                  onConfigChange(block.id, {
                    ...(block.config as AnnouncementsFeedConfig),
                    count: parseInt(e.target.value, 10) || 5,
                  })
                }
                className="w-24 border rounded px-2 py-1 text-sm"
              />
            </div>
          </div>
        )}

        {block.type === "quick_access_grid" && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">Title</label>
            <input
              type="text"
              value={(block.config as QuickAccessGridConfig).title}
              onChange={(e) =>
                onConfigChange(block.id, {
                  ...(block.config as QuickAccessGridConfig),
                  title: e.target.value,
                })
              }
              className="w-full border rounded px-2 py-1 text-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
}

interface BlockEditorProps {
  pageId: string;
  initialBlocks: Block[];
}

const BLOCK_DEFAULTS: Record<BlockType, () => Block["config"]> = {
  announcements_feed: () => ({ title: "Latest Announcements", count: 5 }),
  quick_access_grid: () => ({ title: "Quick Access", items: [] }),
  action_items: () => ({ title: "待办事项" }),
  events_calendar: () => ({ title: "即将到来的活动" }),
  news_culture: () => ({ title: "企业新闻" }),
};

export default function BlockEditor({ pageId, initialBlocks }: BlockEditorProps) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setBlocks((prev) => {
      const oldIndex = prev.findIndex((b) => b.id === active.id);
      const newIndex = prev.findIndex((b) => b.id === over.id);
      const reordered = arrayMove(prev, oldIndex, newIndex);
      return reordered.map((b, i) => ({ ...b, order: i }));
    });
  }, []);

  const addBlock = useCallback((type: BlockType) => {
    const id = `block-${Date.now()}`;
    const newBlock: Block = {
      id,
      type,
      order: blocks.length,
      config: BLOCK_DEFAULTS[type](),
    };
    setBlocks((prev) => [...prev, newBlock]);
  }, [blocks.length]);

  const removeBlock = useCallback((id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id).map((b, i) => ({ ...b, order: i })));
  }, []);

  const updateConfig = useCallback((id: string, config: Block["config"]) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, config } : b)));
  }, []);

  const saveDraft = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/pages/${pageId}/layout/draft`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks }),
      });
      if (!res.ok) throw new Error("Save failed");
      setMessage({ type: "success", text: "Draft saved" });
    } catch {
      setMessage({ type: "error", text: "Failed to save draft" });
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    setPublishing(true);
    setMessage(null);
    try {
      // Save draft first
      await fetch(`/api/admin/pages/${pageId}/layout/draft`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks }),
      });
      // Then publish
      const res = await fetch(`/api/admin/pages/${pageId}/layout/publish`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Publish failed");
      const data = await res.json();
      setMessage({ type: "success", text: `Published as version ${data.version}` });
    } catch {
      setMessage({ type: "error", text: "Failed to publish" });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <span className="text-sm text-gray-500">Add block:</span>
          <button
            onClick={() => addBlock("announcements_feed")}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            + Announcements Feed
          </button>
          <button
            onClick={() => addBlock("quick_access_grid")}
            className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
          >
            + Quick Access Grid
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={saveDraft}
            disabled={saving}
            className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Draft"}
          </button>
          <button
            onClick={publish}
            disabled={publishing}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {publishing ? "Publishing..." : "Publish"}
          </button>
        </div>
      </div>

      {/* Status message */}
      {message && (
        <div
          className={`mb-4 p-3 rounded text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Block list */}
      {blocks.length === 0 ? (
        <div className="text-center py-12 text-gray-400 border-2 border-dashed rounded-lg">
          No blocks yet. Add one above.
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={blocks.map((b) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {[...blocks]
                .sort((a, b) => a.order - b.order)
                .map((block) => (
                  <SortableBlockItem
                    key={block.id}
                    block={block}
                    onRemove={removeBlock}
                    onConfigChange={updateConfig}
                  />
                ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
