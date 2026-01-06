"use client";

import { IconX } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";

type ProjectListHeaderProps = {
  hasFilters: boolean;
  onClearFilters: () => void;
};

export function ProjectListHeader({
  hasFilters,
  onClearFilters,
}: ProjectListHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <h1 className="text-xl font-semibold leading-none">Projects</h1>

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
