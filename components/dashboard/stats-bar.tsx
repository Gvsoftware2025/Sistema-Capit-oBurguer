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
      label: "Total de Pedidos",
      value: total,
      icon: Flame,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/30",
    },
    {
      label: "Novos",
      value: novos,
      icon: Clock,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30",
    },
    {
      label: "Preparando",
      value: preparando,
      icon: ChefHat,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/30",
    },
    {
      label: "Prontos",
      value: prontos,
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30",
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 lg:p-6 bg-card/30 border-t border-border">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={cn(
            "flex items-center gap-4 p-4 rounded-xl border",
            stat.bgColor,
            stat.borderColor
          )}
        >
          <div className={cn("p-3 rounded-full", stat.bgColor)}>
            <stat.icon className={cn("h-6 w-6", stat.color)} />
          </div>
          <div>
            <p className="text-3xl font-bold font-mono">{String(stat.value).padStart(2, "0")}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
