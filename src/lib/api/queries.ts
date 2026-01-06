import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api/fetcher";
import type {
  Governance,
  OperationLog,
  Project,
  ProjectTable,
  TableLineageEdge,
} from "@/lib/types";

export const queryKeys = {
  projects: ["projects"] as const,
  project: (projectId: string) => ["projects", projectId] as const,
  projectTables: (projectId: string) => ["project_tables", projectId] as const,
  projectOperations: (projectId: string) => ["recent_operations", projectId] as const,
  projectGovernance: (projectId: string) => ["governance", projectId] as const,
  projectLineage: (projectId: string) => ["table_lineage", projectId] as const,
};

export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects,
    queryFn: () => apiGet<Project[]>("/api/projects"),
  });
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: queryKeys.project(projectId),
    queryFn: () => apiGet<Project>(`/api/projects/${projectId}`),
    enabled: Boolean(projectId),
  });
}

export function useProjectTables(projectId: string) {
  return useQuery({
    queryKey: queryKeys.projectTables(projectId),
    queryFn: () => apiGet<ProjectTable[]>(`/api/project_tables/${projectId}`),
    enabled: Boolean(projectId),
  });
}

export function useProjectOperations(projectId: string) {
  return useQuery({
    queryKey: queryKeys.projectOperations(projectId),
    queryFn: () => apiGet<OperationLog[]>(`/api/recent_operations/${projectId}`),
    enabled: Boolean(projectId),
  });
}

export function useProjectGovernance(projectId: string) {
  return useQuery({
    queryKey: queryKeys.projectGovernance(projectId),
    queryFn: () => apiGet<Governance>(`/api/governance/${projectId}`),
    enabled: Boolean(projectId),
  });
}

export function useProjectLineage(projectId: string) {
  return useQuery({
    queryKey: queryKeys.projectLineage(projectId),
    queryFn: () => apiGet<TableLineageEdge[]>(`/api/table_lineage/${projectId}`),
    enabled: Boolean(projectId),
  });
}
