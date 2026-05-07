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
      label: "TOTAL DE PEDIDOS",
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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-4 lg:px-6 bg-gradient-to-t from-card/50 to-transparent border-t border-border/30">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={cn(
            "flex items-center gap-3 p-4 rounded-xl border bg-card/50 backdrop-blur-sm",
            stat.borderColor
          )}
        >
          <div className={cn("p-2.5 rounded-lg", stat.iconBg)}>
            <stat.icon className={cn("h-5 w-5", stat.iconColor)} />
          </div>
          <div>
            <p className="text-2xl font-bold font-mono">{String(stat.value).padStart(2, "0")}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
