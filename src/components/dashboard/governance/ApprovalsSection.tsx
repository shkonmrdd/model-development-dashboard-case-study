"use client";

import * as React from "react";
import { CheckCircle2, Clock, MessageSquareText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { Approval } from "@/lib/types";
import { PanelEmpty } from "../PanelStates";

interface ApprovalsSectionProps {
  approvals: Approval[];
}

function formatDate(iso?: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatTime(iso?: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function humanizeCamelCase(input: string) {
  return input
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function approvalStatusTone(status?: string) {
  const normalized = (status ?? "").toLowerCase();
  if (normalized === "pending") {
    return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
  }
  if (normalized === "approved") {
    return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
  }
  if (normalized === "rejected") {
    return "bg-destructive/10 text-destructive border-destructive/20";
  }
  return "bg-muted text-foreground/80 border-border";
}

export function ApprovalsSection({ approvals }: ApprovalsSectionProps) {
  const [pendingOnly, setPendingOnly] = React.useState(true);

  const hasNonPending = React.useMemo(
    () =>
      approvals.some(
        (approval) => (approval.status ?? "").toLowerCase() !== "pending"
      ),
    [approvals]
  );

  const filteredApprovals = React.useMemo(() => {
    if (!pendingOnly) return approvals;
    return approvals.filter(
      (approval) => (approval.status ?? "").toLowerCase() === "pending"
    );
  }, [approvals, pendingOnly]);

  const sortedApprovals = React.useMemo(() => {
    return [...filteredApprovals].sort((a, b) =>
      String(b.created_at ?? "").localeCompare(String(a.created_at ?? ""))
    );
  }, [filteredApprovals]);

  const approvalsEmptyMessage =
    approvals.length === 0
      ? "No approvals yet."
      : pendingOnly
      ? "No pending approvals."
      : "No approvals match this filter.";

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Approvals</div>
        {hasNonPending ? (
          <div className="flex items-center gap-2">
            <Checkbox
              id="approvals-pending-only"
              checked={pendingOnly}
              onCheckedChange={(checked) => setPendingOnly(checked === true)}
              className="bg-background data-[state=unchecked]:bg-background data-[state=checked]:bg-white data-[state=checked]:border-primary/40 data-[state=checked]:text-primary dark:data-[state=checked]:bg-white"
            />
            <Label
              htmlFor="approvals-pending-only"
              className="text-xs text-muted-foreground"
              title="Show pending approvals only"
            >
              Pending only
            </Label>
          </div>
        ) : null}
      </div>

      {sortedApprovals.length === 0 ? (
        <PanelEmpty message={approvalsEmptyMessage} />
      ) : (
        <div className="space-y-2">
          {sortedApprovals.map((approval) => {
            const isPending =
              (approval.status ?? "").toLowerCase() === "pending";
            const LeftIcon = isPending ? Clock : CheckCircle2;

            return (
              <div
                key={approval.approval_id}
                className={cn(
                  "rounded-xl border bg-background/80 shadow-sm transition",
                  "hover:-translate-y-px hover:shadow-md"
                )}
              >
                <div className="flex items-start gap-3 border-b border-muted/40 p-3">
                  <div
                    className={cn(
                      "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
                      approvalStatusTone(approval.status)
                    )}
                  >
                    <LeftIcon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="truncate font-medium">
                            {humanizeCamelCase(
                              approval.approval_type ?? "Approval"
                            )}
                          </div>
                          <Badge
                            variant="outline"
                            className={cn(
                              "rounded-full border text-[11px]",
                              approvalStatusTone(approval.status)
                            )}
                          >
                            {approval.status ?? "—"}
                          </Badge>
                        </div>
                      </div>

                      <div className="shrink-0 text-right text-xs text-muted-foreground">
                        <div className="font-mono">
                          <div>{formatDate(approval.created_at)}</div>
                          <div className="text-[11px] text-muted-foreground">
                            {formatTime(approval.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 p-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        <span>Approver</span>
                      </div>
                      <div className="mt-1 text-sm font-medium text-foreground">
                        {approval.approver?.name ?? "Unassigned"}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        <span>Requested by</span>
                      </div>
                      <div className="mt-1 text-sm font-medium text-foreground">
                        {approval.requested_by?.name ?? "—"}
                      </div>
                    </div>
                  </div>

                  {approval.comments ? (
                    <div className="rounded-lg border bg-muted/30 p-3 text-xs">
                      <div className="mb-1 inline-flex items-center gap-2 text-muted-foreground">
                        <MessageSquareText className="h-3.5 w-3.5" />
                        Comment
                      </div>
                      <div className="text-foreground/80">
                        {approval.comments}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
