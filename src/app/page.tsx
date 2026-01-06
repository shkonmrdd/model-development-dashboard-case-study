"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import {
  IconChartBar,
  IconFolder,
  IconListDetails,
  IconLock,
} from "@tabler/icons-react";

import { DashboardShell } from "@/components/dashboard-shell";
import { SectionCards } from "@/components/section-cards";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjects } from "@/lib/api/queries";
import type { ProjectStatus, ProjectType } from "@/lib/types";

const listSkeletonRows = Array.from({ length: 6 });

const statusOptions: ProjectStatus[] = [
  "Draft",
  "Active",
  "Review",
  "Approved",
  "Locked",
];

const typeOptions: ProjectType[] = ["ML", "TimeSeries", "Scorecard", "AI"];

type SortOption = "updated_desc" | "updated_asc" | "name_asc";

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

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data, isLoading, error, refetch } = useProjects();

  const query = searchParams.get("q") ?? "";
  const statusFilter = searchParams.get("status") ?? "all";
  const typeFilter = searchParams.get("type") ?? "all";
  const sortFilter = (searchParams.get("sort") ??
    "updated_desc") as SortOption;

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams);
      const trimmed = value.trim();

      if (!trimmed || trimmed === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }

      const queryString = params.toString();
      router.replace(queryString ? `/?${queryString}` : "/", {
        scroll: false,
      });
    },
    [router, searchParams]
  );

  const statusTotals = useMemo(() => {
    const totals: Record<ProjectStatus, number> = {
      Draft: 0,
      Active: 0,
      Review: 0,
      Approved: 0,
      Locked: 0,
    };

    data?.forEach((project) => {
      totals[project.status] += 1;
    });

    return totals;
  }, [data]);

  const summaryCards = useMemo(() => {
    if (!data) return [];

    return [
      {
        title: "Total projects",
        value: data.length,
        helper: `${statusTotals.Active} active · ${statusTotals.Review} in review`,
        tone: "slate",
        badge: {
          label: "Portfolio",
          icon: IconFolder,
          className: "border-muted-foreground/30 bg-muted text-muted-foreground",
        },
      },
      {
        title: "Active projects",
        value: statusTotals.Active,
        helper: "Training or feature development in progress",
        tone: "emerald",
        badge: {
          label: "Active",
          icon: IconChartBar,
          className: "border-emerald-200 bg-emerald-50 text-emerald-700",
        },
      },
      {
        title: "Governance review",
        value: statusTotals.Review,
        helper: `${statusTotals.Approved} approved this cycle`,
        tone: "amber",
        badge: {
          label: "Review",
          icon: IconListDetails,
          className: "border-amber-200 bg-amber-50 text-amber-700",
        },
      },
      {
        title: "Locked models",
        value: statusTotals.Locked,
        helper: `${statusTotals.Approved} approved · ${statusTotals.Draft} drafts`,
        tone: "slate",
        badge: {
          label: "Locked",
          icon: IconLock,
          className: "border-slate-200 bg-slate-100 text-slate-600",
        },
      },
    ];
  }, [data, statusTotals]);

  const filteredProjects = useMemo(() => {
    if (!data) return [];

    const normalizedQuery = query.trim().toLowerCase();
    let items = [...data];

    if (normalizedQuery) {
      items = items.filter((project) => {
        const ownerName = project.owner?.name ?? "";
        return (
          project.project_name.toLowerCase().includes(normalizedQuery) ||
          ownerName.toLowerCase().includes(normalizedQuery)
        );
      });
    }

    if (statusFilter !== "all") {
      items = items.filter((project) => project.status === statusFilter);
    }

    if (typeFilter !== "all") {
      items = items.filter((project) => project.project_type === typeFilter);
    }

    items.sort((a, b) => {
      if (sortFilter === "name_asc") {
        return a.project_name.localeCompare(b.project_name);
      }

      const aUpdated = new Date(a.updated_at).getTime();
      const bUpdated = new Date(b.updated_at).getTime();
      if (sortFilter === "updated_asc") {
        return aUpdated - bUpdated;
      }
      return bUpdated - aUpdated;
    });

    return items;
  }, [data, query, statusFilter, typeFilter, sortFilter]);

  const hasFilters =
    query.trim().length > 0 || statusFilter !== "all" || typeFilter !== "all";

  return (
    <DashboardShell breadcrumbs={[{ label: "Projects" }]}>
      <div className="px-4 lg:px-6">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          <section className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold">Projects</h1>
            <p className="text-sm text-muted-foreground">
              Select a project to view its development and governance status.
            </p>
          </section>

          <SectionCards cards={summaryCards} isLoading={isLoading} />

          <section className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-[160px]">
                <label
                  htmlFor="status-filter"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Status
                </label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(event) => updateParam("status", event.target.value)}
                  className="mt-1 h-9 w-full rounded-md border bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="all">All statuses</option>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="min-w-[160px]">
                <label
                  htmlFor="type-filter"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Type
                </label>
                <select
                  id="type-filter"
                  value={typeFilter}
                  onChange={(event) => updateParam("type", event.target.value)}
                  className="mt-1 h-9 w-full rounded-md border bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="all">All types</option>
                  {typeOptions.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="min-w-[180px]">
                <label
                  htmlFor="sort-filter"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Sort
                </label>
                <select
                  id="sort-filter"
                  value={sortFilter}
                  onChange={(event) => updateParam("sort", event.target.value)}
                  className="mt-1 h-9 w-full rounded-md border bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="updated_desc">Updated (newest)</option>
                  <option value="updated_asc">Updated (oldest)</option>
                  <option value="name_asc">Name (A-Z)</option>
                </select>
              </div>
            </div>

            <div className="w-full max-w-sm">
              <label htmlFor="project-search" className="sr-only">
                Search projects
              </label>
              <input
                id="project-search"
                type="search"
                value={query}
                onChange={(event) => updateParam("q", event.target.value)}
                placeholder="Search by project or owner"
                className="h-9 w-full rounded-md border bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </section>

          {isLoading && (
            <div className="overflow-hidden rounded-lg border bg-background">
              <div className="border-b px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Projects
              </div>
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Project</th>
                    <th className="px-4 py-3 text-left font-medium">Type</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Owner</th>
                    <th className="px-4 py-3 text-left font-medium">
                      Last Updated
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {listSkeletonRows.map((_, index) => (
                    <tr key={`project-skeleton-${index}`}>
                      <td className="px-4 py-3">
                        <Skeleton className="h-4 w-48" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-4 w-16" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-4 w-20" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-4 w-24" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-4 w-24" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
            >
              <p className="font-medium">Unable to load projects.</p>
              <p className="text-muted-foreground">
                {error instanceof Error ? error.message : "Unknown error"}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-3 inline-flex items-center justify-center rounded-md border border-destructive/50 px-3 py-1 text-xs font-medium text-destructive transition hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Retry
              </button>
            </div>
          )}

          {data && data.length === 0 && !isLoading && (
            <div className="rounded-lg border bg-background p-6 text-sm text-muted-foreground">
              No projects found.
            </div>
          )}

          {data && data.length > 0 && filteredProjects.length === 0 && (
            <div className="rounded-lg border bg-background p-6 text-sm text-muted-foreground">
              {hasFilters
                ? "No projects match filters."
                : "No projects found."}
            </div>
          )}

          {data && filteredProjects.length > 0 && (
            <div className="overflow-hidden rounded-lg border bg-background">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Project</th>
                    <th className="px-4 py-3 text-left font-medium">Type</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Owner</th>
                    <th className="px-4 py-3 text-left font-medium">
                      Last Updated
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((project) => {
                    const updatedDate = new Date(project.updated_at);
                    const relativeUpdated = formatDistanceToNow(updatedDate, {
                      addSuffix: true,
                    });

                    return (
                      <tr
                        key={project.project_id}
                        role="link"
                        tabIndex={0}
                        onClick={() =>
                          router.push(
                            `/projects/${project.project_id}/overview`
                          )
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            router.push(
                              `/projects/${project.project_id}/overview`
                            );
                          }
                        }}
                        className="cursor-pointer border-b transition hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring last:border-b-0"
                        aria-label={`Open ${project.project_name}`}
                      >
                        <td className="px-4 py-4 font-medium">
                          {project.project_name}
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant="outline" className="rounded-full">
                            {project.project_type}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          <Badge
                            variant="outline"
                            className={`gap-2 rounded-full ${
                              statusStyles[project.status].badge
                            }`}
                          >
                            <span
                              className={`h-2 w-2 rounded-full ${
                                statusStyles[project.status].dot
                              }`}
                              aria-hidden="true"
                            />
                            {project.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-muted-foreground">
                          {project.owner?.name ?? "Unknown owner"}
                        </td>
                        <td className="px-4 py-4 text-muted-foreground">
                          <time
                            dateTime={project.updated_at}
                            title={format(updatedDate, "PPpp")}
                          >
                            {relativeUpdated}
                          </time>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
