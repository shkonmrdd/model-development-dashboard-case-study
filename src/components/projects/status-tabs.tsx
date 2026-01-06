"use client";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { statusOptions, statusStyles } from "@/components/projects/constants";
import type { ProjectStatus } from "@/lib/types";

export type ProjectStatusTabsValue = "all" | ProjectStatus;

type ProjectStatusTabsProps = {
  value: ProjectStatusTabsValue;
  totalCount?: number;
  statusTotals: Record<ProjectStatus, number>;
  onValueChange: (value: string) => void;
};

export function ProjectStatusTabs({
  value,
  totalCount,
  statusTotals,
  onValueChange,
}: ProjectStatusTabsProps) {
  return (
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
  );
}
