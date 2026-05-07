"use client"

import { cn } from "@/lib/utils"
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
  const filtros: { value: StatusFiltro; label: string; color: string }[] = [
    { value: "todos", label: "Todos", color: "bg-primary" },
    { value: "novo", label: "Novos", color: "bg-red-600" },
    { value: "preparando", label: "Preparando", color: "bg-yellow-600" },
    { value: "pronto", label: "Prontos", color: "bg-green-600" },
  ]

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 lg:px-6">
      <div className="flex flex-wrap gap-2">
        {filtros.map((filtro) => (
          <button
            key={filtro.value}
            onClick={() => onFiltroChange(filtro.value)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all border",
              filtroAtivo === filtro.value
                ? `${filtro.color} text-white border-transparent shadow-lg`
                : "bg-card text-foreground border-border hover:border-primary/50"
            )}
          >
            <span>{filtro.label}</span>
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-xs font-bold",
                filtroAtivo === filtro.value
                  ? "bg-white/20 text-white"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {contagens[filtro.value]}
            </span>
          </button>
        ))}
      </div>

      <Select value={ordenacao} onValueChange={onOrdenacaoChange}>
        <SelectTrigger className="w-[180px]">
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
