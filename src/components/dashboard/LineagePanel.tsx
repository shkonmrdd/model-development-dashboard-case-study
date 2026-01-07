"use client";

import * as React from "react";
import { Merge, Table2 } from "lucide-react";
import {
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
  type ReactFlowInstance,
} from "@xyflow/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useProjectLineage, useProjectTables } from "@/lib/api/queries";
import type { TableLineageEdge } from "@/lib/types";
import { PanelEmpty, PanelError, PanelSkeleton } from "./PanelStates";

const rowHeight = 44;
const nodeWidth = 240;
const nodeHeight = 40;
const listSkeletons = Array.from({ length: 4 });

type HighlightState = {
  nodes: Set<string>;
  edges: Set<string>;
};

type LineageNodeData = {
  label: string;
  tableName: string;
  tableType: "source" | "derived";
  isActive: boolean;
  isHighlighted: boolean;
  onSelect: (tableName: string) => void;
};

type LineageNode = Node<LineageNodeData, "lineageNode">;

const getEdgeId = (edge: TableLineageEdge) =>
  `${edge.parent_table}->${edge.child_table}`;

const buildUpstream = (
  edges: TableLineageEdge[],
  selected: string | null
): HighlightState => {
  if (!selected) return { nodes: new Set(), edges: new Set() };

  const nodes = new Set<string>([selected]);
  const edgeIds = new Set<string>();
  const stack = [selected];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;

    edges
      .filter((edge) => edge.child_table === current)
      .forEach((edge) => {
        edgeIds.add(getEdgeId(edge));
        if (!nodes.has(edge.parent_table)) {
          nodes.add(edge.parent_table);
          stack.push(edge.parent_table);
        }
      });
  }

  return { nodes, edges: edgeIds };
};

const LineageNode = React.memo(function LineageNode({
  data,
}: NodeProps<LineageNode>) {
  return (
    <button
      type="button"
      onClick={() => data.onSelect(data.tableName)}
      className={cn(
        "nodrag nopan flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition",
        data.isHighlighted
          ? "border-primary/60 bg-primary/5 text-primary"
          : "bg-background hover:bg-muted/40",
        data.isActive && "ring-2 ring-primary/40"
      )}
      style={{ width: nodeWidth, height: nodeHeight }}
    >
      <Table2
        className={cn(
          "h-4 w-4 shrink-0",
          data.isHighlighted
            ? "text-primary"
            : data.tableType === "source"
            ? "text-emerald-500/70"
            : "text-sky-500/70"
        )}
      />
      <span className="min-w-0 flex-1 truncate">{data.label}</span>
      <Handle
        type="target"
        position={Position.Left}
        className="pointer-events-none h-2 w-2 !border-0 !bg-transparent"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="pointer-events-none h-2 w-2 !border-0 !bg-transparent"
      />
    </button>
  );
});

const nodeTypes = { lineageNode: LineageNode };

