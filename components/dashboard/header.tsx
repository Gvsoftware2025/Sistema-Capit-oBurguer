"use client"

import { Volume2, VolumeX, Clock } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface HeaderProps {
  somAtivado: boolean
  onToggleSom: () => void
}

export function Header({ somAtivado, onToggleSom }: HeaderProps) {
  const [agora, setAgora] = useState<Date | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setAgora(new Date())
    const interval = setInterval(() => setAgora(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })

  const formatDate = (date: Date) =>
    date.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" })

  return (
    <header className="flex items-center justify-between gap-4 px-4 lg:px-6 py-4 bg-gradient-to-r from-card/95 via-card/90 to-card/95 backdrop-blur-sm border-b border-border/40 shrink-0">
      {/* Título */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-medium text-green-500">Ao vivo</span>
        </div>
        <div className="h-4 w-px bg-border hidden sm:block" />
        <h1 className="text-base sm:text-lg font-bold text-foreground">
          Painel de Pedidos
        </h1>
      </div>

      {/* Right - Som + Hora */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Botão som */}
        <button
          onClick={onToggleSom}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-semibold transition-all duration-200",
            somAtivado
              ? "border-green-500/40 bg-green-500/10 text-green-400 hover:bg-green-500/20"
              : "border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20"
          )}
        >
          {somAtivado ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          <span className="hidden sm:inline text-xs">{somAtivado ? "Som" : "Mudo"}</span>
        </button>

        {/* Relógio */}
        <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-card border-2 border-border/60">
          <Clock className="h-4 w-4 text-primary hidden sm:block" />
          <div className="text-right">
            <p className="text-base sm:text-lg font-bold font-mono leading-none text-foreground">
              {mounted && agora ? formatTime(agora) : "--:--"}
            </p>
            <p className="text-[9px] text-muted-foreground capitalize hidden sm:block mt-0.5">
              {mounted && agora ? formatDate(agora) : ""}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
