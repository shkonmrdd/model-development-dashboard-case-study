import * as React from "react"

import { cn } from "@/lib/utils"

const clamp = (value: number) => Math.min(Math.max(value, 0), 100)

const Progress = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { value?: number }
>(({ className, value = 0, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "bg-muted relative h-2 w-full overflow-hidden rounded-full",
      className
    )}
    {...props}
  >
    <div
      className="bg-primary h-full transition-[width]"
      style={{ width: `${clamp(value)}%` }}
    />
  </div>
))
Progress.displayName = "Progress"

export { Progress }
