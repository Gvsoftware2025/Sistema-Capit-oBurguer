"use client"

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
        <div className="text-center">
          <p className="text-2xl font-bold text-muted-foreground">Nenhum pedido</p>
          <p className="text-muted-foreground">Os pedidos aparecerão aqui em tempo real</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto p-4 lg:p-6">
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
