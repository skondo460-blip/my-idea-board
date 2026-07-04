"use client";

import { Settings } from "lucide-react";

import { type Category } from "@/lib/schema";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SettingsDialogContent } from "@/components/workspace/SettingsDialog";

type GlobalHeaderProps = {
  categoryName: string | null;
  ideaTitle: string;
  categories: Category[];
  onAddCategory: (name: string) => void;
  onDeleteCategory: (id: string) => void;
};

export function GlobalHeader({
  categoryName,
  ideaTitle,
  categories,
  onAddCategory,
  onDeleteCategory,
}: GlobalHeaderProps) {
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border bg-background px-3">
      <Breadcrumb
        className="min-w-0 flex-1 overflow-hidden"
        aria-label="パンくず"
      >
        <BreadcrumbList className="flex-nowrap text-[11px]">
          {categoryName && (
            <>
              <BreadcrumbItem className="shrink-0">
                <span className="text-muted-foreground">{categoryName}</span>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          )}
          <BreadcrumbItem className="min-w-0">
            <BreadcrumbPage className="truncate font-medium">
              {ideaTitle || "アイデアを選択"}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Dialog>
        <Tooltip>
          <TooltipTrigger
            render={
              <DialogTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="shrink-0 text-muted-foreground hover:text-foreground"
                    aria-label="ワークスペース設定"
                  >
                    <Settings />
                  </Button>
                }
              />
            }
          />
          <TooltipContent side="bottom">ワークスペース設定</TooltipContent>
        </Tooltip>
        <SettingsDialogContent
          categories={categories}
          onAddCategory={onAddCategory}
          onDeleteCategory={onDeleteCategory}
        />
      </Dialog>
    </header>
  );
}
