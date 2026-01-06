"use client";

import type { ReactNode } from "react";
import { IconAlertTriangle } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type PanelSkeletonProps = {
  rows?: number;
  className?: string;
  children?: ReactNode;
};

export function PanelSkeleton({
  rows = 3,
  className,
  children,
}: PanelSkeletonProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {children ??
        Array.from({ length: rows }).map((_, index) => (
          <Skeleton key={`panel-skeleton-${index}`} className="h-4 w-full" />
        ))}
    </div>
  );
}

type PanelErrorProps = {
  title?: string;
  error?: unknown;
  onRetry?: () => void;
  className?: string;
};

export function PanelError({
  title = "Unable to load data.",
  error,
  onRetry,
  className,
}: PanelErrorProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive",
        className
      )}
    >
      <div className="flex items-center gap-2 font-medium">
        <IconAlertTriangle className="h-4 w-4" />
        {title}
      </div>
      <p className="text-muted-foreground">
        {error instanceof Error ? error.message : "Unknown error"}
      </p>
      {onRetry ? (
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={onRetry}
        >
          Retry
        </Button>
      ) : null}
    </div>
  );
}

type PanelEmptyProps = {
  message: string;
  className?: string;
};

export function PanelEmpty({ message, className }: PanelEmptyProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground",
        className
      )}
    >
      {message}
    </div>
  );
}
