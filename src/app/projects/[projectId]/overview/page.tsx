"use client";

import { useParams } from "next/navigation";

import { DashboardShell } from "@/components/dashboard-shell";
import { DataTablesPanel } from "@/components/dashboard/DataTablesPanel";
import { ProjectHeader } from "@/components/dashboard/ProjectHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectOverviewPage() {
  const params = useParams();
  const projectId =
    typeof params?.projectId === "string" ? params.projectId : "";

  return (
    <DashboardShell
      breadcrumbs={[
        { label: "Projects", href: "/" },
        { label: projectId || "Project" },
      ]}
    >
      <div className="px-4 lg:px-6">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          <section className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold">Project Overview</h1>
            <p className="text-sm text-muted-foreground">
              Track tables, operations, governance, and lineage at a glance.
            </p>
          </section>

          <ProjectHeader projectId={projectId} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <section
              className="space-y-6 lg:col-span-8"
              aria-label="Build and operations"
            >
              <DataTablesPanel projectId={projectId} />

              <Card id="operations">
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div>
                    <h2 className="text-base font-semibold">Recent Operations</h2>
                    <p className="text-sm text-muted-foreground">Last 10</p>
                  </div>
                  <Skeleton className="h-5 w-20" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={`op-row-${index}`} className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </section>

            <section
              className="space-y-6 lg:col-span-4"
              aria-label="Governance and lineage"
            >
              <Card id="governance">
                <CardHeader>
                  <h2 className="text-base font-semibold">Governance</h2>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Pending Approvals</p>
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Compliance Checklist</p>
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Stakeholders</p>
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </CardContent>
              </Card>

              <Card id="lineage">
                <CardHeader>
                  <h2 className="text-base font-semibold">Lineage</h2>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <p className="text-xs font-medium uppercase text-muted-foreground">
                        Sources
                      </p>
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-medium uppercase text-muted-foreground">
                        Derived
                      </p>
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  </div>
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
