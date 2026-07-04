"use client";

/**
 * Workspace: 4 ペインの親コンポーネント（アイデア管理ドメイン）。
 *
 * - Pane 1: CategoryPane — カテゴリ一覧フィルター
 * - Pane 2: IdeaListPane — アイデア一覧（ステータス別グループ）
 * - Pane 3: IdeaDashboardPane — アイデア詳細編集
 * - Pane 4: SubTaskPane — サブタスク管理
 *
 * レイアウト構造:
 * <SidebarProvider> (h-screen)
 * ┌─ Sidebar (Pane 1) ─┬─ SidebarInset ─────────────────────┐
 * │ collapsible="icon"  │ ┌─ GlobalHeader (h-12) ─────────┐ │
 * │ 240px ↔ 48px        │ └─────────────────────────────────┘ │
 * │                     │ ┌─ Pane 2 ─┬─ Pane 3 ─┬─ Pane 4 ─┐ │
 * └────────────────────┴─┴──────────┴──────────┴──────────┘
 */

import { useState, useCallback, useMemo } from "react";

import {
  type Category,
  type IdeaItem,
  type StatusKey,
  type SelectedDetail,
  type IdeaRow,
  type Group,
  STATUS_ORDER,
} from "@/lib/schema";
import { createMinimalIdeaItem, createMinimalSubTask } from "@/lib/data/factories";
import { ARCHIVED_GROUP_LABEL, STATUS_LABELS } from "@/lib/labels";
import {
  addCategoryAction,
  deleteCategoryAction,
  addIdeaAction,
  updateIdeaFieldAction,
  updateIdeaStatusAction,
  archiveIdeaAction,
  restoreIdeaAction,
  addSubTaskAction,
  toggleSubTaskAction,
  deleteSubTaskAction,
} from "@/app/actions";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { GlobalHeader } from "@/components/workspace/GlobalHeader";
import { CategoryPane } from "@/components/workspace/CategoryPane";
import { IdeaListPane } from "@/components/workspace/IdeaListPane";
import { IdeaDashboardPane } from "@/components/workspace/IdeaDashboardPane";
import { SubTaskPane } from "@/components/workspace/SubTaskPane";

type EditableIdeaField = "title" | "memo" | "categoryId" | "dueDate";

type WorkspaceProps = {
  initialCategories: Category[];
  initialIdeas: IdeaItem[];
  workspace: { name: string; icon: string };
};

