"use client";

import * as React from "react";
import { Merge } from "lucide-react";
import {
  MarkerType,
  type NodeMouseHandler,
  ReactFlow,
  type Edge,
  type ReactFlowInstance,
} from "@xyflow/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useProjectLineage, useProjectTables } from "@/lib/api/queries";
import { PanelEmpty, PanelError, PanelSkeleton } from "./PanelStates";
import { nodeTypes } from "./lineage/LineageNode";
import {
  buildUpstream,
  getEdgeId,
  type LineageNode as LineageNodeType,
} from "./lineage/utils";

const rowHeight = 44;
const listSkeletons = Array.from({ length: 4 });

export function LineagePanel({ projectId }: { projectId: string }) {
  const {
    data: tables,
    isLoading: tablesLoading,
    error: tablesError,
    refetch: refetchTables,
  } = useProjectTables(projectId);
  const {
    data: edges,
    isLoading: edgesLoading,
    error,
    refetch,
  } = useProjectLineage(projectId);
  const combinedError = tablesError ?? error;
  const handleRetry = React.useCallback(() => {
    refetchTables();
    refetch();
  }, [refetch, refetchTables]);

  const [selected, setSelected] = React.useState<string | null>(null);
  const [rf, setRf] = React.useState<ReactFlowInstance<
    LineageNodeType,
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

  const handleNodeClick = React.useCallback<
    NodeMouseHandler<LineageNodeType>
  >(
    (_event, node) => {
      handleSelect(node.id);
    },
    [handleSelect]
  );

  const nodes: LineageNodeType[] = React.useMemo(() => {
    const leftX = 0;
    const rightX = 360;

    const sourceNodes: LineageNodeType[] = sources.map((t, idx) => {
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

    const derivedNodes: LineageNodeType[] = derived.map((t, idx) => {
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

        {combinedError && (
          <PanelError
            title="Unable to load lineage data."
            error={combinedError}
            onRetry={handleRetry}
          />
        )}

        {!combinedError &&
          !edgesLoading &&
          !tablesLoading &&
          edges &&
          edges.length === 0 && (
          <PanelEmpty message="No lineage defined for this project." />
        )}

        {!combinedError &&
          !edgesLoading &&
          !tablesLoading &&
          edges &&
          edges.length > 0 && (
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

                <ReactFlow<LineageNodeType, Edge>
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
