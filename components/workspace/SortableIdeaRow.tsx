"use client";

import { type CSSProperties, type ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { type IdeaRow, type StatusKey } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Pane 2 のステータスグループ用、ドラッグ可能なアイデア行。
 * archived グループの行はドラッグさせないため、status グループ専用。
 */
export function SortableIdeaRow({
  idea,
  status,
  selected,
  onSelect,
  actions,
  categoryName,
}: {
  idea: IdeaRow;
  status: StatusKey;
  selected: boolean;
  onSelect: (id: string) => void;
  actions: ReactNode;
  categoryName?: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: idea.id,
    data: { containerId: status, title: idea.title },
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const hasSubTasks = idea.subTaskCount > 0;
  const hasDueDate = !!idea.dueDate;

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "group/idea relative",
        isDragging && "pointer-events-none opacity-50",
      )}
    >
      <button
        type="button"
        onClick={() => onSelect(idea.id)}
        className={cn(
          "flex w-full items-start gap-2 rounded-md px-2.5 py-2 text-left transition-colors",
          "outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          selected
            ? "bg-accent text-accent-foreground"
            : "text-foreground hover:bg-muted",
        )}
      >
        <span
          {...attributes}
          {...listeners}
          aria-label={`${idea.title} の並び替え`}
          className={cn(
            "flex size-5 shrink-0 cursor-grab items-center justify-center rounded text-muted-foreground",
            "mt-0.5 opacity-0 transition-opacity group-focus-within/idea:opacity-100 group-hover/idea:opacity-100",
            "hover:text-foreground active:cursor-grabbing",
            "outline-none focus-visible:opacity-100 focus-visible:ring-3 focus-visible:ring-ring/50",
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical aria-hidden="true" className="size-4" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{idea.title}</p>
          <div className="mt-0.5 flex items-center gap-2">
            {categoryName && (
              <span
                className={cn(
                  "truncate text-xs",
                  selected ? "text-accent-foreground/70" : "text-muted-foreground",
                )}
              >
                {categoryName}
              </span>
            )}
            {hasDueDate && categoryName && (
              <span
                className={cn(
                  "text-xs",
                  selected ? "text-accent-foreground/50" : "text-muted-foreground/60",
                )}
                aria-hidden="true"
              >
                ·
              </span>
            )}
            {hasDueDate && (
              <span
                className={cn(
                  "shrink-0 text-xs tabular-nums",
                  selected ? "text-accent-foreground/70" : "text-muted-foreground",
                )}
              >
                {idea.dueDate}
              </span>
            )}
          </div>
          {hasSubTasks && (
            <p
              className={cn(
                "mt-0.5 text-xs tabular-nums",
                selected ? "text-accent-foreground/70" : "text-muted-foreground",
              )}
            >
              {idea.subTaskDoneCount}/{idea.subTaskCount} 完了
            </p>
          )}
        </div>
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className={cn(
                "absolute top-2 right-1",
                "opacity-0 group-focus-within/idea:opacity-100 group-hover/idea:opacity-100",
                "transition-opacity",
                "text-muted-foreground hover:text-foreground",
              )}
              aria-label={`${idea.title} の操作`}
            >
              <MoreHorizontal />
            </Button>
          }
        />
        <DropdownMenuContent side="right" align="start">
          <DropdownMenuGroup>{actions}</DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}
