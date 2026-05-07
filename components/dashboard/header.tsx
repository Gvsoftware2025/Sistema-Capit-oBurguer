"use client"

import { Volume2, VolumeX, Clock, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface HeaderProps {
  titulo: string
  subtitulo?: string
  somAtivado: boolean
  onToggleSom: () => void
  ultimaAtualizacao?: Date
  onRefresh?: () => void
}

export function Header({
  titulo,
  somAtivado,
  onToggleSom,
  ultimaAtualizacao,
  onRefresh,
}: HeaderProps) {
  const [agora, setAgora] = useState<Date | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setAgora(new Date())
    const interval = setInterval(() => setAgora(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (date: Date) => {
    const weekday = date.toLocaleDateString("pt-BR", { weekday: "long" })
    const day = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
    return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)}, ${day}`
  }

  const tempoAtras = ultimaAtualizacao
    ? Math.floor((Date.now() - ultimaAtualizacao.getTime()) / 1000)
    : 0

  return (
    <header className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border/50 bg-gradient-to-r from-card/80 via-card/60 to-card/80 backdrop-blur-sm">
      {/* Left - Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-primary/10 border border-primary/30">
          <RefreshCw
            className={cn(
              "h-4 w-4 text-primary cursor-pointer transition-transform hover:rotate-180 duration-500",
              onRefresh && "hover:text-primary/80"
            )}
            onClick={onRefresh}
          />
          <div>
            <p className="text-sm font-bold text-primary">{titulo}</p>
            <p className="text-xs text-muted-foreground">
              Atualizado há {tempoAtras}s
            </p>
          </div>
        </div>
      </div>

      {/* Center - Logo Title */}
      <div className="hidden md:flex flex-col items-center">
        <div className="flex items-center gap-3">
          <div className="h-px w-12 bg-gradient-to-r from-transparent via-primary/50 to-primary" />
          <h1 className="text-2xl lg:text-3xl font-serif font-bold tracking-wider">
            <span className="text-primary">CAPITÃO</span>
            <span className="text-foreground mx-2">BURGUER</span>
          </h1>
          <div className="h-px w-12 bg-gradient-to-l from-transparent via-primary/50 to-primary" />
        </div>
        <p className="text-[10px] text-muted-foreground tracking-[0.3em] mt-1">
          HAMBURGUER E PORÇÕES
        </p>
      </div>

      {/* Right - Controls */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleSom}
          className={cn(
            "gap-2 h-10 px-4 transition-all",
            somAtivado 
              ? "border-green-500/50 bg-green-500/10 text-green-500 hover:bg-green-500/20" 
              : "border-border hover:border-primary/50"
          )}
        >
          {somAtivado ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          <span className="hidden sm:inline text-xs">Som {somAtivado ? "ativado" : "desativado"}</span>
        </Button>

        <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-card border border-border">
          <Clock className="h-4 w-4 text-primary" />
          <div className="text-right">
            <p className="text-xl font-bold font-mono text-foreground">
              {mounted && agora ? formatTime(agora) : "--:--"}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {mounted && agora ? formatDate(agora) : "Carregando..."}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
