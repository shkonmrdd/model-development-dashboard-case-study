"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useProjectGovernance } from "@/lib/api/queries";
import { PanelEmpty, PanelError, PanelSkeleton } from "./PanelStates";

export function GovernancePanel({ projectId }: { projectId: string }) {
  const { data, isLoading, error, refetch } = useProjectGovernance(projectId);

  return (
    <Card id="governance">
      <CardHeader>
        <h2 className="text-base font-semibold">Governance</h2>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading && <PanelSkeleton rows={5} />}

        {error && (
          <PanelError
            title="Unable to load governance data."
            error={error}
            onRetry={refetch}
          />
        )}

        {data && !isLoading && (
          <>
            <div className="space-y-2">
              <p className="text-sm font-medium">Pending Approvals</p>
              {data.approvals.filter((approval) => approval.status === "Pending")
                .length === 0 ? (
                <PanelEmpty message="No pending approvals." />
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
                <PanelEmpty message="No compliance checklist assigned." />
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Stakeholders</p>
              {data.stakeholders.length === 0 ? (
                <PanelEmpty message="No stakeholders assigned." />
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
