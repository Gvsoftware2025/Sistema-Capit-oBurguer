"use client"

import { Package } from "lucide-react"
import { PedidoCard } from "./pedido-card"
import type { Pedido } from "@/lib/types"

interface PedidosGridProps {
  pedidos: Pedido[]
  onFinalizar: (id: string) => void
  onAvancar: (id: string) => void
}

export function PedidosGrid({ pedidos, onFinalizar, onAvancar }: PedidosGridProps) {
  if (pedidos.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-muted/30 flex items-center justify-center">
            <Package className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <div>
            <p className="text-xl font-bold text-muted-foreground">Nenhum pedido</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Os pedidos aparecerão aqui em tempo real</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto p-4 lg:px-6 lg:py-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {pedidos.map((pedido) => (
          <PedidoCard
            key={pedido.id}
            pedido={pedido}
            onFinalizar={onFinalizar}
            onAvancar={onAvancar}
          />
        ))}
      </div>
    </div>
  )
}
