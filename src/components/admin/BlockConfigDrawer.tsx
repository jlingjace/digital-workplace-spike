"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Block } from "@/types/blocks";
import { BLOCK_META } from "@/types/blocks";

// ─── Zod Schemas for all 14 block types ──────────────────────────────────────

const schemas: Record<string, z.ZodTypeAny> = {
  announcements_feed: z.object({
    count: z.number({ required_error: "必填" }).min(1).max(20),
    showImages: z.boolean(),
    audienceScope: z.enum(["all", "dept"]),
  }),
  quick_access_grid: z.object({
    count: z.number().min(2).max(12),
    systemCategories: z.array(z.string()).min(1, "至少选择一个分类"),
  }),
  action_items_list: z.object({
    dataSource: z.string().min(1, "必填"),
  }),
  events_calendar: z.object({
    calendarIds: z.array(z.string()),
    daysAhead: z.number().min(1).max(365),
  }),
  news_culture_cards: z.object({
    category: z.string().min(1, "必填"),
    count: z.number().min(1).max(20),
  }),
  team_directory: z.object({
    deptScope: z.string().min(1, "必填"),
  }),
  resources_policies_table: z.object({
    department: z.string().min(1, "必填"),
    docCategory: z.string().min(1, "必填"),
  }),
  connected_tools_list: z.object({
    categories: z.array(z.string()).min(1, "至少选择一个分类"),
  }),
  infrastructure_health: z.object({
    endpointUrl: z.string().url("请输入有效的 URL").or(z.literal("")),
  }),
  project_status_board: z.object({
    jiraProjectKeys: z.array(z.string()),
    count: z.number().min(1).max(20),
  }),
  dept_hero_banner: z.object({
    title: z.string().min(1, "必填"),
    stats: z.array(z.object({ label: z.string().min(1), value: z.string().min(1) })),
    backgroundStyle: z.enum(["gradient", "solid", "image"]),
  }),
  alert_banner: z.object({
    content: z.string().min(1, "必填"),
    ctaLabel: z.string(),
    ctaUrl: z.string(),
    variant: z.enum(["warning", "info", "error"]),
  }),
  custom_link_block: z.object({
    links: z.array(z.object({ label: z.string().min(1), url: z.string().url("请输入有效 URL"), icon: z.string() })),
  }),
  custom_embed_block: z.object({
    embedUrl: z.string().url("请输入有效的 URL"),
    height: z.number().min(100).max(2000),
  }),
};

// ─── Field helpers ────────────────────────────────────────────────────────────

