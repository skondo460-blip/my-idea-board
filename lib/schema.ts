/**
 * アイデア管理ドメインの Zod スキーマと派生型。
 * UI コンポーネントはここから型をインポートする。
 */

import { z } from "zod";

// ===== Pane 1: カテゴリ =====

/** カテゴリ。Pane 1 の Sidebar に表示する単位。 */
export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
});
export type Category = z.infer<typeof categorySchema>;

// ===== ステータス =====

/**
 * アイデアのステータス。Pane 2 のグループ分けに使う。
 * 思いつき → 検討中 → 進行中 → 完了 の 4 段階。
 */
export const statusKeySchema = z.enum(["idea", "thinking", "doing", "done"]);
export type StatusKey = z.infer<typeof statusKeySchema>;

/** ステータスの表示順。Pane 2 グループと「+ 追加」UI で共通参照する。 */
export const STATUS_ORDER = statusKeySchema.options;

// ===== サブタスク =====

/** アイデアに紐づくサブタスク。Pane 4 で管理する。 */
export const subTaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  done: z.boolean().default(false),
});
export type SubTask = z.infer<typeof subTaskSchema>;

// ===== アイデアアイテム =====

/**
 * アイデア・やることの最上位データ。
 * Pane 2 の所属グループは `status` で決まる。
 */
export const ideaItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  memo: z.string().default(""),
  categoryId: z.string().nullable().default(null),
  dueDate: z.string().default(""),
  status: statusKeySchema,
  subTasks: z.array(subTaskSchema).default([]),
  /** 論理削除フラグ。アーカイブされたアイテムは末尾グループに表示。 */
  archived: z.boolean().default(false),
});
export type IdeaItem = z.infer<typeof ideaItemSchema>;

// ===== JSON 全体用スキーマ =====

export const categoriesSchema = z.array(categorySchema);
export const ideasSchema = z.array(ideaItemSchema);
export const workspaceSchema = z.object({
  name: z.string(),
  icon: z.string(),
});

// ===== Pane 4 の表示状態 =====

/**
 * Pane 4 に「何を開いているか」を表す型。
 * - `{ type: "item"; ideaId: string }`: サブタスク一覧を表示中
 * - `null`: 未選択（Pane 4 は畳み状態）
 */
export type SelectedDetail = { type: "item"; ideaId: string } | null;

// ===== Pane 2 の派生計算用 UI 表示型 =====

export type IdeaRow = {
  id: string;
  title: string;
  categoryId: string | null;
  dueDate: string;
  subTaskCount: number;
  subTaskDoneCount: number;
};

/** Pane 2 のグループ表示単位（ステータス or アーカイブ済み）。 */
export type Group =
  | { kind: "status"; status: StatusKey; label: string; items: IdeaRow[] }
  | { kind: "archived"; label: string; items: IdeaRow[] };
