"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const tableSkeletonRows = Array.from({ length: 5 });
const listSkeletonRows = Array.from({ length: 4 });

export default function ProjectOverviewPage() {
  const isMocking = process.env.NEXT_PUBLIC_API_MOCKING === "true";

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-6 py-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Model Dashboard
            </p>
            <p className="text-lg font-semibold">Project Overview</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              All Projects
            </Link>
          </div>
        </header>

        <Card>
          <CardHeader className="gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold">
                <span className="sr-only">Project name</span>
                <Skeleton className="h-8 w-64" />
              </h1>
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-44" />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full max-w-2xl" />
              <Skeleton className="h-4 w-4/5 max-w-xl" />
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <section
            className="space-y-6 lg:col-span-8"
            aria-label="Build and operations"
          >
            <Card>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold">Data Tables</h2>
                  <div className="text-sm text-muted-foreground">
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
                <Skeleton className="h-5 w-16" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-12 gap-3 text-xs text-muted-foreground">
                  <span className="col-span-4">Name</span>
                  <span className="col-span-2">Type</span>
                  <span className="col-span-2">Version</span>
                  <span className="col-span-2">Rows/Cols</span>
                  <span className="col-span-2">Checkpoint</span>
                </div>
                <div className="space-y-3">
                  {tableSkeletonRows.map((_, index) => (
                    <div
                      key={`table-row-${index}`}
                      className="grid grid-cols-12 items-center gap-3"
                    >
                      <Skeleton className="col-span-4 h-4" />
                      <Skeleton className="col-span-2 h-4" />
                      <Skeleton className="col-span-2 h-4" />
                      <Skeleton className="col-span-2 h-4" />
                      <Skeleton className="col-span-2 h-4" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold">Recent Operations</h2>
                  <p className="text-sm text-muted-foreground">Last 10</p>
                </div>
                <Skeleton className="h-5 w-20" />
              </CardHeader>
              <CardContent className="space-y-4">
                {listSkeletonRows.map((_, index) => (
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
            <Card>
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

            <Card>
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
  );
}
