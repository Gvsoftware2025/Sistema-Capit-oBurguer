"use client"

import { Package, UtensilsCrossed } from "lucide-react"
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
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
              <UtensilsCrossed className="h-12 w-12 text-primary/60" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-card border-2 border-border flex items-center justify-center">
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">Nenhum pedido</p>
            <p className="text-sm text-muted-foreground mt-1">Os pedidos aparecerão aqui em tempo real</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto p-4 lg:px-6 lg:py-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {pedidos.map((pedido, index) => (
          <div
            key={pedido.id}
            className="animate-scale-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <PedidoCard
              pedido={pedido}
              onFinalizar={onFinalizar}
              onAvancar={onAvancar}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
