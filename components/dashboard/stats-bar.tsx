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
      iconColor: "text-red-500",
      iconBg: "bg-red-500/20",
      borderColor: "border-red-500/30",
    },
    {
      label: "NOVOS",
      value: novos,
      icon: Clock,
      iconColor: "text-amber-500",
      iconBg: "bg-amber-500/20",
      borderColor: "border-amber-500/30",
    },
    {
      label: "PREPARANDO",
      value: preparando,
      icon: ChefHat,
      iconColor: "text-yellow-500",
      iconBg: "bg-yellow-500/20",
      borderColor: "border-yellow-500/30",
    },
    {
      label: "PRONTOS",
      value: prontos,
      icon: CheckCircle,
      iconColor: "text-green-500",
      iconBg: "bg-green-500/20",
      borderColor: "border-green-500/30",
    },
  ]

  return (
    <div className="grid grid-cols-4 gap-2 px-4 py-3 bg-gradient-to-t from-card/50 to-transparent border-t border-border/30 shrink-0">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={cn(
            "flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border bg-card/50 text-center",
            stat.borderColor
          )}
        >
          <div className={cn("p-1.5 rounded-lg", stat.iconBg)}>
            <stat.icon className={cn("h-4 w-4", stat.iconColor)} />
          </div>
          <p className="text-xl font-bold font-mono leading-none">
            {String(stat.value).padStart(2, "0")}
          </p>
          <p className="text-[8px] text-muted-foreground uppercase tracking-wide font-medium leading-tight">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  )
}
