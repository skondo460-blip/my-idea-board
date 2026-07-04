"use server";

/**
 * Server Actions — クライアントから呼び出すDB操作。
 * 各アクションは楽観的更新（UI側は即時反映）と並行して実行される。
 */

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { categories, ideas, subTasks } from "@/lib/db/schema";
import type { StatusKey } from "@/lib/schema";

// ===== カテゴリ =====

export async function addCategoryAction(id: string, name: string) {
  await db.insert(categories).values({ id, name });
  revalidatePath("/");
}

export async function deleteCategoryAction(id: string) {
  await db.delete(categories).where(eq(categories.id, id));
  revalidatePath("/");
}

// ===== アイデア =====

export async function addIdeaAction(
  id: string,
  title: string,
  status: StatusKey,
  categoryId: string | null,
) {
  await db.insert(ideas).values({ id, title, status, categoryId, archived: false });
  revalidatePath("/");
}

export async function updateIdeaFieldAction(
  id: string,
  field: "title" | "memo" | "categoryId" | "dueDate",
  value: string,
) {
  const updateValue =
    field === "categoryId"
      ? { categoryId: value === "" ? null : value }
      : { [field]: value };
  await db.update(ideas).set(updateValue).where(eq(ideas.id, id));
}

export async function updateIdeaStatusAction(id: string, status: StatusKey) {
  await db.update(ideas).set({ status }).where(eq(ideas.id, id));
}

export async function archiveIdeaAction(id: string) {
  await db.update(ideas).set({ archived: true }).where(eq(ideas.id, id));
  revalidatePath("/");
}

export async function restoreIdeaAction(id: string) {
  await db.update(ideas).set({ archived: false }).where(eq(ideas.id, id));
  revalidatePath("/");
}

// ===== サブタスク =====

export async function addSubTaskAction(id: string, ideaId: string, title: string) {
  await db.insert(subTasks).values({ id, ideaId, title, done: false });
}

export async function toggleSubTaskAction(id: string, done: boolean) {
  await db.update(subTasks).set({ done }).where(eq(subTasks.id, id));
}

export async function deleteSubTaskAction(id: string) {
  await db.delete(subTasks).where(eq(subTasks.id, id));
}
