"use client"

import { Clock, Package, Truck, User, CheckCircle } from "lucide-react"
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
      color: "bg-red-600 text-white",
      border: "border-red-600",
      glow: "shadow-red-600/30",
    },
    preparando: {
      label: "PREPARANDO",
      color: "bg-yellow-600 text-black",
      border: "border-yellow-600",
      glow: "shadow-yellow-600/30",
    },
    pronto: {
      label: "PRONTO",
      color: "bg-green-600 text-white",
      border: "border-green-600",
      glow: "shadow-green-600/30",
    },
    finalizado: {
      label: "FINALIZADO",
      color: "bg-gray-600 text-white",
      border: "border-gray-600",
      glow: "shadow-gray-600/30",
    },
  }

  const config = statusConfig[pedido.status]
  const tempoDecorrido = Math.floor((Date.now() - new Date(pedido.criadoEm).getTime()) / 60000)

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border-2 bg-card overflow-hidden transition-all hover:scale-[1.02]",
        config.border,
        pedido.status === "novo" && "animate-pulse-border"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <span className={cn("px-3 py-1 rounded text-xs font-bold uppercase", config.color)}>
          {config.label}
        </span>
        <span className="text-lg font-mono font-bold text-muted-foreground">#{pedido.numero}</span>
      </div>

      {/* Body */}
      <div className="flex-1 p-4 space-y-4">
        {/* Cliente */}
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          <span className="font-bold text-lg">{pedido.cliente}</span>
        </div>

        {/* Tipo */}
        <div className="flex items-center gap-2 text-muted-foreground">
          {pedido.tipo === "entrega" ? (
            <Truck className="h-4 w-4" />
          ) : (
            <Package className="h-4 w-4" />
          )}
          <span className="text-sm capitalize">{pedido.tipo}</span>
        </div>

        {/* Itens */}
        <div>
          <p className={cn("text-xs font-bold uppercase mb-2", 
            pedido.status === "novo" ? "text-red-500" : 
            pedido.status === "preparando" ? "text-yellow-500" : "text-green-500"
          )}>
            Itens
          </p>
          <ul className="space-y-1">
            {pedido.itens.map((item, i) => (
              <li key={i} className="text-sm flex gap-2">
                <span className="text-muted-foreground">{item.quantidade}x</span>
                <span>{item.nome}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Observacao */}
        {pedido.observacao && (
          <div>
            <p className={cn("text-xs font-bold uppercase mb-1",
              pedido.status === "novo" ? "text-red-500" : 
              pedido.status === "preparando" ? "text-yellow-500" : "text-green-500"
            )}>
              Observação
            </p>
            <p className="text-sm text-muted-foreground">{pedido.observacao}</p>
          </div>
        )}

        {/* Tempo */}
        <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t border-border">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>
              {new Date(pedido.criadoEm).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <span>Há {tempoDecorrido} min</span>
        </div>
      </div>

      {/* Footer - Actions */}
      <div className="p-4 pt-0">
        {pedido.status === "novo" && onAvancar && (
          <Button
            onClick={() => onAvancar(pedido.id)}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-bold"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Preparar Pedido
          </Button>
        )}
        {pedido.status === "preparando" && (
          <Button
            onClick={() => onFinalizar(pedido.id)}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Finalizar Pedido
          </Button>
        )}
        {pedido.status === "pronto" && (
          <Button
            onClick={() => onFinalizar(pedido.id)}
            className="w-full bg-primary hover:bg-primary/90 font-bold"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Entregar Pedido
          </Button>
        )}
      </div>
    </div>
  )
}
