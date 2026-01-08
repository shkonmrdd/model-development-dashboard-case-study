"use client";

import { Table2 } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectTables } from "@/lib/api/queries";
import { PanelEmpty, PanelError, PanelSkeleton } from "./PanelStates";
import { TableAccordion } from "./dataTables/TableAccordion";

const rowSkeletons = Array.from({ length: 4 });

const pluralRules = new Intl.PluralRules();
const numberFormat = new Intl.NumberFormat();

function formatCountLabel(count: number, singular: string, plural = `${singular}s`) {
  const label = pluralRules.select(count) === "one" ? singular : plural;
  return `${numberFormat.format(count)} ${label}`;
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
