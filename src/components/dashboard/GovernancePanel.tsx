"use client";

import { IconAlertTriangle } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectGovernance } from "@/lib/api/queries";

const listSkeletons = Array.from({ length: 3 });

export function GovernancePanel({ projectId }: { projectId: string }) {
  const { data, isLoading, error, refetch } = useProjectGovernance(projectId);

  return (
    <Card id="governance">
      <CardHeader>
        <h2 className="text-base font-semibold">Governance</h2>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading && (
          <div className="space-y-4">
            {listSkeletons.map((_, index) => (
              <Skeleton key={`gov-skeleton-${index}`} className="h-4 w-full" />
            ))}
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            <div className="flex items-center gap-2 font-medium">
              <IconAlertTriangle className="h-4 w-4" />
              Unable to load governance data.
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

        {data && !isLoading && (
          <>
            <div className="space-y-2">
              <p className="text-sm font-medium">Pending Approvals</p>
              {data.approvals.filter((approval) => approval.status === "Pending")
                .length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No pending approvals.
                </p>
              ) : (
                <div className="space-y-2">
                  {data.approvals
                    .filter((approval) => approval.status === "Pending")
                    .map((approval) => (
                      <div
                        key={approval.approval_id}
                        className="rounded-md border bg-background px-3 py-2 text-sm"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium">
                            {approval.approval_type}
                          </span>
                          <Badge variant="outline" className="rounded-full">
                            {approval.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Approver: {approval.approver?.name ?? "Unassigned"}
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Compliance Checklist</p>
              {data.compliance_checklist ? (
                <div className="space-y-2 rounded-md border bg-background px-3 py-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {data.compliance_checklist.template_name}
                    </span>
                    <Badge variant="outline" className="rounded-full">
                      {data.compliance_checklist.status}
                    </Badge>
                  </div>
                  <Progress
                    value={data.compliance_checklist.completion_percentage}
                  />
                  <p className="text-xs text-muted-foreground">
                    {data.compliance_checklist.completed_items} of{" "}
                    {data.compliance_checklist.total_items} items complete
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No compliance checklist assigned.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Stakeholders</p>
              {data.stakeholders.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No stakeholders assigned.
                </p>
              ) : (
                <div className="overflow-hidden rounded-md bg-muted/20">
                  <div className="divide-y divide-muted-foreground/10">
                    {data.stakeholders.map((stakeholder) => (
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
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
