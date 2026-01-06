"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import { IconChevronRight, IconSearch, IconX } from "@tabler/icons-react";

import { DashboardShell } from "@/components/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

function isProjectStatus(value: string): value is ProjectStatus {
  return (statusOptions as string[]).includes(value);
}

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data, isLoading, error, refetch } = useProjects();

  const query = searchParams.get("q") ?? "";
  const statusFilterRaw = searchParams.get("status") ?? "all";
  const statusFilter: "all" | ProjectStatus =
    statusFilterRaw === "all"
      ? "all"
      : isProjectStatus(statusFilterRaw)
        ? statusFilterRaw
        : "all";

  const typeFilter = searchParams.get("type") ?? "all";
  const sortFilter = (searchParams.get("sort") ?? "updated_desc") as SortOption;

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
      router.replace(queryString ? `/?${queryString}` : "/", { scroll: false });
    },
    [router, searchParams]
  );

  const clearFilters = useCallback(() => {
    router.replace("/", { scroll: false });
  }, [router]);

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

  const filteredProjects = useMemo(() => {
    if (!data) return [];

    const normalizedQuery = query.trim().toLowerCase();
    let items = [...data];

    if (normalizedQuery) {
      items = items.filter((project) => {
        const ownerName = project.owner?.name ?? "";
        const gmName = project.governance_manager?.name ?? "";
        const dept = project.department?.name ?? "";
        return (
          project.project_name.toLowerCase().includes(normalizedQuery) ||
          ownerName.toLowerCase().includes(normalizedQuery) ||
          gmName.toLowerCase().includes(normalizedQuery) ||
          dept.toLowerCase().includes(normalizedQuery)
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
      if (sortFilter === "name_asc") return a.project_name.localeCompare(b.project_name);

      const aUpdated = new Date(a.updated_at).getTime();
      const bUpdated = new Date(b.updated_at).getTime();
      if (sortFilter === "updated_asc") return aUpdated - bUpdated;
      return bUpdated - aUpdated;
    });

    return items;
  }, [data, query, statusFilter, typeFilter, sortFilter]);

  const hasFilters =
    query.trim().length > 0 || statusFilter !== "all" || typeFilter !== "all";

  return (
    <DashboardShell breadcrumbs={[{ label: "Projects" }]}>
      <div className="px-4 lg:px-6">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
          {/* Header (compact) */}
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-semibold leading-none">Projects</h1>
              <div className="text-sm text-muted-foreground">
                {data ? (
                  <>
                    <span className="font-medium text-foreground">{filteredProjects.length}</span>
                    {data.length !== filteredProjects.length ? (
                      <> of {data.length}</>
                    ) : null}{" "}
                    projects
                  </>
                ) : (
                  "Projects"
                )}
              </div>
            </div>

            {hasFilters ? (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
                <IconX className="h-4 w-4" />
                Clear
              </Button>
            ) : null}
          </div>

          {/* Status tabs w/ counts (replaces big cards) */}
          <div className="overflow-x-auto">
            <Tabs
              value={statusFilter}
              onValueChange={(v) => updateParam("status", v)}
              className="min-w-max"
            >
              <TabsList className="h-9">
                <TabsTrigger value="all" className="gap-2">
                  All
                  <Badge variant="secondary" className="rounded-full px-2">
                    {data?.length ?? 0}
                  </Badge>
                </TabsTrigger>

                {statusOptions.map((s) => (
                  <TabsTrigger key={s} value={s} className="gap-2">
                    <span className={`h-2 w-2 rounded-full ${statusStyles[s].dot}`} aria-hidden="true" />
                    {s}
                    <Badge variant="secondary" className="rounded-full px-2">
                      {statusTotals[s] ?? 0}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Toolbar (tight) */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={typeFilter}
                onValueChange={(v) => updateParam("type", v)}
              >
                <SelectTrigger className="h-9 w-[180px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent align="start">
                  <SelectItem value="all">All types</SelectItem>
                  {typeOptions.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={sortFilter}
                onValueChange={(v) => updateParam("sort", v)}
              >
                <SelectTrigger className="h-9 w-[190px]">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent align="start">
                  <SelectItem value="updated_desc">Updated (newest)</SelectItem>
                  <SelectItem value="updated_asc">Updated (oldest)</SelectItem>
                  <SelectItem value="name_asc">Name (A–Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="relative w-full md:max-w-sm">
              <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => updateParam("q", e.target.value)}
                placeholder="Search project, owner, dept…"
                className="h-9 pl-9"
              />
            </div>
          </div>

          {/* States */}
          {isLoading ? (
            <div className="overflow-hidden rounded-lg border bg-background">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="w-[44%]">Project</TableHead>
                    <TableHead className="hidden md:table-cell">People</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listSkeletonRows.map((_, idx) => (
                    <TableRow key={`sk-${idx}`}>
                      <TableCell>
                        <Skeleton className="h-4 w-64" />
                        <Skeleton className="mt-2 h-3 w-40" />
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="mt-2 h-3 w-56" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-24 rounded-full" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="ml-auto h-4 w-24" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : null}

          {error ? (
            <div
              role="alert"
              className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
            >
              <p className="font-medium">Unable to load projects.</p>
              <p className="text-muted-foreground">
                {error instanceof Error ? error.message : "Unknown error"}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="mt-3 border-destructive/50 text-destructive hover:bg-destructive/10"
              >
                Retry
              </Button>
            </div>
          ) : null}

          {data && data.length === 0 && !isLoading ? (
            <div className="rounded-lg border bg-background p-6 text-sm text-muted-foreground">
              No projects found.
            </div>
          ) : null}

          {data && data.length > 0 && filteredProjects.length === 0 ? (
            <div className="rounded-lg border bg-background p-6 text-sm text-muted-foreground">
              {hasFilters ? (
                <div className="flex flex-col gap-2">
                  <div>No projects match your filters.</div>
                  <div>
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
                      <IconX className="h-4 w-4" />
                      Clear filters
                    </Button>
                  </div>
                </div>
              ) : (
                "No projects found."
              )}
            </div>
          ) : null}

          {/* Table */}
          {data && filteredProjects.length > 0 ? (
            <div className="overflow-hidden rounded-lg border bg-background">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="w-[44%]">Project</TableHead>
                    <TableHead className="hidden md:table-cell">People</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Updated</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredProjects.map((project) => {
                    const updatedDate = new Date(project.updated_at);
                    const relativeUpdated = formatDistanceToNow(updatedDate, { addSuffix: true });

                    return (
                      <TableRow
                        key={project.project_id}
                        role="link"
                        tabIndex={0}
                        onClick={() => router.push(`/projects/${project.project_id}/overview`)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            router.push(`/projects/${project.project_id}/overview`);
                          }
                        }}
                        className="group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label={`Open ${project.project_name}`}
                      >
                        <TableCell className="py-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`h-2 w-2 shrink-0 rounded-full ${statusStyles[project.status].dot}`}
                                  aria-hidden="true"
                                />
                                <div className="truncate font-medium">
                                  {project.project_name}
                                </div>
                              </div>

                              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <span className="truncate">
                                  {project.department?.name ?? "No department"}
                                </span>

                                <span aria-hidden="true">•</span>

                                <Badge variant="outline" className="h-5 rounded-full px-2">
                                  {project.project_type}
                                </Badge>

                                {project.is_segmented ? (
                                  <Badge variant="secondary" className="h-5 rounded-full px-2">
                                    Segmented
                                  </Badge>
                                ) : null}
                              </div>
                            </div>

                            <IconChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
                          </div>
                        </TableCell>

                        <TableCell className="hidden py-3 md:table-cell">
                          <div className="text-sm">
                            <div className="font-medium">
                              {project.owner?.name ?? "Unknown owner"}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              GM: {project.governance_manager?.name ?? "—"}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="py-3">
                          <Badge
                            variant="outline"
                            className={`gap-2 rounded-full ${statusStyles[project.status].badge}`}
                          >
                            <span
                              className={`h-2 w-2 rounded-full ${statusStyles[project.status].dot}`}
                              aria-hidden="true"
                            />
                            {project.status}
                          </Badge>
                        </TableCell>

                        <TableCell className="py-3 text-right text-sm text-muted-foreground">
                          <time dateTime={project.updated_at} title={format(updatedDate, "PPpp")}>
                            {relativeUpdated}
                          </time>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : null}
        </div>
      </div>
    </DashboardShell>
  );
}
