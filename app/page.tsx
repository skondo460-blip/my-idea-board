import { db } from "@/lib/db";
import { categories, ideas, subTasks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Workspace } from "@/components/workspace/Workspace";
import workspaceData from "@/data/workspace.json";
import { workspaceSchema } from "@/lib/schema";
import type { Category, IdeaItem } from "@/lib/schema";

export default async function Page() {
  const wsResult = workspaceSchema.safeParse(workspaceData);
  if (!wsResult.success) {
    throw new Error(`workspace.json の形式が正しくありません`);
  }

  // DBからカテゴリ・アイデア・サブタスクを取得
  const [dbCategories, dbIdeas, dbSubTasks] = await Promise.all([
    db.select().from(categories).orderBy(categories.createdAt),
    db.select().from(ideas).orderBy(ideas.createdAt),
    db.select().from(subTasks).orderBy(subTasks.createdAt),
  ]);

  // アプリの型に変換
  const initialCategories: Category[] = dbCategories.map((c) => ({
    id: c.id,
    name: c.name,
  }));

  const initialIdeas: IdeaItem[] = dbIdeas.map((idea) => ({
    id: idea.id,
    title: idea.title,
    memo: idea.memo,
    categoryId: idea.categoryId ?? null,
    dueDate: idea.dueDate,
    status: idea.status as IdeaItem["status"],
    archived: idea.archived,
    subTasks: dbSubTasks
      .filter((s) => s.ideaId === idea.id)
      .map((s) => ({ id: s.id, title: s.title, done: s.done })),
  }));

  return (
    <Workspace
      initialCategories={initialCategories}
      initialIdeas={initialIdeas}
      workspace={wsResult.data}
    />
  );
}