export function LineagePanel({ projectId }: { projectId: string }) {
  const { data: tables, isLoading: tablesLoading } = useProjectTables(projectId);
  const {
    data: edges,
    isLoading: edgesLoading,
    error,
    refetch,
  } = useProjectLineage(projectId);

  const [selected, setSelected] = React.useState<string | null>(null);
  const [rf, setRf] = React.useState<ReactFlowInstance | null>(null);

  const sources = React.useMemo(
    () => (tables ?? []).filter((t) => t.table_type === "source"),
    [tables]
  );
  const derived = React.useMemo(
    () => (tables ?? []).filter((t) => t.table_type === "derived"),
    [tables]
  );

  const tableLabel = React.useMemo(() => {
    const map = new Map<string, string>();
    (tables ?? []).forEach((t) => map.set(t.table_name, t.display_name));
    return map;
  }, [tables]);

  const highlight = React.useMemo(
    () => buildUpstream(edges ?? [], selected),
    [edges, selected]
  );

  const handleSelect = React.useCallback((tableName: string) => {
    setSelected((prev) => (prev === tableName ? null : tableName));
  }, []);

  const nodes: LineageNode[] = React.useMemo(() => {
    const leftX = 0;
    const rightX = 360;

    const sourceNodes: LineageNode[] = sources.map((t, idx) => ({
      id: t.table_name,
      type: "lineageNode",
      position: { x: leftX, y: idx * rowHeight },
      data: {
        tableName: t.table_name,
        label: t.display_name,
        tableType: "source",
        isActive: selected === t.table_name,
        isHighlighted: highlight.nodes.has(t.table_name),
        onSelect: handleSelect,
      },
      draggable: false,
      selectable: false,
    }));

    const derivedNodes: LineageNode[] = derived.map((t, idx) => ({
      id: t.table_name,
      type: "lineageNode",
      position: { x: rightX, y: idx * rowHeight },
      data: {
        tableName: t.table_name,
        label: tableLabel.get(t.table_name) ?? t.table_name,
        tableType: "derived",
        isActive: selected === t.table_name,
        isHighlighted: highlight.nodes.has(t.table_name),
        onSelect: handleSelect,
      },
      draggable: false,
      selectable: false,
    }));

    return [...sourceNodes, ...derivedNodes];
  }, [sources, derived, tableLabel, selected, highlight.nodes, handleSelect]);

  const flowEdges: Edge[] = React.useMemo(() => {
    const strokeMuted = "var(--muted-foreground)";
    const strokePrimary = "var(--primary)";

    const nodeIds = new Set(nodes.map((n) => n.id));

    return (edges ?? [])
      .filter((e) => nodeIds.has(e.parent_table) && nodeIds.has(e.child_table))
      .map((e) => {
        const id = getEdgeId(e);
        const isActive = highlight.edges.has(id);

        return {
          id,
          source: e.parent_table,
          target: e.child_table,
          type: "smoothstep",
          markerEnd: { type: MarkerType.ArrowClosed },
          style: {
            stroke: isActive ? strokePrimary : strokeMuted,
            strokeWidth: isActive ? 2 : 1,
          },
        };
      });
  }, [edges, nodes, highlight.edges]);

  React.useEffect(() => {
    if (!rf) return;
    rf.fitView({ padding: 0.2, duration: 250 });
  }, [rf, nodes.length, flowEdges.length]);

  const canvasHeight =
    Math.max(sources.length, derived.length) * rowHeight + rowHeight;

  return (
    <Card id="lineage" className="gap-1">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Merge className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold">Lineage</h2>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {(tablesLoading || edgesLoading) && (
          <PanelSkeleton>
            {listSkeletons.map((_, index) => (
              <Skeleton
                key={`lineage-skeleton-${index}`}
                className="h-8 w-full"
              />
            ))}
            <Skeleton className="h-24 w-full" />
          </PanelSkeleton>
        )}

        {error && (
          <PanelError
            title="Unable to load lineage."
            error={error}
            onRetry={refetch}
          />
        )}

        {!edgesLoading && !tablesLoading && edges && edges.length === 0 && (
          <PanelEmpty message="No lineage defined for this project." />
        )}

        {!edgesLoading && !tablesLoading && edges && edges.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Click a table to highlight upstream dependencies.
            </p>

            <div className="rounded-md border bg-background">
              <div
                className="relative"
                style={{ height: Math.max(220, canvasHeight) }}
              >
                <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">
                  <span>Sources</span>
                  <span>Derived</span>
                </div>

                <ReactFlow
                  nodes={nodes}
                  edges={flowEdges}
                  nodeTypes={nodeTypes}
                  onInit={setRf}
                  nodesDraggable={false}
                  nodesConnectable={false}
                  elementsSelectable={false}
                  panOnDrag={false}
                  zoomOnScroll={false}
                  fitView
                >
                </ReactFlow>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
