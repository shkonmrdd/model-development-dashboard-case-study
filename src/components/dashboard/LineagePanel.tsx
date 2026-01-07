"use client";

import * as React from "react";
import { Merge, Table2 } from "lucide-react";
import {
  Handle,
  MarkerType,
  type NodeMouseHandler,
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
  isDimmed: boolean;
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
      onClick={(event) => {
        event.stopPropagation();
        data.onSelect(data.tableName);
      }}
      className={cn(
        "nodrag nopan flex w-full cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition",
        data.isHighlighted
          ? "border-primary/60 bg-primary/5 text-primary"
          : "bg-background hover:bg-muted/40",
        data.isDimmed && "opacity-45",
        data.isActive && "ring-2 ring-primary/40"
      )}
      style={{ width: nodeWidth, height: nodeHeight }}
    >
      <span
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
          data.isHighlighted
            ? "bg-primary/10 text-primary"
            : data.tableType === "source"
            ? "bg-indigo-50 text-indigo-700"
            : "bg-fuchsia-50 text-fuchsia-700"
        )}
      >
        <Table2 className="h-3.5 w-3.5" />
      </span>
      <span className="min-w-0 flex-1 truncate">{data.label}</span>
      <Handle
        type="target"
        position={Position.Left}
        className="pointer-events-none h-2 w-2 border-0! bg-transparent!"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="pointer-events-none h-2 w-2 border-0! bg-transparent!"
      />
    </button>
  );
});

const nodeTypes = { lineageNode: LineageNode };

export function LineagePanel({ projectId }: { projectId: string }) {
  const { data: tables, isLoading: tablesLoading } =
    useProjectTables(projectId);
  const {
    data: edges,
    isLoading: edgesLoading,
    error,
    refetch,
  } = useProjectLineage(projectId);

  const [selected, setSelected] = React.useState<string | null>(null);
  const [rf, setRf] = React.useState<ReactFlowInstance<
    LineageNode,
    Edge
  > | null>(null);
  const flowWrapperRef = React.useRef<HTMLDivElement | null>(null);

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

  const handleNodeClick = React.useCallback<NodeMouseHandler<LineageNode>>(
    (_event, node) => {
      handleSelect(node.id);
    },
    [handleSelect]
  );

  const nodes: LineageNode[] = React.useMemo(() => {
    const leftX = 0;
    const rightX = 360;

    const sourceNodes: LineageNode[] = sources.map((t, idx) => {
      const isActive = selected === t.table_name;
      const isHighlighted = highlight.nodes.has(t.table_name);

      return {
        id: t.table_name,
        type: "lineageNode",
        position: { x: leftX, y: idx * rowHeight },
        data: {
          tableName: t.table_name,
          label: t.display_name,
          tableType: "source",
          isActive,
          isHighlighted,
          isDimmed: selected !== null && !isHighlighted && !isActive,
          onSelect: handleSelect,
        },
        draggable: false,
        selectable: false,
      };
    });

    const derivedNodes: LineageNode[] = derived.map((t, idx) => {
      const isActive = selected === t.table_name;
      const isHighlighted = highlight.nodes.has(t.table_name);

      return {
        id: t.table_name,
        type: "lineageNode",
        position: { x: rightX, y: idx * rowHeight },
        data: {
          tableName: t.table_name,
          label: tableLabel.get(t.table_name) ?? t.table_name,
          tableType: "derived",
          isActive,
          isHighlighted,
          isDimmed: selected !== null && !isHighlighted && !isActive,
          onSelect: handleSelect,
        },
        draggable: false,
        selectable: false,
      };
    });

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
            opacity: selected ? (isActive ? 1 : 0.2) : 1,
          },
        };
      });
  }, [edges, nodes, highlight.edges, selected]);

  React.useEffect(() => {
    if (!rf) return;
    rf.fitView({ padding: 0.2, duration: 250 });
  }, [rf, nodes.length, flowEdges.length]);

  React.useEffect(() => {
    if (!rf || !flowWrapperRef.current) return;

    const element = flowWrapperRef.current;
    let frameId = 0;
    const observer = new ResizeObserver(() => {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        rf.fitView({ padding: 0.2 });
      });
    });

    observer.observe(element);

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, [rf]);

  const canvasHeight =
    Math.max(sources.length, derived.length) * rowHeight + rowHeight;
  const hasEdges = !!edges && edges.length > 0;

  return (
    <Card id="lineage" className={cn("gap-1", hasEdges && "pb-0")}>
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

            <div className="rounded-md bg-background">
              <div
                ref={flowWrapperRef}
                className="relative"
                style={{ height: Math.max(220, canvasHeight) }}
              >
                <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">
                  <span>Sources</span>
                  <span>Derived</span>
                </div>

                <ReactFlow<LineageNode, Edge>
                  nodes={nodes}
                  edges={flowEdges}
                  nodeTypes={nodeTypes}
                  onInit={setRf}
                  onNodeClick={handleNodeClick}
                  proOptions={{ hideAttribution: true }}
                  nodesDraggable={false}
                  nodesConnectable={false}
                  elementsSelectable={false}
                  panOnDrag={false}
                  zoomOnScroll={false}
                  preventScrolling={false}
                  fitViewOptions={{ padding: 0.2 }}
                  fitView
                ></ReactFlow>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
