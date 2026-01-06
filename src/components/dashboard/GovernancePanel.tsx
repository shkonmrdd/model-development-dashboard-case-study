"use client";

import * as React from "react";
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  MessageSquareText,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useProjectGovernance } from "@/lib/api/queries";
import { cn } from "@/lib/utils";
import { PanelEmpty, PanelError, PanelSkeleton } from "./PanelStates";

function formatWhen(iso?: string | null) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
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

function checklistStatusTone(status?: string) {
  const normalized = (status ?? "").toLowerCase();
  if (normalized === "completed") {
    return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
  }
  if (normalized === "in_progress" || normalized === "in progress") {
    return "bg-primary/10 text-primary border-primary/20";
  }
  return "bg-muted text-foreground/80 border-border";
}

export function GovernancePanel({ projectId }: { projectId: string }) {
  const { data, isLoading, error, refetch } = useProjectGovernance(projectId);

  const stakeholders = data?.stakeholders ?? [];
  const checklist = data?.compliance_checklist ?? null;

  const sortedApprovals = React.useMemo(() => {
    const approvals = data?.approvals ?? [];
    return [...approvals].sort((a, b) =>
        String(b.created_at ?? "").localeCompare(String(a.created_at ?? ""))
    );
  }, [data?.approvals]);

  return (
    <Card id="governance" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-muted/80 blur-3xl" />
      </div>

      <CardHeader className="relative space-y-3">
        <div className="min-w-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Governance
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-6">
        {isLoading && <PanelSkeleton rows={5} />}

        {error && (
          <PanelError
            title="Unable to load governance data."
            error={error}
            onRetry={refetch}
          />
        )}

        {!isLoading && !error && data && (
          <>
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Compliance checklist</div>
              </div>

              {checklist ? (
                <div className="rounded-xl border bg-background/80 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="truncate font-medium">
                          {checklist.template_name}
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-full border text-[11px]",
                            checklistStatusTone(checklist.status)
                          )}
                        >
                          {checklist.status}
                        </Badge>
                      </div>
                      <div className="mt-1 space-y-1 text-xs text-muted-foreground">
                        <div>
                          Assigned to:{" "}
                          <span className="text-foreground/80">
                            {checklist.assigned_to?.name ?? "—"}
                          </span>
                        </div>
                        {checklist.completed_at ? (
                          <div>
                            Completed:{" "}
                            <span className="font-mono">
                              {formatWhen(checklist.completed_at)}
                            </span>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <div className="text-xs text-muted-foreground">Progress</div>
                      <div className="font-mono text-sm">
                        {checklist.completion_percentage}%
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <Progress value={checklist.completion_percentage} />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-mono">
                        {checklist.completed_items} / {checklist.total_items} items
                      </span>
                      <span>
                        {checklist.total_items - checklist.completed_items} remaining
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <PanelEmpty message="No compliance checklist assigned." />
              )}
            </section>

            <Separator />

            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Approvals</div>
              </div>

              {sortedApprovals.length === 0 ? (
                <PanelEmpty message="No approvals yet." />
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

            <Separator />

            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Stakeholders</div>
              </div>

              {stakeholders.length === 0 ? (
                <PanelEmpty message="No stakeholders assigned." />
              ) : (
                <div className="overflow-hidden rounded-md bg-muted/20">
                  <div className="divide-y divide-muted-foreground/10">
                    {stakeholders.map((stakeholder) => (
                      <div
                        key={stakeholder.user_id}
                        className="flex items-center justify-between px-3 py-2 text-sm"
                      >
                        <span className="font-medium">{stakeholder.name}</span>
                        <Badge
                          variant="secondary"
                          className="rounded-full text-xs"
                        >
                          {stakeholder.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

          </>
        )}
      </CardContent>
    </Card>
  );
}
