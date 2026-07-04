import { type IdeaItem, type StatusKey, type SubTask } from "@/lib/schema";

/**
 * 新規アイデアアイテムの最小構成を生成するファクトリ。
 * タイトル以外は空・デフォルト値。
 */
export function createMinimalIdeaItem(
  title: string,
  status: StatusKey,
): IdeaItem {
  return {
    id: `idea-${Date.now()}`,
    title,
    memo: "",
    categoryId: null,
    dueDate: "",
    status,
    subTasks: [],
    archived: false,
  };
}

/**
 * 新規サブタスクの最小構成を生成するファクトリ。
 */
export function createMinimalSubTask(title: string): SubTask {
  return {
    id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    done: false,
  };
}
