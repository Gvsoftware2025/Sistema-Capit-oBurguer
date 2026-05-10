"use client"

import { Flame, Clock, ChefHat, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsBarProps {
  total: number
  novos: number
  preparando: number
  prontos: number
}

export function StatsBar({ total, novos, preparando, prontos }: StatsBarProps) {
  const stats = [
    {
      label: "TOTAL",
      value: total,
      icon: Flame,
      color: "text-red-500",
      bg: "bg-red-500/15",
      border: "border-red-500/30",
    },
    {
      label: "NOVOS",
      value: novos,
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-500/15",
      border: "border-amber-500/30",
    },
    {
      label: "PREPARANDO",
      value: preparando,
      icon: ChefHat,
      color: "text-yellow-500",
      bg: "bg-yellow-500/15",
      border: "border-yellow-500/30",
    },
    {
      label: "PRONTOS",
      value: prontos,
      icon: CheckCircle,
      color: "text-green-500",
      bg: "bg-green-500/15",
      border: "border-green-500/30",
    },
  ]

  return (
    <div className="grid grid-cols-4 gap-1.5 sm:gap-3 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 bg-gradient-to-t from-card/80 to-transparent border-t border-border/30 shrink-0">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 sm:gap-1 p-1.5 sm:p-3 rounded-lg sm:rounded-xl border transition-all duration-200",
            stat.bg,
            stat.border
          )}
        >
          <stat.icon className={cn("h-3.5 w-3.5 sm:h-5 sm:w-5", stat.color)} />
          <p className="text-base sm:text-2xl font-bold font-mono leading-none text-foreground">
            {String(stat.value).padStart(2, "0")}
          </p>
          <p className="text-[6px] sm:text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  )
}
