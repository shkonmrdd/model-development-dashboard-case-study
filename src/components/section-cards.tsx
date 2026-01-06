import type { Icon } from "@tabler/icons-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

type SummaryBadge = {
  label: string
  icon?: Icon
  className?: string
}

type SummaryCard = {
  title: string
  value: string | number
  helper: string
  badge?: SummaryBadge
  tone?: "slate" | "emerald" | "amber" | "sky"
}

type SectionCardsProps = {
  cards: SummaryCard[]
  isLoading?: boolean
}

const skeletonCards = Array.from({ length: 4 })

const toneStyles: Record<
  NonNullable<SummaryCard["tone"]>,
  { card: string; glow: string }
> = {
  slate: {
    card: "from-slate-50/90 via-white to-white border-slate-200/70",
    glow: "bg-slate-200/40",
  },
  emerald: {
    card: "from-emerald-50/70 via-white to-white border-emerald-200/60",
    glow: "bg-emerald-200/40",
  },
  amber: {
    card: "from-amber-50/70 via-white to-white border-amber-200/60",
    glow: "bg-amber-200/40",
  },
  sky: {
    card: "from-sky-50/70 via-white to-white border-sky-200/60",
    glow: "bg-sky-200/40",
  },
}

export function SectionCards({ cards, isLoading }: SectionCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {skeletonCards.map((_, index) => (
          <Card key={`summary-skeleton-${index}`}>
            <CardHeader className="gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-24" />
            </CardHeader>
            <CardFooter>
              <Skeleton className="h-4 w-40" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  if (!cards.length) {
    return null
  }

  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {cards.map((card) => {
        const BadgeIcon = card.badge?.icon
        const tone = card.tone ? toneStyles[card.tone] : undefined

        return (
          <Card
            key={card.title}
            className={cn(
              "@container/card relative overflow-hidden border bg-linear-to-br",
              tone?.card ?? "from-muted/40 via-white to-white"
            )}
          >
            <div
              className={cn(
                "pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl",
                tone?.glow ?? "bg-muted/40"
              )}
              aria-hidden="true"
            />
            <CardHeader className="gap-2">
              <div className="flex items-center justify-between gap-2">
                <CardDescription className="text-xs font-semibold uppercase tracking-wide">
                  {card.title}
                </CardDescription>
                {card.badge ? (
                  <Badge
                    variant="outline"
                    className={cn("gap-1", card.badge.className)}
                  >
                    {BadgeIcon ? <BadgeIcon className="size-3" /> : null}
                    {card.badge.label}
                  </Badge>
                ) : null}
              </div>
              <CardTitle className="text-3xl font-semibold tabular-nums @[250px]/card:text-4xl">
                {card.value}
              </CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">
              {card.helper}
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
