"use client";

import * as React from "react";
import {
  IconChevronDown,
  IconChevronUp,
  IconCircleCheck,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useProjectTables } from "@/lib/api/queries";
import type { ColumnRole, ProjectTable, TableVersion } from "@/lib/types";

const rowSkeletons = Array.from({ length: 4 });

const roleStyles: Record<ColumnRole, string> = {
  exog: "border-sky-200 bg-sky-50 text-sky-700",
  endog: "border-rose-200 bg-rose-50 text-rose-700",
  not_used: "border-slate-200 bg-slate-100 text-slate-600",
  time_id: "border-amber-200 bg-amber-50 text-amber-700",
  lookup: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const tableTypeStyles: Record<ProjectTable["table_type"], string> = {
  source: "border-indigo-200 bg-indigo-50 text-indigo-700",
  derived: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700",
};

const checkpointLabels: Record<string, string> = {
  raw_upload: "Raw upload",
  user_manual: "Manual checkpoint",
  development_gate: "Development gate",
  validation_gate: "Validation gate",
  production: "Production",
};

const getCurrentVersion = (table: ProjectTable): TableVersion | undefined =>
  table.versions.find((version) => version.table_version_id === table.current_version_id) ??
  table.versions[table.versions.length - 1];

export function DataTablesPanel({ projectId }: { projectId: string }) {
  const { data, isLoading, error, refetch } = useProjectTables(projectId);
  const [expanded, setExpanded] = React.useState<string | null>(null);

  const toggleExpanded = (tableId: string) => {
    setExpanded((prev) => (prev === tableId ? null : tableId));
  };

  return (
    <Card id="tables">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold">Data Tables</h2>
          <p className="text-sm text-muted-foreground">
            {data ? `${data.length} tables` : "Loading tables"}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <div className="space-y-3">
            {rowSkeletons.map((_, index) => (
              <div
                key={`table-row-skeleton-${index}`}
                className="grid grid-cols-12 items-center gap-3"
              >
                <Skeleton className="col-span-4 h-4" />
                <Skeleton className="col-span-2 h-4" />
                <Skeleton className="col-span-2 h-4" />
                <Skeleton className="col-span-2 h-4" />
                <Skeleton className="col-span-2 h-4" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            <div className="flex items-center gap-2 font-medium">
              <IconAlertTriangle className="h-4 w-4" />
              Unable to load tables.
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
            No tables are available for this project yet.
          </div>
        )}

        {data && data.length > 0 && (
          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-3 text-xs font-medium uppercase text-muted-foreground">
              <span className="col-span-4">Table</span>
              <span className="col-span-2">Type</span>
              <span className="col-span-2">Version</span>
              <span className="col-span-2">Rows/Cols</span>
              <span className="col-span-2">Checkpoint</span>
            </div>
            {data.map((table) => {
              const currentVersion = getCurrentVersion(table);
              const isExpanded = expanded === table.project_table_id;
              const checkpointLabel =
                currentVersion?.checkpoint_type &&
                checkpointLabels[currentVersion.checkpoint_type];

              return (
                <div key={table.project_table_id} className="space-y-2">
                  <button
                    type="button"
                    onClick={() => toggleExpanded(table.project_table_id)}
                    className="grid w-full grid-cols-12 items-center gap-3 rounded-lg border bg-background px-3 py-3 text-left text-sm transition hover:bg-muted/40"
                    aria-expanded={isExpanded}
                  >
                    <div className="col-span-4 flex items-center gap-2">
                      {isExpanded ? (
                        <IconChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <IconChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                      <div>
                        <div className="font-medium text-foreground">
                          {table.display_name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {table.table_name}
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <Badge
                        variant="outline"
                        className={`rounded-full ${tableTypeStyles[table.table_type]}`}
                      >
                        {table.table_type}
                      </Badge>
                    </div>
                    <div className="col-span-2 text-sm text-muted-foreground">
                      {currentVersion ? `v${currentVersion.version_number}` : "—"}
                    </div>
                    <div className="col-span-2 text-sm text-muted-foreground">
                      {currentVersion
                        ? `${currentVersion.row_count.toLocaleString()} / ${currentVersion.column_count}`
                        : "—"}
                    </div>
                    <div className="col-span-2 text-sm text-muted-foreground">
                      {checkpointLabel ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700">
                          <IconCircleCheck className="h-4 w-4" />
                          {checkpointLabel}
                        </span>
                      ) : (
                        "—"
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="rounded-lg border bg-muted/20 px-4 py-4">
                      <Tabs defaultValue="columns">
                        <TabsList>
                          <TabsTrigger value="columns">Columns</TabsTrigger>
                          <TabsTrigger value="versions">Versions</TabsTrigger>
                        </TabsList>
                        <TabsContent value="columns" className="mt-4">
                          <div className="grid gap-2">
                            {table.columns.map((column) => (
                              <div
                                key={column.column_id}
                                className="grid grid-cols-12 items-center gap-3 rounded-md border bg-background px-3 py-2 text-sm"
                              >
                                <div className="col-span-5">
                                  <div className="font-medium text-foreground">
                                    {column.display_name}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {column.column_name}
                                  </div>
                                </div>
                                <div className="col-span-3 text-xs text-muted-foreground">
                                  {column.data_type}
                                </div>
                                <div className="col-span-4">
                                  <Badge
                                    variant="outline"
                                    className={`rounded-full ${roleStyles[column.role]}`}
                                  >
                                    {column.role}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </TabsContent>
                        <TabsContent value="versions" className="mt-4">
                          <div className="space-y-2">
                            {table.versions.map((version) => {
                              const isCurrent =
                                version.table_version_id ===
                                table.current_version_id;
                              const checkpointLabel =
                                version.checkpoint_type &&
                                checkpointLabels[version.checkpoint_type];

                              return (
                                <div
                                  key={version.table_version_id}
                                  className={`grid grid-cols-12 items-center gap-3 rounded-md border px-3 py-2 text-sm ${
                                    isCurrent
                                      ? "border-primary/40 bg-primary/5"
                                      : "bg-background"
                                  }`}
                                >
                                  <div className="col-span-2 font-medium text-foreground">
                                    v{version.version_number}
                                    {isCurrent ? (
                                      <Badge
                                        variant="outline"
                                        className="ml-2 rounded-full border-primary/40 text-primary"
                                      >
                                        Current
                                      </Badge>
                                    ) : null}
                                  </div>
                                  <div className="col-span-2 text-muted-foreground">
                                    {version.row_count.toLocaleString()} rows
                                  </div>
                                  <div className="col-span-2 text-muted-foreground">
                                    {version.column_count} cols
                                  </div>
                                  <div className="col-span-2 text-muted-foreground">
                                    {version.is_materialized
                                      ? "Materialized"
                                      : "Virtual"}
                                  </div>
                                  <div className="col-span-2 text-muted-foreground">
                                    {checkpointLabel ?? "—"}
                                  </div>
                                  <div className="col-span-2 text-xs text-muted-foreground">
                                    <div>
                                      {format(
                                        new Date(version.created_at),
                                        "PP"
                                      )}
                                    </div>
                                    <div>{version.created_by}</div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
