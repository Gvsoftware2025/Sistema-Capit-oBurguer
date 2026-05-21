"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  User,
  Phone,
  MapPin,
  Clock,
  Printer,
  Package,
  Truck,
  Store,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Pedido } from "@/lib/types"

interface PedidoDetalhesModalProps {
  pedido: Pedido | null
  aberto: boolean
  onFechar: () => void
  onImprimir?: (pedido: Pedido) => void
}

export function PedidoDetalhesModal({
  pedido,
  aberto,
  onFechar,
  onImprimir,
}: PedidoDetalhesModalProps) {
  if (!pedido) return null

  const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
    novo: { label: "NOVO", bg: "bg-red-600", text: "text-white" },
    pendente: { label: "NOVO", bg: "bg-red-600", text: "text-white" },
    preparando: { label: "PREPARANDO", bg: "bg-amber-500", text: "text-black" },
    pronto: { label: "PRONTO", bg: "bg-green-600", text: "text-white" },
    finalizado: { label: "FINALIZADO", bg: "bg-zinc-600", text: "text-white" },
    entregue: { label: "ENTREGUE", bg: "bg-blue-600", text: "text-white" },
  }

  const defaultStatus = { label: pedido.status?.toUpperCase() || "DESCONHECIDO", bg: "bg-zinc-600", text: "text-white" }
  const config = statusConfig[pedido.status] || defaultStatus

  const getTipoIcon = () => {
    switch (pedido.tipo) {
      case "entrega": return <Truck className="h-5 w-5" />
      case "retirada": return <Package className="h-5 w-5" />
      default: return <Store className="h-5 w-5" />
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
    <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-card border-2 border-border p-0">
        {/* Header */}
        <DialogHeader className="p-4 border-b border-border bg-card sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={cn("px-3 py-1.5 rounded text-xs font-bold", config.bg, config.text)}>
                {config.label}
              </span>
              <DialogTitle className="text-xl font-bold">
                Pedido #{pedido.numero}
              </DialogTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={onFechar} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-4 space-y-4">
          {/* Cliente */}
          <div className="bg-card/50 rounded-lg border border-border p-4 space-y-3">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Cliente</h3>
            
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <span className="font-bold text-lg">{pedido.cliente}</span>
            </div>

            {pedido.telefone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">{pedido.telefone}</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              {getTipoIcon()}
              <span className="text-sm font-medium">{getTipoLabel()}</span>
            </div>

            {pedido.endereco && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-sm">{pedido.endereco}</span>
              </div>
            )}

            <div className="flex items-center gap-3 text-muted-foreground">
              <Clock className="h-5 w-5" />
              <span className="text-sm">
                {new Date(pedido.criadoEm).toLocaleString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          {/* Itens */}
          <div className="bg-card/50 rounded-lg border border-border p-4 space-y-3">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider">
              Itens do Pedido ({pedido.itens.length})
            </h3>
            
            <div className="space-y-3">
              {pedido.itens.map((item, i) => (
                <div key={i} className="border-b border-border/50 pb-3 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-0.5 rounded">
                          {item.quantidade}x
                        </span>
                        <span className="font-bold">{item.nome}</span>
                      </div>
                      
                      {/* Variacao/Tamanho */}
                      {item.variacao && (
                        <p className="text-xs text-muted-foreground mt-1 ml-8">
                          Tamanho: <span className="text-foreground">{item.variacao}</span>
                        </p>
                      )}

                      {/* Maionese Gratis */}
                      {item.maionese && (
                        <p className="text-xs text-green-500 mt-1 ml-8">
                          Maionese gratis: {item.maionese}
                        </p>
                      )}

                      {/* Maioneses Extras */}
                      {item.extraMaioneses && item.extraMaioneses.length > 0 && (
                        <div className="mt-1 ml-8">
                          <p className="text-xs text-muted-foreground">Maioneses extras:</p>
                          <ul className="text-xs text-blue-400 mt-0.5 space-y-0.5">
                            {item.extraMaioneses.map((maionese: string, j: number) => (
                              <li key={j}>+ {maionese} (+R$ 2,00)</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Adicionais */}
                      {item.adicionais && item.adicionais.length > 0 && (
                        <div className="mt-1 ml-8">
                          <p className="text-xs text-muted-foreground">Adicionais:</p>
                          <ul className="text-xs text-amber-500 mt-0.5 space-y-0.5">
                            {item.adicionais.map((add: any, j: number) => {
                              const nome = typeof add === "string" ? add : add.nome || add.name || "Adicional"
                              const qtd = typeof add === "object" ? (add.quantidade || add.quantity || 1) : 1
                              const preco = typeof add === "object" ? (add.preco || add.price || 0) : 0
                              return (
                                <li key={j}>
                                  + {nome} {qtd > 1 ? `(${qtd}x)` : ""} {preco > 0 ? `- R$ ${(preco * qtd).toFixed(2)}` : ""}
                                </li>
                              )
                            })}
                          </ul>
                        </div>
                      )}

                      {/* Observacao do item */}
                      {item.observacao && (
                        <p className="text-xs text-muted-foreground mt-1 ml-8 italic">
                          Obs: {item.observacao}
                        </p>
                      )}

                      {/* Acompanhamentos especiais (ex: Batata com: Catupiry, Kibe: Tradicional) */}
                      {item.acompanhamentos && (
                        <p className="text-xs text-amber-600 mt-1 ml-8 font-semibold">
                          {item.acompanhamentos}
                        </p>
                      )}
                    </div>
                    <span className="font-bold text-primary shrink-0">
                      R$ {(item.preco * item.quantidade).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Observacao geral */}
          {pedido.observacao && (
            <div className="bg-amber-500/10 rounded-lg border border-amber-500/30 p-4">
              <h3 className="text-sm font-bold text-amber-500 uppercase tracking-wider mb-2">
                Observacao do Pedido
              </h3>
              <p className="text-sm">{pedido.observacao}</p>
            </div>
          )}

          {/* Total */}
          <div className="bg-primary/10 rounded-lg border border-primary/30 p-4 flex items-center justify-between">
            <span className="text-lg font-bold">TOTAL</span>
            <span className="text-2xl font-bold text-primary">
              R$ {pedido.total.toFixed(2)}
            </span>
          </div>

          {/* Botao Imprimir */}
          {onImprimir && (
            <Button
              onClick={() => onImprimir(pedido)}
              className="w-full h-12 bg-zinc-700 hover:bg-zinc-600 text-white font-bold"
            >
              <Printer className="h-5 w-5 mr-2" />
              Imprimir Pedido
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
