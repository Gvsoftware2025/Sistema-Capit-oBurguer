"use client"

import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { Plus, Trash2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type StatusFiltro = "todos" | "novo" | "preparando" | "pronto" | "mesa"

interface FiltrosPedidosProps {
  filtroAtivo: StatusFiltro
  onFiltroChange: (filtro: StatusFiltro) => void
  contagens: {
    todos: number
    novo: number
    preparando: number
    pronto: number
    mesa: number
  }
  ordenacao: string
  onOrdenacaoChange: (ordenacao: string) => void
  onExcluirTodos?: () => void
  temPedidos?: boolean
}

export function FiltrosPedidos({
  filtroAtivo,
  onFiltroChange,
  contagens,
  ordenacao,
  onOrdenacaoChange,
  onExcluirTodos,
  temPedidos,
}: FiltrosPedidosProps) {
  const router = useRouter()

  const filtros: { value: StatusFiltro; label: string; color: string }[] = [
    { value: "todos", label: "Todos", color: "primary" },
    { value: "novo", label: "Novos", color: "red" },
    { value: "preparando", label: "Preparando", color: "amber" },
    { value: "pronto", label: "Prontos", color: "green" },
    { value: "mesa", label: "Mesa", color: "emerald" },
  ]

  const getColorClasses = (color: string, isActive: boolean) => {
    if (!isActive) return "bg-card/80 text-foreground/80 border-border/60 hover:border-primary/40 hover:bg-card"
    switch (color) {
      case "primary": return "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25"
      case "red": return "bg-red-600 text-white border-red-500 shadow-lg shadow-red-500/25"
      case "amber": return "bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/25"
      case "green": return "bg-green-600 text-white border-green-500 shadow-lg shadow-green-500/25"
      case "emerald": return "bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-500/25"
      default: return "bg-primary text-primary-foreground border-primary"
    }
  }

  return (
    <div className="px-3 sm:px-4 lg:px-6 py-3 space-y-3 bg-gradient-to-b from-card/50 to-transparent border-b border-border/30 shrink-0">
      {/* Botão Novo Pedido */}
      <div className="flex gap-2">
        <button
          onClick={() => router.push("/dashboard/novo-pedido")}
          className="flex-1 flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-200 bg-gradient-to-r from-primary to-amber-500 text-primary-foreground shadow-lg hover:brightness-110 active:scale-[0.99] border border-primary/40"
        >
          <Plus className="h-5 w-5" />
          <span>NOVO PEDIDO</span>
        </button>
        
        {onExcluirTodos && temPedidos && (
          <button
            onClick={onExcluirTodos}
            className="flex items-center justify-center gap-2 px-4 py-4 rounded-xl font-bold text-sm transition-all duration-200 bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-red-500/30 active:scale-[0.99] border border-red-500/40"
            title="Remover todos os pedidos"
          >
            <Trash2 className="h-5 w-5" />
            <span className="hidden sm:inline">LIMPAR TODOS</span>
          </button>
        )}
      </div>

      {/* Filtros + Ordenação */}
      <div className="flex items-center gap-2">
        {/* Filtros em scroll horizontal */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none flex-1 -mx-1 px-1">
          {filtros.map((filtro) => {
            const isActive = filtroAtivo === filtro.value
            return (
              <button
                key={filtro.value}
                onClick={() => onFiltroChange(filtro.value)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 border whitespace-nowrap flex-shrink-0",
                  getColorClasses(filtro.color, isActive)
                )}
              >
                <span className="hidden sm:inline">{filtro.label}</span>
                <span className="sm:hidden">{filtro.label.slice(0, 3)}</span>
                <span
                  className={cn(
                    "min-w-[18px] h-[18px] flex items-center justify-center px-1 rounded-full text-[10px] font-bold",
                    isActive ? "bg-black/20" : "bg-muted text-muted-foreground"
                  )}
                >
                  {contagens[filtro.value]}
                </span>
              </button>
            )
          })}
        </div>

        {/* Ordenação - escondido no mobile muito pequeno */}
        <Select value={ordenacao} onValueChange={onOrdenacaoChange}>
          <SelectTrigger className="h-9 w-[100px] sm:w-[130px] bg-card/80 border border-border/60 text-xs sm:text-sm font-medium shrink-0 rounded-lg">
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recentes">Recentes</SelectItem>
            <SelectItem value="antigos">Antigos</SelectItem>
            <SelectItem value="numero">Número</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
