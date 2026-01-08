"use client";

import { useMemo } from "react";
import { statusOptions, type SortOption } from "@/components/projects/constants";
import type { Project, ProjectStatus } from "@/lib/types";
import type {
  ProjectDepartmentFilter,
  ProjectStatusFilter,
  ProjectTypeFilter,
} from "@/components/projects/use-filters";

function buildStatusTotals(projects?: Project[]) {
  const totals = Object.fromEntries(
    statusOptions.map((status) => [status, 0])
  ) as Record<ProjectStatus, number>;

  projects?.forEach((project) => {
    totals[project.status] += 1;
  });

  return totals;
}

function filterProjects(
  projects: Project[] | undefined,
  query: string,
  statusFilter: ProjectStatusFilter,
  typeFilter: ProjectTypeFilter,
  departmentFilter: ProjectDepartmentFilter,
  sortFilter: SortOption
) {
  if (!projects) return [];

  const normalizedQuery = query.trim().toLowerCase();
  let items = [...projects];

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
    if (sortFilter === "name_asc") {
      return a.project_name.localeCompare(b.project_name);
    }

    const aUpdated = new Date(a.updated_at).getTime();
    const bUpdated = new Date(b.updated_at).getTime();
    if (sortFilter === "updated_asc") return aUpdated - bUpdated;
    return bUpdated - aUpdated;
  });

  return items;
}

function getDepartmentOptions(projects?: Project[]) {
  if (!projects) return [];
  const departmentNames = new Set<string>();

  projects.forEach((project) => {
    if (project.department?.name) {
      departmentNames.add(project.department.name);
    }
  });

  return Array.from(departmentNames).sort((a, b) => a.localeCompare(b));
}

export function useProjectListDerived(
  projects: Project[] | undefined,
  filters: {
    query: string;
    statusFilter: ProjectStatusFilter;
    typeFilter: ProjectTypeFilter;
    departmentFilter: ProjectDepartmentFilter;
    sortFilter: SortOption;
  }
) {
  const { query, statusFilter, typeFilter, departmentFilter, sortFilter } =
    filters;
  const statusTotals = useMemo(() => buildStatusTotals(projects), [projects]);
  const filteredProjects = useMemo(
    () =>
      filterProjects(
        projects,
        query,
        statusFilter,
        typeFilter,
        departmentFilter,
        sortFilter
      ),
    [
      projects,
      query,
      statusFilter,
      typeFilter,
      departmentFilter,
      sortFilter,
    ]
  );
  const departmentOptions = useMemo(
    () => getDepartmentOptions(projects),
    [projects]
  );

  return {
    statusTotals,
    filteredProjects,
    departmentOptions,
  };
}
