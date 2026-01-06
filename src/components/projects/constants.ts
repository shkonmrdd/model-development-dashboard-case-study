import type { ProjectStatus, ProjectType } from "@/lib/types";

export const statusOptions: ProjectStatus[] = [
  "Draft",
  "Active",
  "Review",
  "Approved",
  "Locked",
];

export const typeOptions: ProjectType[] = [
  "ML",
  "TimeSeries",
  "Scorecard",
  "AI",
];

export const sortOptions = [
  { value: "updated_desc", label: "Updated (newest)" },
  { value: "updated_asc", label: "Updated (oldest)" },
  { value: "name_asc", label: "Name (A\u2013Z)" },
] as const;

export type SortOption = (typeof sortOptions)[number]["value"];

export const statusStyles: Record<ProjectStatus, { badge: string; dot: string }> = {
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

export function isProjectStatus(value: string): value is ProjectStatus {
  return (statusOptions as string[]).includes(value);
}

export function isProjectType(value: string): value is ProjectType {
  return (typeOptions as string[]).includes(value);
}

export function isSortOption(value: string): value is SortOption {
  return sortOptions.some((option) => option.value === value);
}
