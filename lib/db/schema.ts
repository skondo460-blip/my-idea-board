/**
 * Drizzle ORM スキーマ定義（アイデア管理ドメイン）。
 * テーブル構成（案1 3テーブル）:
 *   categories — カテゴリ
 *   ideas       — アイデア・やること
 *   sub_tasks   — サブタスク
 */

import {
  pgTable,
  text,
  boolean,
  timestamp,
  serial,
} from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ideas = pgTable("ideas", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  memo: text("memo").notNull().default(""),
  categoryId: text("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  dueDate: text("due_date").notNull().default(""),
  status: text("status", {
    enum: ["idea", "thinking", "doing", "done"],
  })
    .notNull()
    .default("idea"),
  sortOrder: serial("sort_order"),
  archived: boolean("archived").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const subTasks = pgTable("sub_tasks", {
  id: text("id").primaryKey(),
  ideaId: text("idea_id")
    .notNull()
    .references(() => ideas.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  done: boolean("done").notNull().default(false),
  sortOrder: serial("sort_order"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
