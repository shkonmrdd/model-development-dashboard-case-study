"use client";

import { useRouter } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import { IconChevronRight } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { statusStyles } from "@/components/projects/constants";
import type { Project } from "@/lib/types";

const missingManagerLabel = "\u2014";

type ProjectTableProps = {
  projects: Project[];
};

export function ProjectTable({ projects }: ProjectTableProps) {
  const router = useRouter();

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
          {projects.map((project) => {
            const updatedDate = new Date(project.updated_at);
            const relativeUpdated = formatDistanceToNow(updatedDate, {
              addSuffix: true,
            });

            return (
              <TableRow
                key={project.project_id}
                role="link"
                tabIndex={0}
                onClick={() =>
                  router.push(`/projects/${project.project_id}/overview`)
                }
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

                        <span aria-hidden="true">&bull;</span>

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
                      GM: {project.governance_manager?.name ?? missingManagerLabel}
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
                  <time
                    dateTime={project.updated_at}
                    title={format(updatedDate, "PPpp")}
                  >
                    {relativeUpdated}
                  </time>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
