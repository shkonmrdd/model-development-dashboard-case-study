"use client";

import { useParams } from "next/navigation";

import { DashboardShell } from "@/components/dashboard-shell";
import { DataTablesPanel } from "@/components/dashboard/DataTablesPanel";
import { GovernancePanel } from "@/components/dashboard/GovernancePanel";
import { LineagePanel } from "@/components/dashboard/LineagePanel";
import { OperationsPanel } from "@/components/dashboard/OperationsPanel";
import { ProjectHeader } from "@/components/dashboard/ProjectHeader";
import { useProject } from "@/lib/api/queries";

export default function ProjectOverviewPage() {
  const params = useParams();
  const projectId =
    typeof params?.projectId === "string" ? params.projectId : "";
  const { data: project } = useProject(projectId);
  const breadcrumbLabel = project?.project_name || projectId || "Project";

  return (
    <DashboardShell
      breadcrumbs={[
        { label: "Projects", href: "/" },
        { label: breadcrumbLabel },
      ]}
    >
      <div className="px-4 lg:px-6">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          <ProjectHeader projectId={projectId} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <section
              className="space-y-6 lg:col-span-8"
              aria-label="Build and operations"
            >
              <DataTablesPanel projectId={projectId} />
              <LineagePanel projectId={projectId} />
              <OperationsPanel projectId={projectId} />
            </section>

            <section
              className="space-y-6 lg:col-span-4"
              aria-label="Governance"
            >
              <GovernancePanel projectId={projectId} />
            </section>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
