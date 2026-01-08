import { Suspense } from "react";
import { ProjectsPage } from "@/components/projects/projects-page";

function ProjectsFallback() {
  return (
    <div className="px-4 lg:px-6">
      <div className="mx-auto w-full max-w-7xl py-10 text-sm text-muted-foreground">
        Loading projects...
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<ProjectsFallback />}>
      <ProjectsPage />
    </Suspense>
  );
}
