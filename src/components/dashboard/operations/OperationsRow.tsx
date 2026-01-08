"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { OperationLog } from "@/lib/types";
import type { ComponentType } from "react";
import { GitBranch, SquareFunction, Table2, User } from "lucide-react";

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
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function OperationRow({
  op,
  Icon,
}: {
  op: OperationLog;
  Icon: ComponentType<{ className?: string }>;
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
      <div className="grid grid-cols-[36px_1fr] items-start gap-3 max-sm:grid-cols-[28px_1fr] max-sm:gap-2">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg border max-sm:h-7 max-sm:w-7",
            opTone(op)
          )}
        >
          <Icon className="h-4 w-4 max-sm:h-3 max-sm:w-3" />
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
