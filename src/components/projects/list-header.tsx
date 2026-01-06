"use client";

import { IconX } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";

type ProjectListHeaderProps = {
  totalCount?: number;
  filteredCount: number;
  hasFilters: boolean;
  onClearFilters: () => void;
};

export function ProjectListHeader({
  totalCount,
  filteredCount,
  hasFilters,
  onClearFilters,
}: ProjectListHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold leading-none">Projects</h1>
        <div className="text-sm text-muted-foreground">
          {typeof totalCount === "number" ? (
            <>
              <span className="font-medium text-foreground">
                {filteredCount}
              </span>
              {totalCount !== filteredCount ? <> of {totalCount}</> : null} projects
            </>
          ) : (
            "Projects"
          )}
        </div>
      </div>

      {hasFilters ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="gap-2"
        >
          <IconX className="h-4 w-4" />
          Clear
        </Button>
      ) : null}
    </div>
  );
}
