"use client";

import * as React from "react";
import {
  Binary,
  ChartNoAxesGantt,
  Columns3,
  Database,
  GitBranch,
  GitMerge,
  SquareFunction,
  Sparkles,
  Table2,
  User,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useProjectOperations } from "@/lib/api/queries";
import type { OperationLog } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PanelEmpty, PanelError, PanelSkeleton } from "./PanelStates";

const listSkeletons = Array.from({ length: 4 });
const pluralRules = new Intl.PluralRules();
const numberFormat = new Intl.NumberFormat();

function formatWhen(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatDateLabel(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

function getLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function opIcon(op: OperationLog) {
  const name = op.operation_name.toLowerCase();
  if (name.includes("merge")) return GitMerge;
  if (name.includes("upload")) return Database;
  if (op.operation_type === "column_action") return Columns3;
  if (op.operation_type === "table_action") return Table2;
  if (op.operation_type === "table_operation") return Binary;
  return Sparkles;
}

function opTone(op: OperationLog) {
  const name = op.operation_name.toLowerCase();
  if (name.includes("upload"))
    return "bg-primary/10 text-primary border-primary/20";
  if (name.includes("merge"))
    return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
  if (name.includes("remove"))
    return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
  return "bg-muted text-foreground/80 border-border";
}

function formatOpTypeLabel(type: OperationLog["operation_type"]) {
  return type.replace(/_/g, " ");
}

function formatParamValuePython(value: unknown) {
  if (value === null || value === undefined) return "None";
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function sortOperations(operations: OperationLog[]) {
  return [...operations].sort((a, b) =>
    b.execution_timestamp.localeCompare(a.execution_timestamp)
  );
}

function formatCountLabel(count: number, singular: string, plural = `${singular}s`) {
  const label = pluralRules.select(count) === "one" ? singular : plural;
  return `${numberFormat.format(count)} ${label}`;
}

type OpFilter = "all" | "column_action" | "table_action" | "table_operation" | "other";

const filterOptions: Array<{ value: OpFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "column_action", label: "Column" },
  { value: "table_action", label: "Table" },
  { value: "table_operation", label: "Ops" },
  { value: "other", label: "Other" },
];

const MAX_VISIBLE = 20;

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

      <CardHeader className="relative">
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

      <CardContent className="relative space-y-4">
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
        <CardFooter className="relative justify-end">
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

function OperationRow({
  op,
  Icon,
}: {
  op: OperationLog;
  Icon: React.ComponentType<{ className?: string }>;
}) {
  const paramEntries = Object.entries(op.input_parameters ?? {});
  const tableName = op.affected_table ?? "table";
  const outputSignature = op.output_table_version
    ? `-> ${op.output_table_version}`
    : "-> no output";

  return (
    <div
      className={cn(
        "group rounded-xl border bg-background/80 p-3 shadow-sm transition",
        "hover:-translate-y-px hover:shadow-md"
      )}
    >
      <div className="grid grid-cols-[36px_1fr] items-start gap-3">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg border",
            opTone(op)
          )}
        >
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex min-h-9 items-center justify-between gap-3 max-sm:flex-col max-sm:items-start">
            <div className="min-w-0 flex flex-wrap items-center gap-2 max-sm:flex-col max-sm:items-start max-sm:gap-1">
              <div className="text-sm font-semibold text-foreground/90 capitalize">
                {formatOpTypeLabel(op.operation_type)}
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="rounded-md px-1.5 py-0.5 text-[11px] text-muted-foreground hover:bg-muted max-sm:self-start"
                    onClick={() =>
                      navigator.clipboard?.writeText(op.operation_log_id)
                    }
                    aria-label="Copy operation log id"
                  >
                    {op.operation_log_id}
                  </button>
                </TooltipTrigger>
                <TooltipContent>Click to copy</TooltipContent>
              </Tooltip>
            </div>

            <div className="shrink-0 max-sm:w-full">
              <div className="inline-flex items-center gap-3 text-xs text-muted-foreground max-sm:flex-col max-sm:items-start max-sm:gap-1">
                <span className="inline-flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {op.executed_by?.name ?? "Unknown user"}
                </span>
                <span>{formatWhen(op.execution_timestamp)}</span>
              </div>
            </div>
          </div>

          <div className="mt-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 max-sm:overflow-x-auto max-sm:pb-2">
            <div className="flex flex-col gap-1 font-mono text-[12px] max-sm:w-max max-sm:min-w-full">
              <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                <Table2 className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">{tableName}</span>
                <span className="text-muted-foreground">.</span>
                <SquareFunction className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-foreground">{op.operation_name}</span>
                <span className="text-muted-foreground">(</span>
              </div>
              {paramEntries.length === 0 ? (
                <div className="flex items-center gap-1 text-muted-foreground">)</div>
              ) : (
                <>
                  <div className="flex flex-col gap-1 pl-5">
                    {paramEntries.map(([key, value]) => (
                      <div
                        key={key}
                        className="inline-flex items-center gap-1 rounded-md bg-transparent px-1.5 py-0.5 max-sm:whitespace-nowrap"
                      >
                        <span className="text-muted-foreground">{key}</span>
                        <span className="text-muted-foreground">=</span>
                        <span className="text-foreground">
                          {formatParamValuePython(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">)</div>
                </>
              )}
              <div className="inline-flex items-center gap-1 text-muted-foreground">
                <GitBranch className="h-3.5 w-3.5" />
                <span>{outputSignature}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
