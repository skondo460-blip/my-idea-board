"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { type Category } from "@/lib/schema";
import { DeleteConfirmDialog } from "@/components/workspace/DeleteConfirmDialog";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";
import { ScrollArea } from "@/components/ui/scroll-area";

type SettingsDialogContentProps = {
  categories: Category[];
  onAddCategory: (name: string) => void;
  onDeleteCategory: (id: string) => void;
};

export function SettingsDialogContent({
  categories,
  onAddCategory,
  onDeleteCategory,
}: SettingsDialogContentProps) {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleAdd = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    onAddCategory(trimmed);
    setNewCategoryName("");
  };

  return (
    <>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>ワークスペース設定</DialogTitle>
          <DialogDescription>カテゴリを管理します</DialogDescription>
        </DialogHeader>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="settings-new-category">カテゴリ</FieldLabel>
            <ScrollArea className="max-h-48">
              <div className="divide-y divide-border rounded-lg border border-border">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between px-3 py-2"
                  >
                    <span className="text-sm">{cat.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() =>
                        setDeleteTarget({ id: cat.id, name: cat.name })
                      }
                      aria-label={`${cat.name} を削除`}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                ))}
                {categories.length === 0 && (
                  <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                    カテゴリがありません
                  </div>
                )}
              </div>
            </ScrollArea>
            <InputGroup>
              <InputGroupInput
                id="settings-new-category"
                placeholder="新しいカテゴリ名"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAdd();
                }}
              />
              <InputGroupAddon align="inline-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAdd}
                  disabled={!newCategoryName.trim()}
                >
                  <Plus data-icon="inline-start" />
                  追加
                </Button>
              </InputGroupAddon>
            </InputGroup>
          </Field>
        </FieldGroup>

        <DialogFooter>
          <DialogClose render={<Button variant="outline">閉じる</Button>} />
        </DialogFooter>
      </DialogContent>

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