export function Workspace({
  initialCategories,
  initialIdeas,
  workspace,
}: WorkspaceProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [ideas, setIdeas] = useState<IdeaItem[]>(initialIdeas);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string>(
    initialIdeas.find((i) => !i.archived)?.id ?? "",
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<SelectedDetail>(null);
  const [pane4ManuallyClosed, setPane4ManuallyClosed] = useState(false);

  const pane4Open = selectedDetail !== null && !pane4ManuallyClosed;

  const activeIdea = ideas.find((i) => i.id === selectedIdeaId) ?? null;

  // ===== カテゴリ操作 =====

  const addCategory = useCallback((name: string) => {
    const id = `cat-${Date.now()}`;
    setCategories((prev) => [...prev, { id, name }]);
    addCategoryAction(id, name);
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setSelectedCategoryId((prev) => (prev === id ? null : prev));
    deleteCategoryAction(id);
  }, []);

  // ===== アイデア操作 =====

  const selectIdea = useCallback((id: string) => {
    setSelectedIdeaId(id);
    setSelectedDetail(null);
    setPane4ManuallyClosed(false);
  }, []);

  const addIdea = useCallback((status: StatusKey, title: string) => {
    const newIdea = createMinimalIdeaItem(title, status);
    if (selectedCategoryId) {
      newIdea.categoryId = selectedCategoryId;
    }
    setIdeas((prev) => [...prev, newIdea]);
    setSelectedIdeaId(newIdea.id);
    setSelectedDetail(null);
    setPane4ManuallyClosed(false);
    addIdeaAction(newIdea.id, title, status, newIdea.categoryId);
  }, [selectedCategoryId]);

  const archiveIdea = useCallback((id: string) => {
    setIdeas((prev) => {
      const next = prev.map((i) => (i.id === id ? { ...i, archived: true } : i));
      setSelectedIdeaId((prevId) => {
        if (prevId !== id) return prevId;
        const fallback = next.find((i) => !i.archived);
        return fallback ? fallback.id : "";
      });
      return next;
    });
    setSelectedDetail(null);
    setPane4ManuallyClosed(false);
    archiveIdeaAction(id);
  }, []);

  const restoreIdea = useCallback((id: string) => {
    setIdeas((prev) =>
      prev.map((i) => (i.id === id ? { ...i, archived: false } : i)),
    );
    restoreIdeaAction(id);
  }, []);

  const moveIdea = useCallback(
    (id: string, toStatus: StatusKey, toIndex: number) => {
      updateIdeaStatusAction(id, toStatus);
      setIdeas((prev) => {
        const subjectIndex = prev.findIndex((i) => i.id === id);
        if (subjectIndex < 0) return prev;
        const subject = prev[subjectIndex];
        if (subject.archived) return prev;

        const without = prev.filter((_, i) => i !== subjectIndex);
        const updated: IdeaItem = { ...subject, status: toStatus };

        let count = 0;
        let absInsertAt = without.length;
        for (let i = 0; i < without.length; i++) {
          const item = without[i];
          if (!item.archived && item.status === toStatus) {
            if (count === toIndex) {
              absInsertAt = i;
              break;
            }
            count++;
          }
        }
        return [
          ...without.slice(0, absInsertAt),
          updated,
          ...without.slice(absInsertAt),
        ];
      });
    },
    [],
  );

  const updateIdeaField = useCallback(
    (id: string, field: EditableIdeaField, value: string) => {
      setIdeas((prev) =>
        prev.map((i) => {
          if (i.id !== id) return i;
          if (field === "categoryId") {
            return { ...i, categoryId: value === "" ? null : value };
          }
          return { ...i, [field]: value };
        }),
      );
      updateIdeaFieldAction(id, field, value);
    },
    [],
  );

  // ===== サブタスク操作 =====

  const addSubTask = useCallback((ideaId: string, title: string) => {
    const newSub = createMinimalSubTask(title);
    setIdeas((prev) =>
      prev.map((i) =>
        i.id !== ideaId ? i : { ...i, subTasks: [...i.subTasks, newSub] },
      ),
    );
    addSubTaskAction(newSub.id, ideaId, title);
  }, []);

  const toggleSubTask = useCallback((ideaId: string, subTaskId: string) => {
    let nextDone = false;
    setIdeas((prev) =>
      prev.map((i) => {
        if (i.id !== ideaId) return i;
        return {
          ...i,
          subTasks: i.subTasks.map((s) => {
            if (s.id !== subTaskId) return s;
            nextDone = !s.done;
            return { ...s, done: nextDone };
          }),
        };
      }),
    );
    toggleSubTaskAction(subTaskId, nextDone);
  }, []);

  const deleteSubTask = useCallback((ideaId: string, subTaskId: string) => {
    setIdeas((prev) =>
      prev.map((i) =>
        i.id !== ideaId
          ? i
          : { ...i, subTasks: i.subTasks.filter((s) => s.id !== subTaskId) },
      ),
    );
    deleteSubTaskAction(subTaskId);
  }, []);

  // ===== Pane 4 操作 =====

  const openDetail = useCallback((next: SelectedDetail) => {
    setSelectedDetail(next);
    setPane4ManuallyClosed(false);
  }, []);

  const togglePane4 = useCallback(() => setPane4ManuallyClosed((v) => !v), []);

  // ===== 派生計算 =====

  /** カテゴリ ID → 名前 のマップ（Pane 2 行表示用）*/
  const categoryNameMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.name])),
    [categories],
  );

  /** 現在選択中のカテゴリ名（GlobalHeader 用）*/
  const selectedCategoryName = useMemo(
    () => categories.find((c) => c.id === selectedCategoryId)?.name ?? null,
    [categories, selectedCategoryId],
  );

  /** Pane 2 のグループ派生計算。カテゴリフィルター適用済み。 */
  const ideaGroups: Group[] = useMemo(() => {
    const filteredIdeas = selectedCategoryId
      ? ideas.filter((i) => i.archived || i.categoryId === selectedCategoryId)
      : ideas;

    const statusGroups: Group[] = STATUS_ORDER.map((status) => ({
      kind: "status" as const,
      status,
      label: STATUS_LABELS[status],
      items: filteredIdeas
        .filter((i) => !i.archived && i.status === status)
        .map((i): IdeaRow => ({
          id: i.id,
          title: i.title,
          categoryId: i.categoryId,
          dueDate: i.dueDate,
          subTaskCount: i.subTasks.length,
          subTaskDoneCount: i.subTasks.filter((s) => s.done).length,
        })),
    }));

    const archivedItems = filteredIdeas
      .filter((i) => i.archived)
      .map((i): IdeaRow => ({
        id: i.id,
        title: i.title,
        categoryId: i.categoryId,
        dueDate: i.dueDate,
        subTaskCount: i.subTasks.length,
        subTaskDoneCount: i.subTasks.filter((s) => s.done).length,
      }));

    if (archivedItems.length === 0) return statusGroups;
    return [
      ...statusGroups,
      { kind: "archived" as const, label: ARCHIVED_GROUP_LABEL, items: archivedItems },
    ];
  }, [ideas, selectedCategoryId]);

  return (
    <SidebarProvider
      defaultOpen
      className="h-screen w-full overflow-hidden bg-background text-foreground"
    >
      <CategoryPane
        workspaceName={workspace.name}
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
        onAddCategory={addCategory}
        onDeleteCategory={deleteCategory}
      />
      <SidebarInset className="flex min-w-0 flex-col bg-background">
        <GlobalHeader
          categoryName={selectedCategoryName}
          ideaTitle={activeIdea?.title ?? ""}
          categories={categories}
          onAddCategory={addCategory}
          onDeleteCategory={deleteCategory}
        />
        <div className="flex min-h-0 flex-1">
          <IdeaListPane
            groups={ideaGroups}
            selectedIdeaId={selectedIdeaId}
            onSelectIdea={selectIdea}
            onAddIdea={addIdea}
            onArchiveIdea={archiveIdea}
            onRestoreIdea={restoreIdea}
            onMoveIdea={moveIdea}
            categoryNameMap={categoryNameMap}
          />
          {activeIdea ? (
            <IdeaDashboardPane
              idea={activeIdea}
              categories={categories}
              selectedDetail={selectedDetail}
              onOpenDetail={openDetail}
              onUpdateIdeaField={updateIdeaField}
              ideaKey={activeIdea.id}
            />
          ) : (
            <section className="flex min-w-0 flex-1 items-center justify-center bg-canvas">
              <p className="text-sm text-muted-foreground">
                アイデアを選択してください
              </p>
            </section>
          )}
          <SubTaskPane
            idea={activeIdea}
            selectedDetail={selectedDetail}
            pane4Open={pane4Open}
            onTogglePane4={togglePane4}
            onAddSubTask={addSubTask}
            onToggleSubTask={toggleSubTask}
            onDeleteSubTask={deleteSubTask}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