function FieldLabel({ label, error }: { label: string; error?: string }) {
  return (
    <div className="flex items-center justify-between mb-1">
      <label className="text-xs font-medium text-gray-700">{label}</label>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

const inputClass =
  "w-full text-sm border border-gray-200 rounded-btn px-3 py-2 focus:outline-none focus:border-[#ff6b2b] focus:ring-2 focus:ring-[#ff6b2b]/20 transition-colors";

const selectClass =
  "w-full text-sm border border-gray-200 rounded-btn px-3 py-2 bg-white focus:outline-none focus:border-[#ff6b2b] focus:ring-2 focus:ring-[#ff6b2b]/20 transition-colors";

// ─── Tags input — controlled mode to prevent data loss on direct submit ───────

function TagsInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [raw, setRaw] = useState(value.join(", "));

  const commit = (text: string) => {
    const tags = text.split(",").map((s) => s.trim()).filter(Boolean);
    onChange(tags);
  };

  return (
    <input
      className={inputClass}
      value={raw}
      placeholder={placeholder ?? "用逗号分隔，如: A, B, C"}
      onChange={(e) => setRaw(e.target.value)}
      onBlur={(e) => commit(e.target.value)}
    />
  );
}

// ─── Config form per block type ───────────────────────────────────────────────

function ConfigForm({
  block,
  onSave,
  onClose,
}: {
  block: Block;
  onSave: (config: Block["config"]) => void;
  onClose: () => void;
}) {
  const schema = schemas[block.type];

  // Guard: unknown block type
  if (!schema) {
    return (
      <div className="flex-1 flex items-center justify-center p-5">
        <p className="text-sm text-gray-400">不支持的区块类型：{block.type}</p>
      </div>
    );
  }

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: block.config as unknown as Record<string, unknown>,
  });

  const { fields: statsFields, append: appendStat, remove: removeStat } = useFieldArray({
    control,
    name: "stats" as never,
  });
  const { fields: linksFields, append: appendLink, remove: removeLink } = useFieldArray({
    control,
    name: "links" as never,
  });

  const onSubmit = (data: Record<string, unknown>) => {
    onSave(data as unknown as Block["config"]);
  };

  const focusRingPrimary = "focus:outline-none focus:ring-2 focus:ring-[#ff6b2b] focus:ring-offset-1";
  const focusRingGray = "focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* announcements_feed */}
        {block.type === "announcements_feed" && (
          <>
            <div>
              <FieldLabel label="显示数量 (1-20)" error={(errors as Record<string, {message?: string}>).count?.message} />
              <input type="number" min={1} max={20} className={inputClass} {...register("count", { valueAsNumber: true })} />
            </div>
            <div>
              <FieldLabel label="受众范围" />
              <select className={selectClass} {...register("audienceScope")}>
                <option value="all">全员</option>
                <option value="dept">仅本部门</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="showImages" {...register("showImages")} className="accent-[#ff6b2b]" />
              <label htmlFor="showImages" className="text-sm text-gray-700">显示图片</label>
            </div>
          </>
        )}

        {/* quick_access_grid */}
        {block.type === "quick_access_grid" && (
          <>
            <div>
              <FieldLabel label="显示数量 (2-12)" error={(errors as Record<string, {message?: string}>).count?.message} />
              <input type="number" min={2} max={12} className={inputClass} {...register("count", { valueAsNumber: true })} />
            </div>
            <div>
              <FieldLabel label="系统分类（逗号分隔）" error={(errors as Record<string, {message?: string}>).systemCategories?.message} />
              <TagsInput value={(watch("systemCategories") as string[]) ?? []} onChange={(v) => setValue("systemCategories", v)} />
            </div>
          </>
        )}

        {/* action_items_list */}
        {block.type === "action_items_list" && (
          <div>
            <FieldLabel label="数据源" error={(errors as Record<string, {message?: string}>).dataSource?.message} />
            <select className={selectClass} {...register("dataSource")}>
              <option value="tasks">任务系统</option>
              <option value="jira">Jira</option>
              <option value="manual">手动管理</option>
            </select>
          </div>
        )}

        {/* events_calendar */}
        {block.type === "events_calendar" && (
          <>
            <div>
              <FieldLabel label="Calendar IDs（逗号分隔）" />
              <TagsInput
                value={(watch("calendarIds") as string[]) ?? []}
                onChange={(v) => setValue("calendarIds", v)}
                placeholder="primary, team@company.com"
              />
            </div>
            <div>
              <FieldLabel label="预读天数 (1-365)" error={(errors as Record<string, {message?: string}>).daysAhead?.message} />
              <input type="number" min={1} max={365} className={inputClass} {...register("daysAhead", { valueAsNumber: true })} />
            </div>
          </>
        )}

        {/* news_culture_cards */}
        {block.type === "news_culture_cards" && (
          <>
            <div>
              <FieldLabel label="分类" error={(errors as Record<string, {message?: string}>).category?.message} />
              <select className={selectClass} {...register("category")}>
                <option value="all">全部</option>
                <option value="news">新闻</option>
                <option value="culture">文化</option>
                <option value="events">活动</option>
              </select>
            </div>
            <div>
              <FieldLabel label="显示数量 (1-20)" error={(errors as Record<string, {message?: string}>).count?.message} />
              <input type="number" min={1} max={20} className={inputClass} {...register("count", { valueAsNumber: true })} />
            </div>
          </>
        )}

        {/* team_directory */}
        {block.type === "team_directory" && (
          <div>
            <FieldLabel label="部门范围" error={(errors as Record<string, {message?: string}>).deptScope?.message} />
            <input className={inputClass} placeholder="all 或部门名称" {...register("deptScope")} />
          </div>
        )}

        {/* resources_policies_table */}
        {block.type === "resources_policies_table" && (
          <>
            <div>
              <FieldLabel label="部门" error={(errors as Record<string, {message?: string}>).department?.message} />
              <input className={inputClass} placeholder="all 或部门名" {...register("department")} />
            </div>
            <div>
              <FieldLabel label="文档分类" error={(errors as Record<string, {message?: string}>).docCategory?.message} />
              <select className={selectClass} {...register("docCategory")}>
                <option value="all">全部</option>
                <option value="policy">政策</option>
                <option value="handbook">手册</option>
                <option value="template">模板</option>
              </select>
            </div>
          </>
        )}

        {/* connected_tools_list */}
        {block.type === "connected_tools_list" && (
          <div>
            <FieldLabel label="工具分类（逗号分隔）" error={(errors as Record<string, {message?: string}>).categories?.message} />
            <TagsInput
              value={(watch("categories") as string[]) ?? []}
              onChange={(v) => setValue("categories", v)}
              placeholder="all, dev, hr, finance"
            />
          </div>
        )}

        {/* infrastructure_health */}
        {block.type === "infrastructure_health" && (
          <div>
            <FieldLabel label="状态 Endpoint URL" error={(errors as Record<string, {message?: string}>).endpointUrl?.message} />
            <input type="url" className={inputClass} placeholder="https://status.example.com/api" {...register("endpointUrl")} />
          </div>
        )}

        {/* project_status_board */}
        {block.type === "project_status_board" && (
          <>
            <div>
              <FieldLabel label="Jira Project Keys（逗号分隔）" />
              <TagsInput
                value={(watch("jiraProjectKeys") as string[]) ?? []}
                onChange={(v) => setValue("jiraProjectKeys", v)}
                placeholder="WEB, INFRA, DATA"
              />
            </div>
            <div>
              <FieldLabel label="显示项目数 (1-20)" error={(errors as Record<string, {message?: string}>).count?.message} />
              <input type="number" min={1} max={20} className={inputClass} {...register("count", { valueAsNumber: true })} />
            </div>
          </>
        )}

        {/* dept_hero_banner */}
        {block.type === "dept_hero_banner" && (
          <>
            <div>
              <FieldLabel label="标题" error={(errors as Record<string, {message?: string}>).title?.message} />
              <input className={inputClass} placeholder="Human Resources Department" {...register("title")} />
            </div>
            <div>
              <FieldLabel label="背景样式" />
              <select className={selectClass} {...register("backgroundStyle")}>
                <option value="gradient">渐变</option>
                <option value="solid">纯色</option>
                <option value="image">图片</option>
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700">统计数据</span>
                <button type="button" onClick={() => appendStat({ label: "", value: "" })}
                  className={`text-xs text-[#ff6b2b] hover:text-[#e55a1c] font-medium ${focusRingPrimary}`}>
                  + 添加
                </button>
              </div>
              {statsFields.map((field, idx) => (
                <div key={field.id} className="flex gap-2 mb-2 items-start">
                  <input className={`${inputClass} flex-1`} placeholder="标签（如：员工数）" {...register(`stats.${idx}.label`)} />
                  <input className={`${inputClass} w-24`} placeholder="值" {...register(`stats.${idx}.value`)} />
                  <button type="button" onClick={() => removeStat(idx)}
                    className={`p-2 text-gray-400 hover:text-red-500 flex-shrink-0 ${focusRingGray}`}
                    aria-label="删除统计项">✕</button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* alert_banner */}
        {block.type === "alert_banner" && (
          <>
            <div>
              <FieldLabel label="类型" />
              <select className={selectClass} {...register("variant")}>
                <option value="info">信息（蓝色）</option>
                <option value="warning">警告（黄色）</option>
                <option value="error">错误（红色）</option>
              </select>
            </div>
            <div>
              <FieldLabel label="内容" error={(errors as Record<string, {message?: string}>).content?.message} />
              <textarea rows={3} className={inputClass} placeholder="告警内容..." {...register("content")} />
            </div>
            <div>
              <FieldLabel label="CTA 按钮文字（可选）" />
              <input className={inputClass} placeholder="了解更多" {...register("ctaLabel")} />
            </div>
            <div>
              <FieldLabel label="CTA 链接（可选）" />
              <input type="url" className={inputClass} placeholder="https://..." {...register("ctaUrl")} />
            </div>
          </>
        )}

        {/* custom_link_block */}
        {block.type === "custom_link_block" && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-700">链接列表</span>
              <button type="button" onClick={() => appendLink({ label: "", url: "", icon: "" })}
                className={`text-xs text-[#ff6b2b] hover:text-[#e55a1c] font-medium ${focusRingPrimary}`}>
                + 添加链接
              </button>
            </div>
            {linksFields.length === 0 && <p className="text-xs text-gray-400 italic">暂无链接，点击上方添加</p>}
            {linksFields.map((field, idx) => (
              <div key={field.id} className="border border-gray-100 rounded-btn p-3 mb-2 space-y-2">
                <div className="flex gap-2">
                  <input className={`${inputClass} flex-1`} placeholder="标签" {...register(`links.${idx}.label`)} />
                  <input className={`${inputClass} w-16`} placeholder="图标" {...register(`links.${idx}.icon`)} />
                  <button type="button" onClick={() => removeLink(idx)}
                    className={`p-2 text-gray-400 hover:text-red-500 ${focusRingGray}`}
                    aria-label="删除链接">✕</button>
                </div>
                <input type="url" className={inputClass} placeholder="https://..." {...register(`links.${idx}.url`)} />
              </div>
            ))}
          </div>
        )}

        {/* custom_embed_block */}
        {block.type === "custom_embed_block" && (
          <>
            <div>
              <FieldLabel label="Embed URL" error={(errors as Record<string, {message?: string}>).embedUrl?.message} />
              <input type="url" className={inputClass} placeholder="https://..." {...register("embedUrl")} />
            </div>
            <div>
              <FieldLabel label="高度 (px, 100-2000)" error={(errors as Record<string, {message?: string}>).height?.message} />
              <input type="number" min={100} max={2000} className={inputClass} {...register("height", { valueAsNumber: true })} />
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 border-t border-gray-100 px-5 py-4 flex justify-end gap-2 bg-gray-50">
        <button
          type="button"
          onClick={onClose}
          className={`px-4 py-2 text-sm border border-gray-200 rounded-btn text-gray-600 hover:bg-gray-100 transition-colors ${focusRingGray}`}
        >
          取消
        </button>
        <button
          type="submit"
          className={`px-5 py-2 text-sm bg-[#ff6b2b] text-white rounded-btn hover:bg-[#e55a1c] transition-colors ${focusRingPrimary} font-medium`}
        >
          保存配置
        </button>
      </div>
    </form>
  );
}

// ─── Drawer wrapper ───────────────────────────────────────────────────────────

interface BlockConfigDrawerProps {
  block: Block;
  onSave: (config: Block["config"]) => void;
  onClose: () => void;
}

export default function BlockConfigDrawer({ block, onSave, onClose }: BlockConfigDrawerProps) {
  const meta = BLOCK_META[block.type] ?? { icon: "🔲", label: block.type };

  // Slide-in animation: start off-screen, transition to position on mount
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

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/20" aria-hidden="true" onClick={onClose} />

      {/* Drawer — slides in from right */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col
          transition-transform duration-200 ease-out
          ${visible ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">{meta.icon}</span>
            <div>
              <h3 id="drawer-title" className="text-sm font-semibold text-gray-800">{meta.label}</h3>
              <p className="text-xs text-gray-400">配置区块参数</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="关闭配置面板"
            className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <ConfigForm block={block} onSave={onSave} onClose={onClose} />
      </div>
    </>
  );
}
