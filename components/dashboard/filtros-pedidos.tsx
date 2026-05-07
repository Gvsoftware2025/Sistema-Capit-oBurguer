"use client"

import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type StatusFiltro = "todos" | "novo" | "preparando" | "pronto"

interface FiltrosPedidosProps {
  filtroAtivo: StatusFiltro
  onFiltroChange: (filtro: StatusFiltro) => void
  contagens: {
    todos: number
    novo: number
    preparando: number
    pronto: number
  }
  ordenacao: string
  onOrdenacaoChange: (ordenacao: string) => void
}

export function FiltrosPedidos({
  filtroAtivo,
  onFiltroChange,
  contagens,
  ordenacao,
  onOrdenacaoChange,
}: FiltrosPedidosProps) {
  const router = useRouter()

  const filtros: { value: StatusFiltro; label: string; activeBg: string; activeShadow: string }[] = [
    { value: "todos", label: "Todos", activeBg: "bg-primary", activeShadow: "shadow-primary/40" },
    { value: "novo", label: "Novos", activeBg: "bg-red-600", activeShadow: "shadow-red-500/40" },
    { value: "preparando", label: "Preparando", activeBg: "bg-amber-500", activeShadow: "shadow-amber-500/40" },
    { value: "pronto", label: "Prontos", activeBg: "bg-green-600", activeShadow: "shadow-green-500/40" },
  ]

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => router.push("/dashboard/novo-pedido")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm transition-all duration-200 bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:brightness-110 hover:shadow-primary/50 hover:scale-105 active:scale-95 border border-primary/50"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Pedido</span>
        </button>

        <div className="w-px h-6 bg-border mx-1" />

        {filtros.map((filtro) => {
          const isActive = filtroAtivo === filtro.value
          return (
            <button
              key={filtro.value}
              onClick={() => onFiltroChange(filtro.value)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 border",
                isActive
                  ? `${filtro.activeBg} text-white border-transparent shadow-lg ${filtro.activeShadow}`
                  : "bg-card text-foreground border-border hover:border-primary/40 hover:bg-card/80"
              )}
            >
              <span>{filtro.label}</span>
              <span
                className={cn(
                  "min-w-[24px] h-6 flex items-center justify-center px-1.5 rounded-full text-xs font-bold",
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {contagens[filtro.value]}
              </span>
            </button>
          )
        })}
      </div>

      <Select value={ordenacao} onValueChange={onOrdenacaoChange}>
        <SelectTrigger className="w-[160px] h-10 bg-card border-border">
          <SelectValue placeholder="Ordenar por" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recentes">Mais recentes</SelectItem>
          <SelectItem value="antigos">Mais antigos</SelectItem>
          <SelectItem value="numero">Por número</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
