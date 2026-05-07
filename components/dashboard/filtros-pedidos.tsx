"use client"

import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { Plus, ChevronDown } from "lucide-react"
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

  const filtros: { value: StatusFiltro; label: string; color: string }[] = [
    { value: "todos", label: "Todos", color: "primary" },
    { value: "novo", label: "Novos", color: "red" },
    { value: "preparando", label: "Preparando", color: "amber" },
    { value: "pronto", label: "Prontos", color: "green" },
  ]

  const getColorClasses = (color: string, isActive: boolean) => {
    if (!isActive) return "bg-card text-foreground border-border hover:border-primary/40 hover:bg-card/80"
    switch (color) {
      case "primary": return "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/30"
      case "red": return "bg-red-600 text-white border-red-500 shadow-lg shadow-red-500/30"
      case "amber": return "bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/30"
      case "green": return "bg-green-600 text-white border-green-500 shadow-lg shadow-green-500/30"
      default: return "bg-primary text-primary-foreground border-primary"
    }
  }

  return (
    <div className="px-4 py-4 space-y-4 border-b border-border/50 shrink-0 bg-card/30">
      {/* Botão Novo Pedido - Grande e destacado */}
      <button
        onClick={() => router.push("/dashboard/novo-pedido")}
        className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl font-bold text-xl tracking-wide transition-all duration-300 bg-gradient-to-r from-primary via-primary to-amber-500 text-primary-foreground shadow-xl shadow-primary/40 hover:shadow-primary/60 hover:scale-[1.01] active:scale-[0.99] border-2 border-primary/60 group"
      >
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-black/20 group-hover:bg-black/30 group-hover:rotate-90 transition-all duration-300">
          <Plus className="h-6 w-6" />
        </div>
        NOVO PEDIDO
      </button>

      {/* Filtros + Ordenação */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
        <div className="flex gap-2 flex-1">
          {filtros.map((filtro) => {
            const isActive = filtroAtivo === filtro.value
            return (
              <button
                key={filtro.value}
                onClick={() => onFiltroChange(filtro.value)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 border-2 whitespace-nowrap",
                  getColorClasses(filtro.color, isActive)
                )}
              >
                {filtro.label}
                <span
                  className={cn(
                    "min-w-[22px] h-5 flex items-center justify-center px-1.5 rounded-full text-xs font-bold",
                    isActive ? "bg-black/20 text-inherit" : "bg-muted text-muted-foreground"
                  )}
                >
                  {contagens[filtro.value]}
                </span>
              </button>
            )
          })}
        </div>

        {/* Ordenação */}
        <Select value={ordenacao} onValueChange={onOrdenacaoChange}>
          <SelectTrigger className="h-10 w-[140px] bg-card border-2 border-border text-sm font-medium shrink-0">
            <SelectValue placeholder="Ordenar" />
            <ChevronDown className="h-4 w-4 opacity-50" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recentes">Mais recentes</SelectItem>
            <SelectItem value="antigos">Mais antigos</SelectItem>
            <SelectItem value="numero">Por número</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
