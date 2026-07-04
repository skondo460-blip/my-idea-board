/**
 * 初期データ投入スクリプト。
 * 実行: npx tsx lib/db/seed.ts
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { categories, ideas, subTasks } from "./schema";
import "dotenv/config";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function seed() {
  console.log("🌱 シードデータを投入中...");

  await db.delete(subTasks);
  await db.delete(ideas);
  await db.delete(categories);

  await db.insert(categories).values([
    { id: "cat-1", name: "仕事" },
    { id: "cat-2", name: "趣味" },
    { id: "cat-3", name: "買い物" },
    { id: "cat-4", name: "その他" },
  ]);

  await db.insert(ideas).values([
    {
      id: "idea-1",
      title: "副業でできるWebサービスを考える",
      memo: "スキルを活かせるもので、週10時間以内で運営できるものを探す。",
      categoryId: "cat-1",
      dueDate: "2026-08-31",
      status: "thinking",
      archived: false,
    },
    {
      id: "idea-2",
      title: "家庭菜園をベランダで始める",
      memo: "ミニトマトとバジルから。土と鉢は近所のホームセンターで揃える。",
      categoryId: "cat-2",
      dueDate: "2026-07-15",
      status: "doing",
      archived: false,
    },
    {
      id: "idea-3",
      title: "読みたい本リストを整理する",
      memo: "",
      categoryId: "cat-1",
      dueDate: "",
      status: "idea",
      archived: false,
    },
    {
      id: "idea-4",
      title: "新しいキーボードを買う",
      memo: "打鍵感が良くて静音のもの。予算は2万円以内。",
      categoryId: "cat-3",
      dueDate: "2026-07-20",
      status: "idea",
      archived: false,
    },
    {
      id: "idea-5",
      title: "英語のリスニングを毎日15分続ける",
      memo: "Podcastアプリで通勤中に聴く。",
      categoryId: "cat-1",
      dueDate: "",
      status: "done",
      archived: false,
    },
  ]);

  await db.insert(subTasks).values([
    { id: "sub-1-1", ideaId: "idea-1", title: "競合サービスをリサーチする", done: true },
    { id: "sub-1-2", ideaId: "idea-1", title: "収益モデルを3パターン書き出す", done: false },
    { id: "sub-1-3", ideaId: "idea-1", title: "MVPのスコープを決める", done: false },
    { id: "sub-2-1", ideaId: "idea-2", title: "鉢と土を買う", done: true },
    { id: "sub-2-2", ideaId: "idea-2", title: "苗を植える", done: true },
    { id: "sub-2-3", ideaId: "idea-2", title: "毎日水やりの習慣をつける", done: false },
    { id: "sub-4-1", ideaId: "idea-4", title: "レビュー動画を5本見る", done: false },
    { id: "sub-5-1", ideaId: "idea-5", title: "Podcastアプリをインストールする", done: true },
    { id: "sub-5-2", ideaId: "idea-5", title: "チャンネルを3つ登録する", done: true },
  ]);

  console.log("✅ シードデータの投入が完了しました");
}

seed().catch((e) => {
  console.error("❌ エラー:", e);
  process.exit(1);
});
