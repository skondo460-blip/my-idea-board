/**
 * アイデア管理ドメインの表示文言（labels）。
 */

import { type StatusKey } from "@/lib/schema";

/** Pane 2 グループ見出しに出すステータス表示名（日本語）。 */
export const STATUS_LABELS: Record<StatusKey, string> = {
  idea: "思いつき",
  thinking: "検討中",
  doing: "進行中",
  done: "完了",
};

/** Pane 2 末尾の「アーカイブ済み」グループの見出しラベル。 */
export const ARCHIVED_GROUP_LABEL = "アーカイブ済み";

/** Pane 3 ダッシュボードのセクション見出し。 */
export const PANE3_SECTION = {
  detail: "詳細",
  subTasks: "サブタスク",
} as const;
