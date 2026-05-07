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
    date.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "short" })

  return (
    <header className="flex items-center justify-between gap-3 pl-16 pr-4 lg:px-6 py-4 border-b border-border/50 bg-gradient-to-r from-card via-card to-card/80 shrink-0">
      {/* Logo + Title */}
      <div className="flex items-center gap-3">
        <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-primary/40 shadow-lg shadow-primary/20 shrink-0">
          <Image
            src="/logo-capitao-burguer.jpeg"
            alt="Logo"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div>
          <h1 className="text-lg font-serif font-bold tracking-wide leading-tight">
            <span className="text-primary">CAPITÃO</span>
            <span className="text-foreground ml-1.5">BURGUER</span>
          </h1>
          <p className="text-[10px] text-muted-foreground tracking-[0.2em] hidden sm:block">HAMBURGUER E PORÇÕES</p>
        </div>
      </div>

      {/* Right - Som + Hora */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Botão som */}
        <button
          onClick={onToggleSom}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-semibold transition-all duration-200",
            somAtivado
              ? "border-green-500/50 bg-green-500/10 text-green-400 hover:bg-green-500/20"
              : "border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20"
          )}
        >
          {somAtivado ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          <span className="hidden sm:inline">{somAtivado ? "Som" : "Mudo"}</span>
        </button>

        {/* Relógio */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border-2 border-border">
          <Clock className="h-4 w-4 text-primary hidden sm:block" />
          <div className="text-right">
            <p className="text-lg font-bold font-mono leading-none">
              {mounted && agora ? formatTime(agora) : "--:--"}
            </p>
            <p className="text-[10px] text-muted-foreground capitalize hidden sm:block mt-0.5">
              {mounted && agora ? formatDate(agora) : ""}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
