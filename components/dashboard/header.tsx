"use client"

import { Volume2, VolumeX, Clock } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
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

  const formatDate = (date: Date) => {
    const weekday = date.toLocaleDateString("pt-BR", { weekday: "long" })
    const day = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
    return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)}, ${day}`
  }

  return (
    <header className="flex items-center justify-between gap-4 px-6 py-3 border-b border-border/50 bg-gradient-to-r from-card/80 via-card/60 to-card/80 backdrop-blur-sm shrink-0">
      {/* Center - Logo Title */}
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-primary/30 shrink-0">
          <Image
            src="/logo-capitao-burguer.jpeg"
            alt="Logo"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div>
          <h1 className="text-lg font-serif font-bold tracking-wide leading-none">
            <span className="text-primary">CAPITÃO</span>
            <span className="text-foreground ml-1.5">BURGUER</span>
          </h1>
          <p className="text-[9px] text-muted-foreground tracking-[0.25em]">HAMBURGUER E PORÇÕES</p>
        </div>
      </div>

      {/* Right - Controls */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleSom}
          className={cn(
            "gap-2 h-9 px-3 transition-all text-xs",
            somAtivado
              ? "border-green-500/50 bg-green-500/10 text-green-500 hover:bg-green-500/20"
              : "border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20"
          )}
        >
          {somAtivado ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          <span className="hidden sm:inline">Som {somAtivado ? "ativo" : "mudo"}</span>
        </Button>

        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border">
          <Clock className="h-3.5 w-3.5 text-primary" />
          <div className="text-right">
            <p className="text-base font-bold font-mono leading-none">
              {mounted && agora ? formatTime(agora) : "--:--"}
            </p>
            <p className="text-[9px] text-muted-foreground mt-0.5">
              {mounted && agora ? formatDate(agora) : ""}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
