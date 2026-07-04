"use client";

import { MoreHorizontal, Plus, Trash2 } from "lucide-react";

import { type Category } from "@/lib/schema";
import { DeleteConfirmDialog } from "@/components/workspace/DeleteConfirmDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Pane1Toggle } from "@/components/workspace/Pane1Toggle";
import { AddItemDialog } from "@/components/workspace/AddItemDialog";
import { useState } from "react";

type CategoryPaneProps = {
  workspaceName: string;
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
  onAddCategory: (name: string) => void;
  onDeleteCategory: (id: string) => void;
};

export function CategoryPane({
  workspaceName,
  categories,
  selectedCategoryId,
  onSelectCategory,
  onAddCategory,
  onDeleteCategory,
}: CategoryPaneProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  return (
    <>
      <Sidebar
        collapsible="icon"
        className="border-r border-sidebar-border [&_[data-slot=sidebar-container]]:bg-sidebar"
      >
        <SidebarHeader className="border-b border-sidebar-border p-0">
          <div className="flex h-12 items-center justify-between gap-2 px-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[state=expanded]:px-5">
            <h2 className="truncate text-sm font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
              {workspaceName}
            </h2>
            <Pane1Toggle />
          </div>
        </SidebarHeader>

        <SidebarContent className="px-1 py-3 group-data-[collapsible=icon]:hidden">
          <SidebarGroup className="px-1">
            <SidebarGroupLabel className="px-2 text-xs font-semibold tracking-wide text-sidebar-foreground/70 uppercase">
              カテゴリ
            </SidebarGroupLabel>
            <SidebarGroupAction
              title="カテゴリを追加"
              onClick={() => setAddDialogOpen(true)}
              className="w-6 rounded-[min(var(--radius-md),10px)] text-muted-foreground hover:bg-muted hover:text-foreground [&>svg]:size-3"
            >
              <Plus />
              <span className="sr-only">カテゴリを追加</span>
            </SidebarGroupAction>
            <SidebarGroupContent>
              <SidebarMenu>
                {/* 「全て」選択肢 */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip="全て"
                    isActive={selectedCategoryId === null}
                    aria-current={selectedCategoryId === null ? "page" : undefined}
                    onClick={() => onSelectCategory(null)}
                  >
                    <span className="truncate">全て</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {categories.map((cat) => {
                  const active = cat.id === selectedCategoryId;
                  return (
                    <SidebarMenuItem key={cat.id}>
                      <SidebarMenuButton
                        tooltip={cat.name}
                        isActive={active}
                        aria-current={active ? "page" : undefined}
                        onClick={() => onSelectCategory(cat.id)}
                      >
                        <span className="truncate">{cat.name}</span>
                      </SidebarMenuButton>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <SidebarMenuAction showOnHover>
                              <MoreHorizontal />
                              <span className="sr-only">操作</span>
                            </SidebarMenuAction>
                          }
                        />
                        <DropdownMenuContent side="right" align="start">
                          <DropdownMenuGroup>
                            <DropdownMenuItem
                              variant="destructive"
                              onSelect={() =>
                                setDeleteTarget({ id: cat.id, name: cat.name })
                              }
                            >
                              <Trash2 />
                              削除
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <AddItemDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        title="カテゴリを追加"
        description="新しいカテゴリを追加します"
        fieldLabel="カテゴリ名"
        fieldId="category-name"
        placeholder="例: 旅行"
        onAdd={onAddCategory}
      />

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="カテゴリを削除しますか？"
        itemName={deleteTarget?.name ?? ""}
        onConfirm={() => {
          if (deleteTarget) {
            onDeleteCategory(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
      />
    </>
  );
}
