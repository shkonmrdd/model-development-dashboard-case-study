"use client";

import * as React from "react";
import { IconAlertTriangle } from "@tabler/icons-react";
import {
  ArrowRight,
  Binary,
  ChevronDown,
  Columns3,
  Database,
  GitMerge,
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useProjectOperations } from "@/lib/api/queries";
import type { OperationLog } from "@/lib/types";
import { cn } from "@/lib/utils";

const listSkeletons = Array.from({ length: 4 });

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

function summarizeParams(params: Record<string, unknown>) {
  const keys = Object.keys(params);
  if (keys.length === 0) return "—";
  return keys
    .slice(0, 3)
    .map((key) => `${key}=${String(params[key])}`)
    .join(", ")
    .concat(keys.length > 3 ? ` +${keys.length - 3}` : "");
}

function sortOperations(operations: OperationLog[]) {
  return [...operations].sort((a, b) =>
    b.execution_timestamp.localeCompare(a.execution_timestamp)
  );
}

export function OperationsPanel({
  projectId,
  onViewAll,
}: {
  projectId: string;
  onViewAll?: (projectId: string) => void;
}) {
  const { data, isLoading, error, refetch } = useProjectOperations(projectId);
  const operations = React.useMemo(
    () => (data ? sortOperations(data) : []),
    [data]
  );
  const countLabel =
    !isLoading && !error ? `${operations.length} events` : "—";

  return (
    <Card id="operations" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-muted/80 blur-3xl" />
      </div>

      <CardHeader className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" />
              Recent operations
            </CardTitle>
            <CardDescription className="mt-1">
              Latest transformations and actions for this project, with
              traceable inputs and outputs.
            </CardDescription>
          </div>

          <Badge variant="secondary" className="shrink-0">
            {countLabel}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {isLoading && (
          <div className="space-y-3">
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
          </div>
        )}

        {error && !isLoading && (
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

        {!isLoading && !error && operations.length === 0 && (
          <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
            No recent operations recorded for this project.
          </div>
        )}

        {!isLoading && !error && operations.length > 0 && (
          <div className="space-y-2">
            {operations.map((operation) => {
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
        )}
      </CardContent>

      <Separator className="relative" />

      <CardFooter className="relative flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          Showing newest first - Click an item to inspect parameters
        </div>
        <Button
          variant="secondary"
          className="gap-2"
          onClick={() => onViewAll?.(projectId)}
          aria-label="View all operations"
          disabled={!onViewAll}
        >
          View all
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
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
  const [open, setOpen] = React.useState(false);
  const detailsId = React.useId();

  return (
    <div
      className={cn(
        "group rounded-xl border bg-background/80 p-3 shadow-sm transition",
        "hover:-translate-y-[1px] hover:shadow-md"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
            opTone(op)
          )}
        >
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <div className="truncate font-medium">
                  <span className="font-mono text-[13px]">
                    {op.operation_name}
                  </span>
                </div>

                <Badge variant="outline" className="text-[11px]">
                  {op.operation_type}
                </Badge>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="rounded-md px-1.5 py-0.5 text-[11px] text-muted-foreground hover:bg-muted"
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

              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Table2 className="h-3.5 w-3.5" />
                  <span className="font-mono">{op.affected_table ?? "—"}</span>
                </span>

                <span className="inline-flex items-center gap-1">
                  <GitMerge className="h-3.5 w-3.5" />
                  <span className="font-mono">
                    {op.output_table_version ??
                      "no output version"}
                  </span>
                </span>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <div className="text-xs text-muted-foreground">
                {formatWhen(op.execution_timestamp)}
              </div>
              <div className="mt-2 flex items-center justify-end gap-2">
                <span className="text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    {op.executed_by?.name ?? "Unknown user"}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="min-w-0 text-xs text-muted-foreground">
              <span className="mr-2 inline-flex items-center gap-1">
                <Columns3 className="h-3.5 w-3.5" />
                Params:
              </span>
              <span className="truncate font-mono">
                {summarizeParams(op.input_parameters)}
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1"
              onClick={() => setOpen((prev) => !prev)}
              aria-expanded={open}
              aria-controls={detailsId}
            >
              Details
              <ChevronDown
                className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
              />
            </Button>
          </div>
        </div>
      </div>

      {open ? (
        <div
          id={detailsId}
          className="mt-3 rounded-lg border bg-muted/40 p-3"
        >
          <div className="mb-2 text-xs font-medium text-foreground/80">
            Input parameters
          </div>
          <pre className="max-h-40 overflow-auto rounded-md bg-background p-3 text-xs leading-relaxed">
            {JSON.stringify(op.input_parameters, null, 2)}
          </pre>
        </div>
      ) : null}
    </div>
  );
}
