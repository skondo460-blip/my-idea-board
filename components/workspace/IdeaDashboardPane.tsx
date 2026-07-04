"use client";

/**
 * Pane 3: アイデアダッシュボード。
 * タイトル・カテゴリ・期限日・メモ の編集 + サブタスク進捗サマリーを表示。
 */

import { ArrowUpRight, CheckSquare } from "lucide-react";

import { cn } from "@/lib/utils";
import { type IdeaItem, type Category, type SelectedDetail } from "@/lib/schema";
import { STATUS_LABELS } from "@/lib/labels";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  InlineTextField,
  InlineDateField,
  InlineSelectField,
  InlineTextareaField,
  InlineFieldRow,
} from "@/components/primitives";

type IdeaDashboardPaneProps = {
  idea: IdeaItem;
  categories: Category[];
  selectedDetail: SelectedDetail;
  onOpenDetail: (next: SelectedDetail) => void;
  onUpdateIdeaField: (id: string, field: EditableIdeaField, value: string) => void;
  ideaKey: string;
};

type EditableIdeaField = "title" | "memo" | "categoryId" | "dueDate";

export function IdeaDashboardPane({
  idea,
  categories,
  selectedDetail,
  onOpenDetail,
  onUpdateIdeaField,
  ideaKey,
}: IdeaDashboardPaneProps) {
  const subTaskDone = idea.subTasks.filter((s) => s.done).length;
  const subTaskTotal = idea.subTasks.length;
  const isSubTaskSelected = selectedDetail?.type === "item" && selectedDetail.ideaId === idea.id;

  const categoryOptions = categories.map((c) => c.name);
  const categoryValue = categories.find((c) => c.id === idea.categoryId)?.name ?? "";

  const handleCategoryChange = (categoryName: string) => {
    const found = categories.find((c) => c.name === categoryName);
    onUpdateIdeaField(idea.id, "categoryId", found?.id ?? "");
  };

  return (
    <section className="min-w-0 flex-1 bg-canvas">
      <ScrollArea className="h-full">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 px-8 py-8" key={ideaKey}>
          {/* ヘッダー: タイトル + ステータスバッジ */}
          <div className="flex flex-col gap-2">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <InlineTextField
                  value={idea.title}
                  onSave={(v) => onUpdateIdeaField(idea.id, "title", v)}
                  ariaLabel="タイトル"
                  placeholder="タイトルを入力"
                />
              </div>
              <Badge variant="secondary" className="mt-1 shrink-0">
                {STATUS_LABELS[idea.status]}
              </Badge>
            </div>
          </div>

          {/* 詳細カード */}
          <Card>
            <CardHeader>
              <CardTitle emphasis="prominent">詳細</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="flex flex-col gap-2.5 text-sm">
                <InlineFieldRow label="カテゴリ">
                  <InlineSelectField
                    value={categoryValue}
                    options={categoryOptions}
                    onSave={handleCategoryChange}
                    ariaLabel="カテゴリ"
                    placeholder="未設定"
                  />
                </InlineFieldRow>
                <InlineFieldRow label="期限日">
                  <InlineDateField
                    value={idea.dueDate}
                    onSave={(v) => onUpdateIdeaField(idea.id, "dueDate", v)}
                    ariaLabel="期限日"
                  />
                </InlineFieldRow>
              </dl>

              <Separator className="my-4" />

              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-muted-foreground">メモ</p>
                <InlineTextareaField
                  value={idea.memo}
                  onSave={(v) => onUpdateIdeaField(idea.id, "memo", v)}
                  ariaLabel="メモ"
                />
              </div>
            </CardContent>
          </Card>

          {/* サブタスクカード（Pane 4 へのエントリーポイント） */}
          <Card>
            <button
              type="button"
              onClick={() =>
                onOpenDetail(
                  isSubTaskSelected ? null : { type: "item", ideaId: idea.id },
                )
              }
              aria-label="Pane 4 でサブタスクを開く"
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-4 py-4 text-left transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                isSubTaskSelected ? "bg-accent" : "hover:bg-muted/40",
              )}
            >
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg",
                  isSubTaskSelected
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <CheckSquare className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-sm font-medium",
                    isSubTaskSelected ? "text-accent-foreground" : "text-foreground",
                  )}
                >
                  サブタスク
                </p>
                <p
                  className={cn(
                    "text-xs tabular-nums",
                    isSubTaskSelected
                      ? "text-accent-foreground/70"
                      : "text-muted-foreground",
                  )}
                >
                  {subTaskTotal === 0
                    ? "なし"
                    : `${subTaskDone} / ${subTaskTotal} 完了`}
                </p>
              </div>
              <ArrowUpRight
                aria-hidden="true"
                className={cn(
                  "size-4 shrink-0",
                  isSubTaskSelected ? "text-primary" : "text-muted-foreground",
                )}
              />
            </button>
          </Card>
        </div>
      </ScrollArea>
    </section>
  );
}
