"use client";

import { format } from "date-fns";
import { IconAlertTriangle } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProject } from "@/lib/api/queries";
import type { ProjectStatus } from "@/lib/types";

const statusStyles: Record<ProjectStatus, { badge: string; dot: string }> = {
  Draft: {
    badge: "border-muted-foreground/30 bg-muted text-muted-foreground",
    dot: "bg-muted-foreground/70",
  },
  Active: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  Review: {
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  Approved: {
    badge: "border-sky-200 bg-sky-50 text-sky-700",
    dot: "bg-sky-500",
  },
  Locked: {
    badge: "border-slate-200 bg-slate-100 text-slate-600",
    dot: "bg-slate-500",
  },
};

const detailSkeletons = Array.from({ length: 4 });

export function ProjectHeader({ projectId }: { projectId: string }) {
  const { data, isLoading, error, refetch } = useProject(projectId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {detailSkeletons.map((_, index) => (
              <Skeleton key={`project-detail-${index}`} className="h-4 w-48" />
            ))}
          </div>
        </CardHeader>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="flex flex-col gap-3 py-6 text-sm">
          <div className="flex items-center gap-2 font-medium text-destructive">
            <IconAlertTriangle className="h-4 w-4" />
            Unable to load project header.
          </div>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const createdAt = new Date(data.created_at);
  const updatedAt = new Date(data.updated_at);

  return (
    <Card>
      <CardHeader className="gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-semibold">{data.project_name}</h2>
          <Badge variant="outline" className="rounded-full">
            {data.project_type}
          </Badge>
          <Badge
            variant="outline"
            className={`gap-2 rounded-full ${statusStyles[data.status].badge}`}
          >
            <span
              className={`h-2 w-2 rounded-full ${statusStyles[data.status].dot}`}
              aria-hidden="true"
            />
            {data.status}
          </Badge>
          {data.department ? (
            <Badge variant="outline" className="rounded-full">
              {data.department.name}
            </Badge>
          ) : null}
        </div>
        <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
          <div className="space-y-2">
            <div>
              <span className="font-medium text-foreground">Owner:</span>{" "}
              {data.owner?.name ?? "Unassigned"}
            </div>
            <div>
              <span className="font-medium text-foreground">
                Governance manager:
              </span>{" "}
              {data.governance_manager?.name ?? "Unassigned"}
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <span className="font-medium text-foreground">Created:</span>{" "}
              <time dateTime={data.created_at}>
                {format(createdAt, "PPp")}
              </time>
            </div>
            <div>
              <span className="font-medium text-foreground">Updated:</span>{" "}
              <time dateTime={data.updated_at}>
                {format(updatedAt, "PPp")}
              </time>
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
