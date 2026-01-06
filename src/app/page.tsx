"use client";

import { useMemo } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { ProjectListHeader } from "@/components/projects/list-header";
import { ProjectListStates } from "@/components/projects/list-states";
import { ProjectStatusTabs } from "@/components/projects/status-tabs";
import { ProjectTable } from "@/components/projects/table";
import { ProjectToolbar } from "@/components/projects/toolbar";
import { statusOptions } from "@/components/projects/constants";
import { useProjectFilters } from "@/components/projects/use-filters";
import { useProjects } from "@/lib/api/queries";
import type { ProjectStatus } from "@/lib/types";

export default function Home() {
  const { data, isLoading, error, refetch } = useProjects();
  const {
    query,
    statusFilter,
    typeFilter,
    sortFilter,
    departmentFilter,
    hasFilters,
    updateParam,
    clearFilters,
  } = useProjectFilters();

  const statusTotals = useMemo(() => {
    const totals = Object.fromEntries(
      statusOptions.map((status) => [status, 0])
    ) as Record<ProjectStatus, number>;

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

    if (departmentFilter !== "all") {
      items = items.filter(
        (project) => project.department?.name === departmentFilter
      );
    }

    items.sort((a, b) => {
      if (sortFilter === "name_asc") return a.project_name.localeCompare(b.project_name);

      const aUpdated = new Date(a.updated_at).getTime();
      const bUpdated = new Date(b.updated_at).getTime();
      if (sortFilter === "updated_asc") return aUpdated - bUpdated;
      return bUpdated - aUpdated;
    });

    return items;
  }, [data, query, statusFilter, typeFilter, departmentFilter, sortFilter]);

  const departmentOptions = useMemo(() => {
    if (!data) return [];
    const departmentNames = new Set<string>();

    data.forEach((project) => {
      if (project.department?.name) {
        departmentNames.add(project.department.name);
      }
    });

    return Array.from(departmentNames).sort((a, b) => a.localeCompare(b));
  }, [data]);

  return (
    <DashboardShell breadcrumbs={[{ label: "Projects" }]}>
      <div className="px-4 lg:px-6">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
          <ProjectListHeader
          />

          <ProjectStatusTabs
            value={statusFilter}
            totalCount={data?.length}
            statusTotals={statusTotals}
            onValueChange={(value) => updateParam("status", value)}
          />

          <ProjectToolbar
            typeFilter={typeFilter}
            departmentFilter={departmentFilter}
            departmentOptions={departmentOptions}
            sortFilter={sortFilter}
            query={query}
            hasFilters={hasFilters}
            onTypeChange={(value) => updateParam("type", value)}
            onDepartmentChange={(value) => updateParam("department", value)}
            onSortChange={(value) => updateParam("sort", value)}
            onQueryChange={(value) => updateParam("q", value)}
            onClearFilters={clearFilters}
          />

          <ProjectListStates
            isLoading={isLoading}
            error={error}
            projects={data}
            filteredProjects={filteredProjects}
            hasFilters={hasFilters}
            onRetry={refetch}
            onClearFilters={clearFilters}
          />

          {data && filteredProjects.length > 0 ? (
            <ProjectTable projects={filteredProjects} />
          ) : null}
        </div>
      </div>
    </DashboardShell>
  );
}
