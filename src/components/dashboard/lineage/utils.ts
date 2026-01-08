import type { Node } from "@xyflow/react";
import type { TableLineageEdge } from "@/lib/types";

export type HighlightState = {
  nodes: Set<string>;
  edges: Set<string>;
};

export type LineageNodeData = {
  label: string;
  tableName: string;
  tableType: "source" | "derived";
  isActive: boolean;
  isHighlighted: boolean;
  isDimmed: boolean;
  onSelect: (tableName: string) => void;
};

export type LineageNode = Node<LineageNodeData, "lineageNode">;

export const getEdgeId = (edge: TableLineageEdge) =>
  `${edge.parent_table}->${edge.child_table}`;

export const buildUpstream = (
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
