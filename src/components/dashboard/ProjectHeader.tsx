"use client";

import { format } from "date-fns";
import { IconAlertTriangle } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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


export function ProjectHeader({ projectId }: { projectId: string }) {
  const { data, isLoading, error, refetch } = useProject(projectId);
  const containerClassName = "flex flex-col gap-4";

  if (isLoading) {
    return (
      <section className={containerClassName} aria-label="Project header">
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
        <div className="flex items-start justify-between gap-6">
          <div className="flex flex-wrap items-start gap-6">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={`project-owner-${index}`} className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-40" />
              </div>
            ))}
          </div>
          <div className="flex flex-col items-end gap-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </section>
    );
  }

  if (error || !data) {
    return (
      <section className={containerClassName} aria-label="Project header">
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <div className="flex items-center gap-2 font-medium text-destructive">
            <IconAlertTriangle className="h-4 w-4" />
            Unable to load project header.
          </div>
          <p className="mt-1 text-muted-foreground">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => refetch()}
          >
            Retry
          </Button>
        </div>
      </section>
    );
  }

  const createdAt = new Date(data.created_at);
  const updatedAt = new Date(data.updated_at);

  return (
    <section className={containerClassName} aria-label="Project header">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-3xl font-semibold tracking-tight">
          {data.project_name}
        </h2>
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
        <Badge variant="outline" className="rounded-full">
          {data.project_type}
        </Badge>
        {data.department ? (
          <Badge variant="outline" className="rounded-full">
            {data.department.name}
          </Badge>
        ) : null}
      </div>
      <div className="flex flex-wrap items-start justify-between gap-6 mt-4">
        <dl className="flex flex-wrap items-start gap-6 text-sm">
          <div className="space-y-1">
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Owner
            </dt>
            <dd className="flex flex-wrap items-center gap-2 text-sm font-medium text-foreground">
              <span>{data.owner?.name ?? "Unassigned"}</span>
              {data.owner?.title ? (
                <Badge variant="secondary" className="rounded-full text-xs">
                  {data.owner.title}
                </Badge>
              ) : null}
            </dd>
          </div>
          {data.governance_manager?.name ? (
            <div className="space-y-1">
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Governance manager
              </dt>
              <dd className="flex flex-wrap items-center gap-2 text-sm font-medium text-foreground">
                <span>{data.governance_manager.name}</span>
                {data.governance_manager.title ? (
                  <Badge variant="secondary" className="rounded-full text-xs">
                    {data.governance_manager.title}
                  </Badge>
                ) : null}
              </dd>
            </div>
          ) : null}
        </dl>
        <dl className="flex flex-wrap items-start gap-6 text-right text-sm">
          <div className="space-y-1">
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Created
            </dt>
            <dd className="text-sm font-medium text-foreground">
              <time dateTime={data.created_at}>{format(createdAt, "PP")}</time>
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Updated
            </dt>
            <dd className="text-sm font-medium text-foreground">
              <time dateTime={data.updated_at}>{format(updatedAt, "PP")}</time>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
