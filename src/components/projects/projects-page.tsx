"use client";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ProjectListHeader } from "@/components/projects/list-header";
import { ProjectListStates } from "@/components/projects/list-states";
import { ProjectStatusTabs } from "@/components/projects/status-tabs";
import { ProjectTable } from "@/components/projects/table";
import { ProjectToolbar } from "@/components/projects/toolbar";
import { useProjectFilters } from "@/components/projects/use-filters";
import { useProjectListDerived } from "@/components/projects/use-projects-derived";
import { useProjects } from "@/lib/api/queries";

export function ProjectsPage() {
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

  const { statusTotals, filteredProjects, departmentOptions } =
    useProjectListDerived(data, {
      query,
      statusFilter,
      typeFilter,
      departmentFilter,
      sortFilter,
    });

  return (
    <DashboardShell breadcrumbs={[{ label: "Projects" }]}>
      <div className="px-4 lg:px-6">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
          <ProjectListHeader />

          <ProjectToolbar
            typeFilter={typeFilter}
            departmentFilter={departmentFilter}
            departmentOptions={departmentOptions}
            sortFilter={sortFilter}
            query={query}
            onTypeChange={(value) => updateParam("type", value)}
            onDepartmentChange={(value) => updateParam("department", value)}
            onSortChange={(value) => updateParam("sort", value)}
            onQueryChange={(value) => updateParam("q", value)}
          />

          <ProjectStatusTabs
            value={statusFilter}
            totalCount={data?.length}
            statusTotals={statusTotals}
            hasFilters={hasFilters}
            onValueChange={(value) => updateParam("status", value)}
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
