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

  const filtros: { value: StatusFiltro; label: string; color: string }[] = [
    { value: "todos", label: "Todos", color: "primary" },
    { value: "novo", label: "Novos", color: "red" },
    { value: "preparando", label: "Preparando", color: "amber" },
    { value: "pronto", label: "Prontos", color: "green" },
  ]

  const getColorClasses = (color: string, isActive: boolean) => {
    if (!isActive) return "bg-card/80 text-foreground/80 border-border/60 hover:border-primary/40 hover:bg-card"
    switch (color) {
      case "primary": return "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25"
      case "red": return "bg-red-600 text-white border-red-500 shadow-lg shadow-red-500/25"
      case "amber": return "bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/25"
      case "green": return "bg-green-600 text-white border-green-500 shadow-lg shadow-green-500/25"
      default: return "bg-primary text-primary-foreground border-primary"
    }
  }

  return (
    <div className="px-4 lg:px-6 py-4 space-y-4 bg-gradient-to-b from-card/50 to-transparent border-b border-border/30 shrink-0">
      {/* Botão Novo Pedido - Grande e destacado */}
      <button
        onClick={() => router.push("/dashboard/novo-pedido")}
        className="w-full flex items-center justify-center gap-4 py-5 rounded-2xl font-bold text-lg sm:text-xl tracking-wide transition-all duration-300 bg-gradient-to-r from-primary via-amber-500 to-primary text-primary-foreground shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:brightness-110 active:scale-[0.99] border-2 border-primary/40 group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-black/20 group-hover:rotate-90 transition-transform duration-300">
          <Plus className="h-6 w-6" />
        </div>
        <span>NOVO PEDIDO</span>
      </button>

      {/* Filtros + Ordenação */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Filtros em scroll horizontal no mobile */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 sm:pb-0 flex-1">
          {filtros.map((filtro) => {
            const isActive = filtroAtivo === filtro.value
            return (
              <button
                key={filtro.value}
                onClick={() => onFiltroChange(filtro.value)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 border-2 whitespace-nowrap flex-shrink-0",
                  getColorClasses(filtro.color, isActive)
                )}
              >
                {filtro.label}
                <span
                  className={cn(
                    "min-w-[20px] h-5 flex items-center justify-center px-1.5 rounded-full text-[11px] font-bold",
                    isActive ? "bg-black/20" : "bg-muted text-muted-foreground"
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
          <SelectTrigger className="h-10 w-full sm:w-[150px] bg-card/80 border-2 border-border/60 text-sm font-medium shrink-0 rounded-xl">
            <SelectValue placeholder="Ordenar" />
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
