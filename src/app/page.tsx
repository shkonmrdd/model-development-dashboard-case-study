"use client";

import Link from "next/link";
import { useProjects } from "@/lib/api/queries";

export default function Home() {
  const { data, isLoading, error, refetch } = useProjects();

  return (
    <div className="min-h-screen p-6">
      <header className="mb-4">
        <p className="text-sm text-muted-foreground">
          Model Development Dashboard
        </p>
        <h1 className="text-2xl font-semibold">Projects</h1>
      </header>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Loading projects...</p>
      )}

      {error && (
        <div className="space-y-2 text-sm">
          <p className="font-medium text-destructive">
            Unable to load projects.
          </p>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
          <button type="button" className="underline" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      )}

      {data && (
        <ul className="space-y-2 text-sm">
          {data.map((project) => (
            <li key={project.project_id} className="border-b pb-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-muted-foreground">
                    {project.project_type} · {project.status}
                  </p>
                  <p className="font-medium">{project.project_name}</p>
                </div>
                <Link
                  href={`/projects/${project.project_id}/overview`}
                  className="underline"
                >
                  Open
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
