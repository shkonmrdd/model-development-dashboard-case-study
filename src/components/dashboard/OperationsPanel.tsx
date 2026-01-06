"use client";

import * as React from "react";
import { format } from "date-fns";
import { IconAlertTriangle } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectOperations } from "@/lib/api/queries";
import type { OperationLog } from "@/lib/types";

const listSkeletons = Array.from({ length: 4 });

const formatOperationName = (name: string) =>
  name
    .split("_")
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");

const groupByDate = (operations: OperationLog[]) => {
  const groups = new Map<string, OperationLog[]>();

  operations.forEach((operation) => {
    const key = format(new Date(operation.execution_timestamp), "yyyy-MM-dd");
    const existing = groups.get(key) ?? [];
    existing.push(operation);
    groups.set(key, existing);
  });

  return Array.from(groups.entries())
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([date, ops]) => ({
      date,
      operations: ops.sort((a, b) =>
        a.execution_timestamp < b.execution_timestamp ? 1 : -1
      ),
    }));
};

export function OperationsPanel({ projectId }: { projectId: string }) {
  const { data, isLoading, error, refetch } = useProjectOperations(projectId);

  return (
    <Card id="operations">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold">Recent Operations</h2>
          <p className="text-sm text-muted-foreground">Last 10</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <div className="space-y-4">
            {listSkeletons.map((_, index) => (
              <div key={`op-skeleton-${index}`} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            <div className="flex items-center gap-2 font-medium">
              <IconAlertTriangle className="h-4 w-4" />
              Unable to load operations.
            </div>
            <p className="text-muted-foreground">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => refetch()}
            >
              Retry
            </Button>
          </div>
        )}

        {data && data.length === 0 && !isLoading && (
          <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
            No recent operations recorded for this project.
          </div>
        )}

        {data && data.length > 0 && (
          <div className="space-y-6">
            {groupByDate(data).map((group) => {
              const dateLabel = format(new Date(group.date), "PPP");

              return (
                <div key={group.date} className="space-y-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {dateLabel}
                  </div>
                  <div className="space-y-3">
                    {group.operations.map((operation) => (
                      <div
                        key={operation.operation_log_id}
                        className="rounded-lg border bg-background px-4 py-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="text-sm font-medium text-foreground">
                            {formatOperationName(operation.operation_name)}
                          </div>
                          <Badge variant="outline" className="rounded-full">
                            {operation.operation_type}
                          </Badge>
                        </div>
                        <div className="mt-2 grid gap-2 text-xs text-muted-foreground md:grid-cols-4">
                          <div>
                            <span className="font-medium text-foreground">
                              Executed by:
                            </span>{" "}
                            {operation.executed_by?.name ?? "Unknown"}
                          </div>
                          <div>
                            <span className="font-medium text-foreground">
                              Time:
                            </span>{" "}
                            {format(
                              new Date(operation.execution_timestamp),
                              "p"
                            )}
                          </div>
                          <div>
                            <span className="font-medium text-foreground">
                              Table:
                            </span>{" "}
                            {operation.affected_table ?? "—"}
                          </div>
                          <div>
                            <span className="font-medium text-foreground">
                              Output version:
                            </span>{" "}
                            {operation.output_table_version ?? "—"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
