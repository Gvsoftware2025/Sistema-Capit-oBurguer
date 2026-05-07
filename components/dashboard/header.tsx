"use client"

import { Volume2, VolumeX, Clock } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import Image from "next/image"

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
    date.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" })

  return (
    <header className="flex items-center justify-between gap-2 pl-16 pr-4 lg:px-6 py-3 border-b border-border/50 bg-card/80 backdrop-blur-sm shrink-0">
      {/* Logo + Title */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="relative w-9 h-9 rounded-full overflow-hidden border border-primary/30 shrink-0">
          <Image
            src="/logo-capitao-burguer.jpeg"
            alt="Logo"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="min-w-0">
          <h1 className="text-sm font-serif font-bold tracking-wide leading-none truncate">
            <span className="text-primary">CAPITÃO</span>
            <span className="text-foreground ml-1">BURGUER</span>
          </h1>
          <p className="text-[8px] text-muted-foreground tracking-widest hidden sm:block">HAMBURGUER E PORÇÕES</p>
        </div>
      </div>

      {/* Right - Som + Hora */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Botão som */}
        <button
          onClick={onToggleSom}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all",
            somAtivado
              ? "border-green-500/50 bg-green-500/10 text-green-400"
              : "border-red-500/50 bg-red-500/10 text-red-400"
          )}
        >
          {somAtivado ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline">{somAtivado ? "Som ativo" : "Mudo"}</span>
        </button>

        {/* Relógio */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-card border border-border shrink-0">
          <Clock className="h-3 w-3 text-primary hidden sm:block" />
          <div>
            <p className="text-sm font-bold font-mono leading-none">
              {mounted && agora ? formatTime(agora) : "--:--"}
            </p>
            <p className="text-[8px] text-muted-foreground hidden sm:block mt-0.5">
              {mounted && agora ? formatDate(agora) : ""}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
