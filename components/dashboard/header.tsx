"use client"

import { Volume2, VolumeX, Clock, Printer, PrinterOff } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface HeaderProps {
  somAtivado: boolean
  onToggleSom: () => void
  impressaoAutomatica: boolean
  onToggleImpressao: () => void
}

export function Header({ somAtivado, onToggleSom, impressaoAutomatica, onToggleImpressao }: HeaderProps) {
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
    <header className="flex items-center justify-between gap-2 px-4 lg:px-6 py-3 bg-gradient-to-r from-card/95 via-card/90 to-card/95 backdrop-blur-sm border-b border-border/40 shrink-0">
      {/* Título */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] sm:text-xs font-medium text-green-500 hidden sm:inline">Ao vivo</span>
        </div>
        <h1 className="text-sm sm:text-lg font-bold text-foreground truncate">
          Pedidos
        </h1>
      </div>

      {/* Right - Impressao + Som + Hora */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Botão impressão automática */}
        <button
          onClick={onToggleImpressao}
          title={impressaoAutomatica ? "Impressão automática LIGADA" : "Impressão automática DESLIGADA"}
          className={cn(
            "flex items-center justify-center p-2 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl border-2 transition-all duration-200",
            impressaoAutomatica
              ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
              : "border-gray-500/40 bg-gray-500/10 text-gray-400"
          )}
        >
          {impressaoAutomatica ? <Printer className="h-4 w-4" /> : <PrinterOff className="h-4 w-4" />}
        </button>

        {/* Botão som */}
        <button
          onClick={onToggleSom}
          className={cn(
            "flex items-center justify-center p-2 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl border-2 transition-all duration-200",
            somAtivado
              ? "border-green-500/40 bg-green-500/10 text-green-400"
              : "border-red-500/40 bg-red-500/10 text-red-400"
          )}
        >
          {somAtivado ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </button>

        {/* Relógio */}
        <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-card border-2 border-border/60">
          <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
          <p className="text-sm sm:text-base font-bold font-mono leading-none text-foreground">
            {mounted && agora ? formatTime(agora) : "--:--"}
          </p>
        </div>
      </div>
    </header>
  )
}
