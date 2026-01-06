"use client";

import * as React from "react";
import { IconAlertTriangle } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useProjectLineage, useProjectTables } from "@/lib/api/queries";
import type { TableLineageEdge } from "@/lib/types";

const rowHeight = 44;
const listSkeletons = Array.from({ length: 4 });

type HighlightState = {
  nodes: Set<string>;
  edges: Set<string>;
};

const getEdgeKey = (edge: TableLineageEdge) =>
  `${edge.child_table}<- ${edge.parent_table}`;

const buildUpstream = (
  edges: TableLineageEdge[],
  selected: string | null
): HighlightState => {
  if (!selected) {
    return { nodes: new Set(), edges: new Set() };
  }

  const nodes = new Set<string>([selected]);
  const edgeKeys = new Set<string>();
  const stack = [selected];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;

    edges
      .filter((edge) => edge.child_table === current)
      .forEach((edge) => {
        const key = getEdgeKey(edge);
        edgeKeys.add(key);
        if (!nodes.has(edge.parent_table)) {
          nodes.add(edge.parent_table);
          stack.push(edge.parent_table);
        }
      });
  }

  return { nodes, edges: edgeKeys };
};

export function LineagePanel({ projectId }: { projectId: string }) {
  const { data: tables, isLoading: tablesLoading } = useProjectTables(projectId);
  const {
    data: edges,
    isLoading: edgesLoading,
    error,
    refetch,
  } = useProjectLineage(projectId);
  const [selected, setSelected] = React.useState<string | null>(null);

  const sources = React.useMemo(
    () => (tables ?? []).filter((table) => table.table_type === "source"),
    [tables]
  );
  const derived = React.useMemo(
    () => (tables ?? []).filter((table) => table.table_type === "derived"),
    [tables]
  );

  const tableMap = React.useMemo(() => {
    const map = new Map<string, string>();
    (tables ?? []).forEach((table) => {
      map.set(table.table_name, table.display_name);
    });
    return map;
  }, [tables]);

  const highlight = React.useMemo(
    () => buildUpstream(edges ?? [], selected),
    [edges, selected]
  );

  const svgHeight = Math.max(sources.length, derived.length) * rowHeight || 1;

  const sourceIndex = (tableName: string) =>
    sources.findIndex((table) => table.table_name === tableName);
  const derivedIndex = (tableName: string) =>
    derived.findIndex((table) => table.table_name === tableName);

  const handleSelect = (tableName: string) => {
    setSelected((prev) => (prev === tableName ? null : tableName));
  };

  return (
    <Card id="lineage">
      <CardHeader>
        <h2 className="text-base font-semibold">Lineage</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        {(tablesLoading || edgesLoading) && (
          <div className="space-y-3">
            {listSkeletons.map((_, index) => (
              <Skeleton key={`lineage-skeleton-${index}`} className="h-8 w-full" />
            ))}
            <Skeleton className="h-24 w-full" />
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            <div className="flex items-center gap-2 font-medium">
              <IconAlertTriangle className="h-4 w-4" />
              Unable to load lineage.
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

        {!edgesLoading && !tablesLoading && edges && edges.length === 0 && (
          <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
            No lineage defined for this project.
          </div>
        )}

        {!edgesLoading && !tablesLoading && edges && edges.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Click a table to highlight upstream dependencies.
            </p>
            <div className="grid grid-cols-[1fr_auto_1fr] gap-3">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Sources
                </p>
                {sources.map((table) => {
                  const isActive = selected === table.table_name;
                  const isHighlighted = highlight.nodes.has(table.table_name);

                  return (
                    <button
                      key={table.table_name}
                      type="button"
                      onClick={() => handleSelect(table.table_name)}
                      className={cn(
                        "w-full rounded-md border px-3 py-2 text-left text-sm transition",
                        isHighlighted
                          ? "border-primary/60 bg-primary/5 text-primary"
                          : "bg-background hover:bg-muted/40",
                        isActive && "ring-2 ring-primary/40"
                      )}
                    >
                      {table.display_name}
                    </button>
                  );
                })}
              </div>

              <div className="relative flex items-center justify-center">
                <svg
                  width={120}
                  height={svgHeight}
                  viewBox={`0 0 120 ${svgHeight}`}
                >
                  {(edges ?? []).map((edge) => {
                    const sourceIdx = sourceIndex(edge.parent_table);
                    const derivedIdx = derivedIndex(edge.child_table);
                    if (sourceIdx === -1 || derivedIdx === -1) return null;

                    const y1 = sourceIdx * rowHeight + rowHeight / 2;
                    const y2 = derivedIdx * rowHeight + rowHeight / 2;
                    const isActive = highlight.edges.has(getEdgeKey(edge));

                    return (
                      <line
                        key={getEdgeKey(edge)}
                        x1={0}
                        y1={y1}
                        x2={120}
                        y2={y2}
                        stroke={isActive ? "currentColor" : "#cbd5f5"}
                        strokeWidth={isActive ? 2 : 1}
                        className={cn(
                          isActive ? "text-primary" : "text-muted-foreground"
                        )}
                        strokeLinecap="round"
                      />
                    );
                  })}
                </svg>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Derived
                </p>
                {derived.map((table) => {
                  const isActive = selected === table.table_name;
                  const isHighlighted = highlight.nodes.has(table.table_name);

                  return (
                    <button
                      key={table.table_name}
                      type="button"
                      onClick={() => handleSelect(table.table_name)}
                      className={cn(
                        "w-full rounded-md border px-3 py-2 text-left text-sm transition",
                        isHighlighted
                          ? "border-primary/60 bg-primary/5 text-primary"
                          : "bg-background hover:bg-muted/40",
                        isActive && "ring-2 ring-primary/40"
                      )}
                    >
                      {tableMap.get(table.table_name) ?? table.table_name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
