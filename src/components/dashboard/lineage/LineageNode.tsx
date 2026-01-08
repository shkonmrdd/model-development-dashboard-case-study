"use client";

import * as React from "react";
import { Table2 } from "lucide-react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";
import type { LineageNode as LineageNodeType } from "./utils";

const nodeWidth = 240;
const nodeHeight = 40;

const LineageNode = React.memo(function LineageNode({
  data,
}: NodeProps<LineageNodeType>) {
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

export const nodeTypes = { lineageNode: LineageNode };
