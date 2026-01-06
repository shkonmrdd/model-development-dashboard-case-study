"use client";

import { IconX } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Project } from "@/lib/types";

const listSkeletonRows = Array.from({ length: 6 });

type ProjectListStatesProps = {
  isLoading: boolean;
  error: unknown;
  projects?: Project[];
  filteredProjects: Project[];
  hasFilters: boolean;
  onRetry: () => void;
  onClearFilters: () => void;
};

export function ProjectListStates({
  isLoading,
  error,
  projects,
  filteredProjects,
  hasFilters,
  onRetry,
  onClearFilters,
}: ProjectListStatesProps) {
  if (isLoading) {
    return (
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
            {listSkeletonRows.map((_, index) => (
              <TableRow key={`sk-${index}`}>
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
    );
  }

  if (error) {
    return (
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
          onClick={onRetry}
          className="mt-3 border-destructive/50 text-destructive hover:bg-destructive/10"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (projects && projects.length === 0) {
    return (
      <div className="rounded-lg border bg-background p-6 text-sm text-muted-foreground">
        No projects found.
      </div>
    );
  }

  if (projects && projects.length > 0 && filteredProjects.length === 0) {
    return (
      <div className="rounded-lg border bg-background p-6 text-sm text-muted-foreground">
        {hasFilters ? (
          <div className="flex flex-col gap-2">
            <div>No projects match your filters.</div>
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="gap-2"
              >
                <IconX className="h-4 w-4" />
                Clear filters
              </Button>
            </div>
          </div>
        ) : (
          "No projects found."
        )}
      </div>
    );
  }

  return null;
}
