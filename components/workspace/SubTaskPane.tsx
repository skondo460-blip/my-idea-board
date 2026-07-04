"use client";

/**
 * Pane 4: サブタスクパネル。
 * アイデアに紐づくサブタスクの追加・完了トグル・削除を行う。
 */

import { useRef, useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { type IdeaItem, type SelectedDetail } from "@/lib/schema";
import { Pane4Toggle } from "@/components/workspace/Pane4Toggle";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Pane4Section } from "@/components/workspace/Pane4Section";

type SubTaskPaneProps = {
  idea: IdeaItem | null;
  selectedDetail: SelectedDetail;
  pane4Open: boolean;
  onTogglePane4: () => void;
  onAddSubTask: (ideaId: string, title: string) => void;
  onToggleSubTask: (ideaId: string, subTaskId: string) => void;
  onDeleteSubTask: (ideaId: string, subTaskId: string) => void;
};

export function SubTaskPane({
  idea,
  selectedDetail,
  pane4Open,
  onTogglePane4,
  onAddSubTask,
  onToggleSubTask,
  onDeleteSubTask,
}: SubTaskPaneProps) {
  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col border-l border-border bg-background",
        "overflow-hidden transition-[width] duration-200 ease-linear",
        pane4Open ? "w-[360px]" : "w-12",
      )}
    >
      {pane4Open ? (
        <>
          <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3">
            <h2 className="flex-1 truncate text-sm font-semibold text-foreground">
              サブタスク
            </h2>
            <Pane4Toggle open={pane4Open} onToggle={onTogglePane4} />
          </header>

          <ScrollArea className="min-h-0 flex-1">
            {idea && selectedDetail?.type === "item" && (
              <SubTaskContent
                key={idea.id}
                idea={idea}
                onAddSubTask={onAddSubTask}
                onToggleSubTask={onToggleSubTask}
                onDeleteSubTask={onDeleteSubTask}
              />
            )}
          </ScrollArea>
        </>
      ) : (
        <div className="flex h-12 shrink-0 items-center justify-center border-b border-border">
          <Pane4Toggle open={pane4Open} onToggle={onTogglePane4} />
        </div>
      )}
    </aside>
  );
}

function SubTaskContent({
  idea,
  onAddSubTask,
  onToggleSubTask,
  onDeleteSubTask,
}: {
  idea: IdeaItem;
  onAddSubTask: (ideaId: string, title: string) => void;
  onToggleSubTask: (ideaId: string, subTaskId: string) => void;
  onDeleteSubTask: (ideaId: string, subTaskId: string) => void;
}) {
  const [newTitle, setNewTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    onAddSubTask(idea.id, trimmed);
    setNewTitle("");
    inputRef.current?.focus();
  };

  const pending = idea.subTasks.filter((s) => !s.done);
  const done = idea.subTasks.filter((s) => s.done);

  return (
    <div>
      <Pane4Section title="やること">
        <div className="flex flex-col gap-1">
          {pending.length === 0 && done.length === 0 && (
            <p className="py-2 text-center text-xs text-muted-foreground">
              サブタスクはまだありません
            </p>
          )}
          {pending.map((sub) => (
            <SubTaskRow
              key={sub.id}
              id={sub.id}
              title={sub.title}
              done={false}
              onToggle={() => onToggleSubTask(idea.id, sub.id)}
              onDelete={() => onDeleteSubTask(idea.id, sub.id)}
            />
          ))}
        </div>

        {/* 追加フォーム */}
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-border px-2 py-1">
          <button
            type="button"
            onClick={handleAdd}
            disabled={!newTitle.trim()}
            aria-label="サブタスクを追加"
            className={cn(
              "flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors",
              "outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              "enabled:hover:text-foreground disabled:opacity-40",
            )}
          >
            <Plus className="size-3.5" aria-hidden="true" />
          </button>
          <input
            ref={inputRef}
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
            }}
            placeholder="サブタスクを追加..."
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
      </Pane4Section>

      {done.length > 0 && (
        <>
          <Separator />
          <Pane4Section title="完了済み">
            <div className="flex flex-col gap-1">
              {done.map((sub) => (
                <SubTaskRow
                  key={sub.id}
                  id={sub.id}
                  title={sub.title}
                  done
                  onToggle={() => onToggleSubTask(idea.id, sub.id)}
                  onDelete={() => onDeleteSubTask(idea.id, sub.id)}
                />
              ))}
            </div>
          </Pane4Section>
        </>
      )}
    </div>
  );
}

function SubTaskRow({
  id,
  title,
  done,
  onToggle,
  onDelete,
}: {
  id: string;
  title: string;
  done: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group/subtask flex items-center gap-2 rounded-md px-1 py-1.5">
      <button
        type="button"
        onClick={onToggle}
        aria-label={done ? `「${title}」を未完了に戻す` : `「${title}」を完了にする`}
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded border transition-colors",
          "outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          done
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-card hover:border-primary/60",
        )}
      >
        {done && <Check className="size-3" aria-hidden="true" />}
      </button>

      <span
        key={id}
        className={cn(
          "min-w-0 flex-1 text-sm",
          done ? "text-muted-foreground line-through" : "text-foreground",
        )}
      >
        {title}
      </span>

      <button
        type="button"
        onClick={onDelete}
        aria-label={`「${title}」を削除`}
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors",
          "opacity-0 group-hover/subtask:opacity-100 focus-visible:opacity-100",
          "outline-none hover:text-destructive focus-visible:ring-3 focus-visible:ring-ring/50",
        )}
      >
        <Trash2 className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
