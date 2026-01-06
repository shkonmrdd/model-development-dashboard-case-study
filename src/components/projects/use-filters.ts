"use client";

import { useRouter, useSearchParams } from "next/navigation";

import type { ProjectStatus, ProjectType } from "@/lib/types";
import {
  isProjectStatus,
  isProjectType,
  isSortOption,
  type SortOption,
} from "@/components/projects/constants";

export type ProjectStatusFilter = "all" | ProjectStatus;
export type ProjectTypeFilter = "all" | ProjectType;
export type ProjectDepartmentFilter = "all" | string;

export function useProjectFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const query = searchParams.get("q") ?? "";
  const statusFilterRaw = searchParams.get("status") ?? "all";
  const statusFilter: ProjectStatusFilter =
    statusFilterRaw === "all"
      ? "all"
      : isProjectStatus(statusFilterRaw)
        ? statusFilterRaw
        : "all";

  const typeFilterRaw = searchParams.get("type") ?? "all";
  const typeFilter: ProjectTypeFilter =
    typeFilterRaw === "all"
      ? "all"
      : isProjectType(typeFilterRaw)
        ? typeFilterRaw
        : "all";

  const sortFilterRaw = searchParams.get("sort") ?? "updated_desc";
  const sortFilter: SortOption = isSortOption(sortFilterRaw)
    ? sortFilterRaw
    : "updated_desc";

  const departmentFilter =
    (searchParams.get("department") as ProjectDepartmentFilter) ?? "all";

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    const trimmed = value.trim();

    if (!trimmed || trimmed === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    const queryString = params.toString();
    router.replace(queryString ? `/?${queryString}` : "/", { scroll: false });
  };

  const clearFilters = () => {
    router.replace("/", { scroll: false });
  };

  const hasFilters =
    query.trim().length > 0 ||
    statusFilter !== "all" ||
    typeFilter !== "all" ||
    departmentFilter !== "all";

  return {
    query,
    statusFilter,
    typeFilter,
    sortFilter,
    departmentFilter,
    hasFilters,
    updateParam,
    clearFilters,
  };
}
