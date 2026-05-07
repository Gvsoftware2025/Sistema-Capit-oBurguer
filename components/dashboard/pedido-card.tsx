"use client"

import { Clock, Package, Truck, User, CheckCircle, Store } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { Pedido } from "@/lib/types"

interface PedidoCardProps {
  pedido: Pedido
  onFinalizar: (id: string) => void
  onAvancar?: (id: string) => void
}

export function PedidoCard({ pedido, onFinalizar, onAvancar }: PedidoCardProps) {
  const statusConfig = {
    novo: {
      label: "NOVO",
      bgBadge: "bg-red-600",
      textBadge: "text-white",
      border: "border-red-500/60",
      labelColor: "text-red-500",
      glow: "shadow-[0_0_20px_rgba(239,68,68,0.3)]",
    },
    preparando: {
      label: "PREPARANDO",
      bgBadge: "bg-amber-500",
      textBadge: "text-black",
      border: "border-amber-500/60",
      labelColor: "text-amber-500",
      glow: "shadow-[0_0_20px_rgba(245,158,11,0.3)]",
    },
    pronto: {
      label: "PRONTO",
      bgBadge: "bg-green-600",
      textBadge: "text-white",
      border: "border-green-500/60",
      labelColor: "text-green-500",
      glow: "shadow-[0_0_20px_rgba(34,197,94,0.3)]",
    },
    finalizado: {
      label: "FINALIZADO",
      bgBadge: "bg-zinc-600",
      textBadge: "text-white",
      border: "border-zinc-500/60",
      labelColor: "text-zinc-500",
      glow: "",
    },
  }

  const config = statusConfig[pedido.status]
  const tempoDecorrido = Math.floor((Date.now() - new Date(pedido.criadoEm).getTime()) / 60000)

  const getTipoIcon = () => {
    switch (pedido.tipo) {
      case "entrega": return <Truck className="h-4 w-4" />
      case "retirada": return <Package className="h-4 w-4" />
      default: return <Store className="h-4 w-4" />
    }
  }

  const getTipoLabel = () => {
    switch (pedido.tipo) {
      case "entrega": return "Entrega"
      case "retirada": return "Retirada"
      default: return `Mesa ${pedido.mesa || ""}`
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border-2 bg-card/80 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1",
        config.border,
        config.glow,
        pedido.status === "novo" && "animate-pulse-border"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-card to-card/50 border-b border-border/50">
        <span className={cn("px-3 py-1 rounded text-[10px] font-bold tracking-wider", config.bgBadge, config.textBadge)}>
          {config.label}
        </span>
        <span className="text-sm font-mono font-bold text-muted-foreground">#{pedido.numero}</span>
      </div>

      {/* Body */}
      <div className="flex-1 p-4 space-y-3">
        {/* Cliente */}
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-primary" />
          <span className="font-bold text-base truncate">{pedido.cliente}</span>
        </div>

        {/* Tipo */}
        <div className="flex items-center gap-2 text-muted-foreground">
          {getTipoIcon()}
          <span className="text-xs">{getTipoLabel()}</span>
        </div>

        {/* Itens */}
        <div className="pt-2">
          <p className={cn("text-[10px] font-bold uppercase tracking-wider mb-2", config.labelColor)}>
            Itens
          </p>
          <ul className="space-y-1.5 max-h-24 overflow-y-auto scrollbar-thin">
            {pedido.itens.map((item, i) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <span className="text-muted-foreground font-mono text-xs">{item.quantidade}x</span>
                <span className="truncate">{item.nome}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Observacao */}
        {pedido.observacao && (
          <div className="pt-2">
            <p className={cn("text-[10px] font-bold uppercase tracking-wider mb-1", config.labelColor)}>
              Observação
            </p>
            <p className="text-xs text-muted-foreground line-clamp-2">{pedido.observacao}</p>
          </div>
        )}
      </div>

      {/* Tempo */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-4 py-2 bg-card/50 border-t border-border/30">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          <span className="font-mono">
            {new Date(pedido.criadoEm).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <span className="font-medium">Há {tempoDecorrido} min</span>
      </div>

      {/* Footer - Actions */}
      <div className="p-3 bg-card/30">
        {pedido.status === "novo" && onAvancar && (
          <Button
            onClick={() => onAvancar(pedido.id)}
            className="w-full h-10 bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs tracking-wide shadow-lg shadow-amber-500/30"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            PREPARAR PEDIDO
          </Button>
        )}
        {pedido.status === "preparando" && (
          <Button
            onClick={() => onFinalizar(pedido.id)}
            className="w-full h-10 bg-green-600 hover:bg-green-700 text-white font-bold text-xs tracking-wide shadow-lg shadow-green-500/30"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            FINALIZAR PEDIDO
          </Button>
        )}
        {pedido.status === "pronto" && (
          <Button
            onClick={() => onFinalizar(pedido.id)}
            className="w-full h-10 bg-primary hover:bg-primary/90 font-bold text-xs tracking-wide shadow-lg shadow-primary/30"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            ENTREGAR PEDIDO
          </Button>
        )}
      </div>
    </div>
  )
}
