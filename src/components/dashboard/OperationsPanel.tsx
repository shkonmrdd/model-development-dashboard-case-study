"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PanelEmpty, PanelError, PanelSkeleton } from "./PanelStates";
import { useProjectOperations } from "@/lib/api/queries";

import type { OperationLog } from "@/lib/types";
import { OperationRow } from "./operations/OperationsRow";
import {
  formatCountLabel,
  formatDateLabel,
  getLocalDateKey,
  MAX_VISIBLE,
  OpFilter,
  filterOptions,
  numberFormat,
  opIcon,
  sortOperations,
} from "./operations/operations.utils";

import { ChartNoAxesGantt } from "lucide-react";

const listSkeletons = Array.from({ length: 4 });

export function OperationsPanel({
  projectId,
}: {
  projectId: string;
}) {
  const { data, isLoading, error, refetch } = useProjectOperations(projectId);
  const [filter, setFilter] = React.useState<OpFilter>("all");
  const [showAll, setShowAll] = React.useState(false);
  const operations = React.useMemo(
    () => (data ? sortOperations(data) : []),
    [data]
  );
  const filteredOperations = React.useMemo(() => {
    if (filter === "all") return operations;
    if (filter === "other") {
      return operations.filter(
        (operation) =>
          operation.operation_type !== "column_action" &&
          operation.operation_type !== "table_action" &&
          operation.operation_type !== "table_operation"
      );
    }
    return operations.filter((operation) => operation.operation_type === filter);
  }, [filter, operations]);
  const visibleOperations = React.useMemo(
    () => (showAll ? filteredOperations : filteredOperations.slice(0, MAX_VISIBLE)),
    [filteredOperations, showAll]
  );
  const groupedOperations = React.useMemo(() => {
    const groups: Array<{
      key: string;
      label: string;
      items: OperationLog[];
    }> = [];

    visibleOperations.forEach((operation) => {
      const date = new Date(operation.execution_timestamp);
      const isValid = !Number.isNaN(date.getTime());
      const key = isValid ? getLocalDateKey(date) : "unknown";
      const label = isValid ? formatDateLabel(date) : "Unknown date";
      const lastGroup = groups[groups.length - 1];

      if (lastGroup && lastGroup.key === key) {
        lastGroup.items.push(operation);
      } else {
        groups.push({ key, label, items: [operation] });
      }
    });

    return groups;
  }, [visibleOperations]);
  const remainingCount = Math.max(filteredOperations.length - MAX_VISIBLE, 0);
  const hasMore = remainingCount > 0;
  const countLabel =
    !isLoading && !error
      ? filter === "all"
        ? formatCountLabel(operations.length, "operation")
        : `${numberFormat.format(filteredOperations.length)} of ${formatCountLabel(
            operations.length,
            "operation"
          )}`
      : "—";

  React.useEffect(() => {
    setShowAll(false);
  }, [filter, projectId]);

  return (
    <Card id="operations" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-muted/80 blur-3xl" />
      </div>

      <CardHeader className="relative max-sm:px-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-1.5 text-base">
              <ChartNoAxesGantt className="h-5.5 w-5.5 text-primary" />
              Recent operations
            </CardTitle>
            <CardDescription className="mt-1">
              Latest transformations and actions for this project.
            </CardDescription>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {filterOptions.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  size="sm"
                  variant={filter === option.value ? "secondary" : "ghost"}
                  className="h-7 px-2 text-xs"
                  onClick={() => setFilter(option.value)}
                  aria-pressed={filter === option.value}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="shrink-0 text-sm text-muted-foreground">
            {countLabel}
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4 max-sm:px-4">
        {isLoading && (
          <PanelSkeleton>
            {listSkeletons.map((_, index) => (
              <div
                key={`op-skeleton-${index}`}
                className="rounded-xl border bg-background/70 p-3"
              >
                <div className="flex items-start gap-3">
                  <Skeleton className="h-9 w-9 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-3 w-56" />
                  </div>
                </div>
              </div>
            ))}
          </PanelSkeleton>
        )}

        {error && !isLoading && (
          <PanelError
            title="Unable to load operations."
            error={error}
            onRetry={refetch}
          />
        )}

        {!isLoading && !error && operations.length === 0 && (
          <PanelEmpty message="No recent operations recorded for this project." />
        )}

        {!isLoading &&
          !error &&
          operations.length > 0 &&
          filteredOperations.length === 0 && (
            <PanelEmpty message="No operations match this filter." />
          )}

        {!isLoading && !error && filteredOperations.length > 0 && (
          <div className="space-y-8">
            {groupedOperations.map((group) => (
              <div key={group.key} className="space-y-8">
                <div className="flex items-center gap-3 text-xs font-semibold uppercase text-muted-foreground">
                  <span>{group.label}</span>
                  <span className="h-px flex-1 bg-border/60" />
                </div>
                <div className="space-y-2">
                  {group.items.map((operation) => {
                    const Icon = opIcon(operation);
                    return (
                      <OperationRow
                        key={operation.operation_log_id}
                        op={operation}
                        Icon={Icon}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      {hasMore ? (
        <CardFooter className="relative justify-end max-sm:px-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs"
            onClick={() => setShowAll((prev) => !prev)}
          >
            {showAll ? "Show less" : `Show more (${remainingCount})`}
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  );
}
