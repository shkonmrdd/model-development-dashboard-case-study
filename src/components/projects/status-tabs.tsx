"use client";

import { IconX } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { statusOptions, statusStyles } from "@/components/projects/constants";
import type { ProjectStatus } from "@/lib/types";

export type ProjectStatusTabsValue = "all" | ProjectStatus;

type ProjectStatusTabsProps = {
  value: ProjectStatusTabsValue;
  totalCount?: number;
  statusTotals: Record<ProjectStatus, number>;
  hasFilters: boolean;
  onValueChange: (value: string) => void;
  onClearFilters: () => void;
};

export function ProjectStatusTabs({
  value,
  totalCount,
  statusTotals,
  hasFilters,
  onValueChange,
  onClearFilters,
}: ProjectStatusTabsProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="overflow-x-auto">
        <Tabs value={value} onValueChange={onValueChange} className="min-w-max">
          <TabsList className="h-9">
            <TabsTrigger value="all" className="gap-2">
              All
              <Badge variant="secondary" className="rounded-full px-2">
                {totalCount ?? 0}
              </Badge>
            </TabsTrigger>

            {statusOptions.map((status) => (
              <TabsTrigger key={status} value={status} className="gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${statusStyles[status].dot}`}
                  aria-hidden="true"
                />
                {status}
                <Badge variant="secondary" className="rounded-full px-2">
                  {statusTotals[status] ?? 0}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {hasFilters ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="h-9 gap-2 self-start sm:self-auto"
        >
          <IconX className="h-4 w-4" />
          Clear filters
        </Button>
      ) : null}
    </div>
  );
}
