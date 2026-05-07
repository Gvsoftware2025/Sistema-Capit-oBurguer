"use client"

import Image from "next/image"
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
  subtitulo,
  somAtivado,
  onToggleSom,
  ultimaAtualizacao,
  onRefresh,
}: HeaderProps) {
  const [agora, setAgora] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setAgora(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      weekday: "long",
    })
  }

  return (
    <header className="flex flex-col lg:flex-row items-center justify-between gap-4 p-4 lg:p-6 border-b border-border bg-card/50 backdrop-blur">
      {/* Left - Title */}
      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/30">
          <RefreshCw
            className={cn("h-4 w-4 text-primary", onRefresh && "cursor-pointer hover:animate-spin")}
            onClick={onRefresh}
          />
          <span className="text-sm font-medium text-primary">{titulo}</span>
        </div>
        {subtitulo && (
          <span className="text-sm text-muted-foreground">
            Atualizado {ultimaAtualizacao ? `há ${Math.floor((Date.now() - ultimaAtualizacao.getTime()) / 1000)}s` : "agora"}
          </span>
        )}
      </div>

      {/* Center - Logo */}
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl lg:text-3xl font-serif font-bold text-primary tracking-wider">
            CAPITÃO
          </span>
          <Image
            src="/logo-capitao-burguer.jpeg"
            alt="Logo"
            width={50}
            height={50}
            className="rounded-full hidden lg:block"
          />
          <span className="text-2xl lg:text-3xl font-serif font-bold text-primary tracking-wider">
            BURGUER
          </span>
        </div>
        <span className="text-xs text-muted-foreground tracking-widest">
          HAMBURGUER E PORÇÕES
        </span>
      </div>

      {/* Right - Controls */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleSom}
          className={cn(
            "gap-2",
            somAtivado ? "border-green-500/50 text-green-500" : "border-muted"
          )}
        >
          {somAtivado ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          <span className="hidden sm:inline">Som {somAtivado ? "ativado" : "desativado"}</span>
        </Button>

        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <div className="text-right">
            <p className="text-lg font-bold font-mono">{formatTime(agora)}</p>
            <p className="text-xs text-muted-foreground capitalize">{formatDate(agora)}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
