import type { OperationLog } from "@/lib/types";
import { Binary, Columns3, Database, GitMerge, Sparkles, Table2 } from "lucide-react";

const pluralRules = new Intl.PluralRules();
export const numberFormat = new Intl.NumberFormat();

export type OpFilter =
  | "all"
  | "column_action"
  | "table_action"
  | "table_operation"
  | "other";

export const filterOptions: Array<{ value: OpFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "column_action", label: "Column" },
  { value: "table_action", label: "Table" },
  { value: "table_operation", label: "Ops" },
  { value: "other", label: "Other" },
];

export const MAX_VISIBLE = 20;

export function formatDateLabel(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

export function getLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function opIcon(op: OperationLog) {
  const name = op.operation_name.toLowerCase();
  if (name.includes("merge")) return GitMerge;
  if (name.includes("upload")) return Database;
  if (op.operation_type === "column_action") return Columns3;
  if (op.operation_type === "table_action") return Table2;
  if (op.operation_type === "table_operation") return Binary;
  return Sparkles;
}

export function sortOperations(operations: OperationLog[]) {
  return [...operations].sort((a, b) =>
    b.execution_timestamp.localeCompare(a.execution_timestamp)
  );
}

export function formatCountLabel(count: number, singular: string, plural = `${singular}s`) {
  const label = pluralRules.select(count) === "one" ? singular : plural;
  return `${numberFormat.format(count)} ${label}`;
}
