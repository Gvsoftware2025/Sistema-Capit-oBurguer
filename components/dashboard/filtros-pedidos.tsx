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
    <div className="flex flex-col gap-3 px-4 py-4 border-b border-border/50 shrink-0">
      {/* Botão Novo Pedido */}
      <button
        onClick={() => router.push("/dashboard/novo-pedido")}
        className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-lg tracking-wide transition-all duration-200 bg-primary text-primary-foreground shadow-lg shadow-primary/40 hover:brightness-110 active:scale-[0.98] border-2 border-primary/60 group"
      >
        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-black/20 group-hover:bg-black/30 transition-colors">
          <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
        </div>
        NOVO PEDIDO
      </button>

      {/* Filtros + Ordenação na mesma linha */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5">
        {filtros.map((filtro) => {
          const isActive = filtroAtivo === filtro.value
          return (
            <button
              key={filtro.value}
              onClick={() => onFiltroChange(filtro.value)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 border whitespace-nowrap shrink-0",
                isActive
                  ? `${filtro.activeBg} ${filtro.activeBorder} text-white shadow-md`
                  : "bg-card text-foreground border-border hover:border-primary/40"
              )}
            >
              {filtro.label}
              <span
                className={cn(
                  "min-w-[18px] h-4 flex items-center justify-center px-1 rounded-full text-[10px] font-bold",
                  isActive ? "bg-black/25 text-white" : "bg-muted text-muted-foreground"
                )}
              >
                {contagens[filtro.value]}
              </span>
            </button>
          )
        })}

        {/* Separador */}
        <div className="w-px h-5 bg-border mx-1 shrink-0" />

        {/* Ordenação */}
        <Select value={ordenacao} onValueChange={onOrdenacaoChange}>
          <SelectTrigger className="h-9 w-[130px] bg-card border-border text-xs shrink-0">
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
