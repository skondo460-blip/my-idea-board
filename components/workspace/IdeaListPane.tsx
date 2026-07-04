"use client";

import { useState } from "react";
import {
  Archive,
  ArchiveRestore,
  ChevronDown,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragStartEvent,
  type ScreenReaderInstructions,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { cn } from "@/lib/utils";
import { type IdeaRow, type Group, type StatusKey } from "@/lib/schema";
import { STATUS_LABELS } from "@/lib/labels";
import { DeleteConfirmDialog } from "@/components/workspace/DeleteConfirmDialog";
import { SortableIdeaRow } from "@/components/workspace/SortableIdeaRow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AddItemDialog } from "@/components/workspace/AddItemDialog";

const screenReaderInstructions: ScreenReaderInstructions = {
  draggable:
    "Space または Enter でアイテムを持ち上げ、矢印キーで移動、Space で確定、Esc でキャンセルします。",
};

type IdeaListPaneProps = {
  groups: Group[];
  selectedIdeaId: string;
  onSelectIdea: (id: string) => void;
  onAddIdea: (status: StatusKey, title: string) => void;
  onArchiveIdea: (id: string) => void;
  onRestoreIdea: (id: string) => void;
  onMoveIdea: (id: string, toStatus: StatusKey, toIndex: number) => void;
  categoryNameMap: Record<string, string>;
};

export function IdeaListPane({
  groups,
  selectedIdeaId,
  onSelectIdea,
  onAddIdea,
  onArchiveIdea,
  onRestoreIdea,
  onMoveIdea,
  categoryNameMap,
}: IdeaListPaneProps) {
  const [addDialogStatus, setAddDialogStatus] = useState<{
    status: StatusKey;
    label: string;
  } | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [archivedOpen, setArchivedOpen] = useState(false);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const statusGroups = groups.filter(
    (g): g is Extract<Group, { kind: "status" }> => g.kind === "status",
  );
  const archivedGroup = groups.find(
    (g): g is Extract<Group, { kind: "archived" }> => g.kind === "archived",
  );

  const activeDragRow: { row: IdeaRow; status: StatusKey } | null = (() => {
    if (!activeDragId) return null;
    for (const g of statusGroups) {
      const row = g.items.find((r) => r.id === activeDragId);
      if (row) return { row, status: g.status };
    }
    return null;
  })();

  const announcements: Announcements = {
    onDragStart: ({ active }) => {
      const title = (active.data.current?.title as string | undefined) ?? "アイテム";
      return `${title}を持ち上げました。`;
    },
    onDragOver: ({ active, over }) => {
      const title = (active.data.current?.title as string | undefined) ?? "アイテム";
      if (!over) return `${title}を移動中です。`;
      const overContainer = over.data.current?.containerId as StatusKey | undefined;
      if (overContainer)
        return `${title}を「${STATUS_LABELS[overContainer]}」の上に移動しました。`;
      return `${title}を移動中です。`;
    },
    onDragEnd: ({ active, over }) => {
      const title = (active.data.current?.title as string | undefined) ?? "アイテム";
      if (!over) return `${title}の移動をキャンセルしました。`;
      const overContainer =
        (over.data.current?.containerId as StatusKey | undefined) ??
        (typeof over.id === "string" &&
        statusGroups.some((g) => g.status === over.id)
          ? (over.id as StatusKey)
          : undefined);
      if (!overContainer) return `${title}を確定しました。`;
      return `${title}を「${STATUS_LABELS[overContainer]}」に移動しました。`;
    },
    onDragCancel: ({ active }) => {
      const title = (active.data.current?.title as string | undefined) ?? "アイテム";
      return `${title}の移動をキャンセルしました。`;
    },
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);
    if (!over) return;

    const activeContainer = active.data.current?.containerId as StatusKey | undefined;
    const overContainer =
      (over.data.current?.containerId as StatusKey | undefined) ??
      (typeof over.id === "string" &&
      statusGroups.some((g) => g.status === over.id)
        ? (over.id as StatusKey)
        : undefined);

    if (!activeContainer || !overContainer) return;

    const targetGroup = statusGroups.find((g) => g.status === overContainer);
    if (!targetGroup) return;

    if (active.id === over.id) return;

    const overIndexInTarget = targetGroup.items.findIndex((r) => r.id === over.id);
    const toIndex = overIndexInTarget >= 0 ? overIndexInTarget : targetGroup.items.length;

    onMoveIdea(String(active.id), overContainer, toIndex);
  };

  return (
    <section className="flex w-[280px] shrink-0 flex-col border-r border-border bg-background">
      <header className="flex h-12 shrink-0 items-center border-b border-border px-4">
        <h2 className="truncate text-sm font-semibold text-foreground">
          アイデア一覧
        </h2>
      </header>

      <ScrollArea className="min-h-0 flex-1">
        <DndContext
          id="pane2-idea-dnd"
          sensors={sensors}
          collisionDetection={closestCenter}
          accessibility={{ announcements, screenReaderInstructions }}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveDragId(null)}
        >
          <div className="flex flex-col gap-5 px-3 py-4">
            {statusGroups.map((group) => (
              <StatusGroup
                key={`status:${group.status}`}
                status={group.status}
                label={group.label}
                items={group.items}
                selectedIdeaId={selectedIdeaId}
                onSelectIdea={onSelectIdea}
                onAddRequest={() =>
                  setAddDialogStatus({ status: group.status, label: group.label })
                }
                onArchiveRequest={(id, title) => setArchiveTarget({ id, title })}
                categoryNameMap={categoryNameMap}
              />
            ))}

            {archivedGroup && (
              <ArchivedGroup
                label={archivedGroup.label}
                items={archivedGroup.items}
                open={archivedOpen}
                onOpenChange={setArchivedOpen}
                selectedIdeaId={selectedIdeaId}
                onSelectIdea={onSelectIdea}
                onRestore={onRestoreIdea}
                categoryNameMap={categoryNameMap}
              />
            )}
          </div>

          <DragOverlay>
            {activeDragRow && (
              <div className="flex items-start gap-2 rounded-md bg-accent px-2.5 py-2 text-accent-foreground shadow-lg">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {activeDragRow.row.title}
                  </p>
                </div>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </ScrollArea>

      {addDialogStatus && (
        <AddItemDialog
          open={addDialogStatus !== null}
          onOpenChange={(open) => {
            if (!open) setAddDialogStatus(null);
          }}
          title="アイデアを追加"
          description={`「${addDialogStatus.label}」にアイデアを追加します`}
          fieldLabel="タイトル"
          fieldId="idea-title"
          placeholder="例: 新しいアイデア"
          onAdd={(title) => onAddIdea(addDialogStatus.status, title)}
        />
      )}

      <DeleteConfirmDialog
        open={archiveTarget !== null}
        onOpenChange={(open) => {
          if (!open) setArchiveTarget(null);
        }}
        title="アーカイブしますか？"
        itemName={archiveTarget?.title ?? ""}
        description={`「${archiveTarget?.title ?? ""}」をアーカイブします。後で「アーカイブ済み」から復元できます。`}
        actionLabel="アーカイブ"
        onConfirm={() => {
          if (archiveTarget) {
            onArchiveIdea(archiveTarget.id);
            setArchiveTarget(null);
          }
        }}
      />
    </section>
  );
}

function StatusGroup({
  status,
  label,
  items,
  selectedIdeaId,
  onSelectIdea,
  onAddRequest,
  onArchiveRequest,
  categoryNameMap,
}: {
  status: StatusKey;
  label: string;
  items: IdeaRow[];
  selectedIdeaId: string;
  onSelectIdea: (id: string) => void;
  onAddRequest: () => void;
  onArchiveRequest: (id: string, title: string) => void;
  categoryNameMap: Record<string, string>;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `dropzone:${status}`,
    data: { containerId: status },
  });

  return (
    <div>
      <div className="sticky top-0 z-10 -mx-3 mb-2 flex items-center justify-between gap-2 bg-background px-5 py-1.5">
        <div className="flex min-w-0 items-center gap-1.5">
          <h3 className="truncate text-xs font-medium text-muted-foreground">
            {label}
          </h3>
          <Badge variant="secondary" size="xs">
            {items.length}
          </Badge>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={onAddRequest}
          aria-label={`${label} にアイデアを追加`}
          className="text-muted-foreground hover:text-foreground"
        >
          <Plus aria-hidden="true" />
        </Button>
      </div>
      <SortableContext
        id={status}
        items={items.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul
          ref={setNodeRef}
          data-status={status}
          className={cn(
            "flex flex-col gap-1",
            items.length === 0 &&
              "min-h-12 rounded-md border border-dashed border-border/70 p-2",
            items.length === 0 && isOver && "border-primary/60 bg-primary/5",
          )}
        >
          {items.length === 0 ? (
            <li
              className={cn(
                "pointer-events-none flex h-8 items-center justify-center text-xs",
                isOver ? "text-primary" : "text-muted-foreground",
              )}
              aria-hidden="true"
            >
              ここへドラッグ
            </li>
          ) : (
            items.map((idea) => (
              <SortableIdeaRow
                key={idea.id}
                idea={idea}
                status={status}
                selected={idea.id === selectedIdeaId}
                onSelect={onSelectIdea}
                categoryName={
                  idea.categoryId ? categoryNameMap[idea.categoryId] : undefined
                }
                actions={
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={() => onArchiveRequest(idea.id, idea.title)}
                  >
                    <Archive />
                    アーカイブ
                  </DropdownMenuItem>
                }
              />
            ))
          )}
        </ul>
      </SortableContext>
    </div>
  );
}

function ArchivedGroup({
  label,
  items,
  open,
  onOpenChange,
  selectedIdeaId,
  onSelectIdea,
  onRestore,
  categoryNameMap,
}: {
  label: string;
  items: IdeaRow[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIdeaId: string;
  onSelectIdea: (id: string) => void;
  onRestore: (id: string) => void;
  categoryNameMap: Record<string, string>;
}) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <CollapsibleTrigger
        nativeButton={false}
        render={
          <div
            className={cn(
              "group/archived-trigger sticky top-0 z-10 -mx-3 mb-2 flex cursor-pointer items-center justify-between gap-2 bg-background px-5 py-1.5",
              "rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
            )}
          />
        }
      >
        <div className="flex min-w-0 items-center gap-1.5">
          <h3 className="truncate text-xs font-medium text-muted-foreground">
            {label}
          </h3>
          <Badge variant="secondary" size="xs">
            {items.length}
          </Badge>
        </div>
        <ChevronDown
          aria-hidden="true"
          className="size-4 text-muted-foreground transition-[color,transform] group-hover/archived-trigger:text-foreground in-data-[panel-open]:rotate-180"
        />
        <span className="sr-only">{`${label}を開く`}</span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul className="flex flex-col gap-1" data-status="archived">
          {items.map((idea) => (
            <ArchivedRowItem
              key={idea.id}
              idea={idea}
              selected={idea.id === selectedIdeaId}
              onSelect={onSelectIdea}
              onRestore={onRestore}
              categoryName={
                idea.categoryId ? categoryNameMap[idea.categoryId] : undefined
              }
            />
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}

function ArchivedRowItem({
  idea,
  selected,
  onSelect,
  onRestore,
  categoryName,
}: {
  idea: IdeaRow;
  selected: boolean;
  onSelect: (id: string) => void;
  onRestore: (id: string) => void;
  categoryName?: string;
}) {
  return (
    <li className="group/idea relative">
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
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{idea.title}</p>
          {categoryName && (
            <p
              className={cn(
                "mt-0.5 text-xs",
                selected ? "text-accent-foreground/70" : "text-muted-foreground",
              )}
            >
              {categoryName}
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
                "transition-opacity text-muted-foreground hover:text-foreground",
              )}
              aria-label={`${idea.title} の操作`}
            >
              <MoreHorizontal />
            </Button>
          }
        />
        <DropdownMenuContent side="right" align="start">
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => onRestore(idea.id)}>
              <ArchiveRestore />
              復元
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}
