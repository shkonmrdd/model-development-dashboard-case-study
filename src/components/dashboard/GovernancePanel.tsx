"use client";

import { ShieldCheck } from "lucide-react";
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
import { ApprovalsSection } from "./governance/ApprovalsSection";

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
  const approvals = data?.approvals ?? [];

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

            <ApprovalsSection approvals={approvals} />

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
