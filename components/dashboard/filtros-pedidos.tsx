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

  const filtros: { value: StatusFiltro; label: string; activeBg: string; activeBorder: string }[] = [
    { value: "todos",      label: "Todos",      activeBg: "bg-primary",   activeBorder: "border-primary" },
    { value: "novo",       label: "Novos",      activeBg: "bg-red-600",   activeBorder: "border-red-500" },
    { value: "preparando", label: "Preparando", activeBg: "bg-amber-500", activeBorder: "border-amber-400" },
    { value: "pronto",     label: "Prontos",    activeBg: "bg-green-600", activeBorder: "border-green-500" },
  ]

  return (
    <div className="flex flex-col gap-4 px-6 py-4 border-b border-border/50 shrink-0">
      {/* Botão Novo Pedido - destaque total */}
      <button
        onClick={() => router.push("/dashboard/novo-pedido")}
        className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl font-bold text-xl tracking-wide transition-all duration-200 bg-primary text-primary-foreground shadow-xl shadow-primary/40 hover:brightness-110 hover:shadow-primary/60 hover:scale-[1.01] active:scale-[0.99] border-2 border-primary/60 group"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 group-hover:bg-white/30 transition-colors">
          <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
        </div>
        NOVO PEDIDO
      </button>

      {/* Filtros de status + ordenação */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {filtros.map((filtro) => {
            const isActive = filtroAtivo === filtro.value
            return (
              <button
                key={filtro.value}
                onClick={() => onFiltroChange(filtro.value)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 border",
                  isActive
                    ? `${filtro.activeBg} ${filtro.activeBorder} text-white shadow-md`
                    : "bg-card text-foreground border-border hover:border-primary/40 hover:bg-primary/5"
                )}
              >
                <span>{filtro.label}</span>
                <span
                  className={cn(
                    "min-w-[22px] h-5 flex items-center justify-center px-1 rounded-full text-xs font-bold",
                    isActive ? "bg-white/25 text-white" : "bg-muted text-muted-foreground"
                  )}
                >
                  {contagens[filtro.value]}
                </span>
              </button>
            )
          })}
        </div>

        <Select value={ordenacao} onValueChange={onOrdenacaoChange}>
          <SelectTrigger className="w-[150px] h-9 bg-card border-border text-sm">
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
