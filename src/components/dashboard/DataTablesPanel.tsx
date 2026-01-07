"use client";

import { IconCircleCheck } from "@tabler/icons-react";
import { Table2 } from "lucide-react";
import { format } from "date-fns";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProjectTables } from "@/lib/api/queries";
import type { ColumnRole, ProjectTable, TableVersion } from "@/lib/types";
import { parseISODate } from "@/lib/utils";
import { PanelEmpty, PanelError, PanelSkeleton } from "./PanelStates";

const rowSkeletons = Array.from({ length: 4 });

const roleStyles: Record<ColumnRole, string> = {
  exog: "border-transparent bg-sky-50 text-sky-700",
  endog: "border-transparent bg-rose-50 text-rose-700",
  not_used: "border-transparent bg-slate-100 text-slate-600",
  time_id: "border-transparent bg-amber-50 text-amber-700",
  lookup: "border-transparent bg-emerald-50 text-emerald-700",
};

const tableTypeStyles: Record<ProjectTable["table_type"], string> = {
  source: "border-transparent bg-indigo-50 text-indigo-700",
  derived: "border-transparent bg-fuchsia-50 text-fuchsia-700",
};

const checkpointLabels: Record<string, string> = {
  raw_upload: "Raw upload",
  user_manual: "Manual checkpoint",
  development_gate: "Development gate",
  validation_gate: "Validation gate",
  production: "Production",
};

const pluralRules = new Intl.PluralRules();
const numberFormat = new Intl.NumberFormat();

function formatCountLabel(count: number, singular: string, plural = `${singular}s`) {
  const label = pluralRules.select(count) === "one" ? singular : plural;
  return `${numberFormat.format(count)} ${label}`;
}

function formatDateLabel(value?: string | null) {
  if (!value) return "—";
  const parsed = parseISODate(value);
  return parsed ? format(parsed, "PP") : "—";
}

const getCurrentVersion = (table: ProjectTable): TableVersion | undefined =>
  table.versions.find(
    (version) => version.table_version_id === table.current_version_id
  ) ?? table.versions[table.versions.length - 1];

const getCheckpointLabel = (checkpointType?: string | null) =>
  checkpointType ? checkpointLabels[checkpointType] : null;

function TableHeaderRow() {
  return (
    <div className="grid grid-cols-12 gap-1 pl-2 pr-8 text-xs font-medium uppercase text-muted-foreground">
      <span className="col-span-4">Table</span>
      <span className="col-span-2">Type</span>
      <span className="col-span-2">Version</span>
      <span className="col-span-2">Rows/Cols</span>
      <span className="col-span-2">Checkpoint</span>
    </div>
  );
}

function ColumnsList({ columns }: { columns: ProjectTable["columns"] }) {
  return (
    <div className="overflow-hidden rounded-md bg-background/80">
      <div className="divide-y divide-muted-foreground/10">
        {columns.map((column) => (
          <div
            key={column.column_id}
            className="grid grid-cols-12 items-center gap-3 px-3 py-2 text-sm"
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
              <Badge className={`rounded-full ${roleStyles[column.role]}`}>
                {column.role}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VersionsList({
  versions,
  currentVersionId,
}: {
  versions: TableVersion[];
  currentVersionId: string;
}) {
  return (
    <div className="overflow-hidden rounded-md bg-background/80">
      <div className="divide-y divide-muted-foreground/10">
        {versions.map((version) => {
          const isCurrent = version.table_version_id === currentVersionId;
          const checkpointLabel = getCheckpointLabel(version.checkpoint_type);

          return (
            <div
              key={version.table_version_id}
              className={`grid grid-cols-12 items-center gap-3 px-3 py-2 text-sm ${
                isCurrent ? "bg-emerald-50/70" : ""
              }`}
            >
              <div className="col-span-2 font-medium">
                v{version.version_number}
                {isCurrent ? (
                  <Badge className="ml-2 rounded-full border-transparent bg-emerald-600 text-white">
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
                {version.is_materialized ? "Materialized" : "Virtual"}
              </div>
              <div className="col-span-2 text-muted-foreground">
                {checkpointLabel ?? "—"}
              </div>
              <div className="col-span-2 text-xs text-muted-foreground">
                <div>{formatDateLabel(version.created_at)}</div>
                <div>{version.created_by}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TableAccordion({ tables }: { tables: ProjectTable[] }) {
  return (
    <div className="space-y-3">
      <TableHeaderRow />
      <Accordion type="single" collapsible className="w-full">
        {tables.map((table) => {
          const currentVersion = getCurrentVersion(table);
          const checkpointLabel = getCheckpointLabel(
            currentVersion?.checkpoint_type
          );

          return (
            <AccordionItem
              key={table.project_table_id}
              value={table.project_table_id}
            >
              <AccordionTrigger className="cursor-pointer rounded-md px-2 py-3 hover:bg-muted/30 hover:no-underline">
                <div className="grid w-full grid-cols-12 items-center gap-3 text-sm">
                  <div className="col-span-4">
                    <div className="font-medium text-foreground">
                      {table.display_name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {table.table_name}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <Badge
                      className={`rounded-full ${
                        tableTypeStyles[table.table_type]
                      }`}
                    >
                      {table.table_type}
                    </Badge>
                  </div>
                  <div className="col-span-2 text-sm text-muted-foreground">
                    {currentVersion ? `v${currentVersion.version_number}` : "—"}
                  </div>
                  <div className="col-span-2 text-sm text-muted-foreground">
                    {currentVersion
                      ? `${currentVersion.row_count.toLocaleString()} / ${
                          currentVersion.column_count
                        }`
                      : "—"}
                  </div>
                  <div className="col-span-2 text-sm text-muted-foreground">
                    {checkpointLabel ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700">
                        <IconCircleCheck className="h-4 w-4 min-w-4" />
                        {checkpointLabel}
                      </span>
                    ) : (
                      "—"
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-0 pb-5">
                <div className="rounded-md bg-muted/20 px-4 py-4">
                  <Tabs defaultValue="columns">
                    <TabsList>
                      <TabsTrigger value="columns">Columns</TabsTrigger>
                      <TabsTrigger value="versions">Versions</TabsTrigger>
                    </TabsList>
                    <TabsContent value="columns" className="mt-4">
                      <ColumnsList columns={table.columns} />
                    </TabsContent>
                    <TabsContent value="versions" className="mt-4">
                      <VersionsList
                        versions={table.versions}
                        currentVersionId={table.current_version_id}
                      />
                    </TabsContent>
                  </Tabs>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}

export function DataTablesPanel({ projectId }: { projectId: string }) {
  const { data, isLoading, error, refetch } = useProjectTables(projectId);

  return (
    <Card id="tables">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Table2 className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold">Data Tables</h2>
          </div>
        </div>
        <div className="shrink-0 text-sm text-muted-foreground">
          {data ? formatCountLabel(data.length, "table") : "Loading tables"}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <PanelSkeleton>
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
          </PanelSkeleton>
        )}
        {error && (
          <PanelError
            title="Unable to load tables."
            error={error}
            onRetry={refetch}
          />
        )}
        {data && data.length === 0 && !isLoading && (
          <PanelEmpty message="No tables are available for this project yet." />
        )}
        {data && data.length > 0 && <TableAccordion tables={data} />}
      </CardContent>
    </Card>
  );
}
