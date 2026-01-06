"use client";

export function ProjectListHeader() {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold leading-none">Projects</h1>
        <p className="text-sm text-muted-foreground">
          Track model development work across teams.
        </p>
      </div>
    </div>
  );
}
