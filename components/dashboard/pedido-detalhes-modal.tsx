"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  Plus,
  UtensilsCrossed,
  Banknote,
  QrCode,
  CreditCard,
  CheckCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Pedido } from "@/lib/types"

interface PedidoDetalhesModalProps {
  pedido: Pedido | null
  aberto: boolean
  onFechar: () => void
  onImprimir?: (pedido: Pedido) => void
  onAdicionarItens?: (pedido: Pedido) => void
  onFinalizarPedido?: (pedido: Pedido, pagamento: { forma: string; valorPago: number; restante: number }) => void
}

export function PedidoDetalhesModal({
  pedido,
  aberto,
  onFechar,
  onImprimir,
  onAdicionarItens,
  onFinalizarPedido,
}: PedidoDetalhesModalProps) {
  const [mostrarPagamento, setMostrarPagamento] = useState(false)
  const [formaPagamento, setFormaPagamento] = useState<"dinheiro" | "pix" | "cartao">("dinheiro")
  const [valorPago, setValorPago] = useState("")
  const [finalizando, setFinalizando] = useState(false)

  if (!pedido) return null

  const total = pedido.total
  const valorPagoNum = parseFloat(valorPago) || 0
  const restante = Math.max(0, total - valorPagoNum)

  const handleFinalizar = async () => {
    if (!onFinalizarPedido) return
    setFinalizando(true)
    try {
      await onFinalizarPedido(pedido, {
        forma: formaPagamento,
        valorPago: valorPagoNum || total,
        restante: restante,
      })
      setMostrarPagamento(false)
      setValorPago("")
      onFechar()
    } catch (error) {
      console.error("Erro ao finalizar pedido:", error)
    } finally {
      setFinalizando(false)
    }
  }

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
      case "mesa": return <UtensilsCrossed className="h-5 w-5 text-emerald-500" />
      case "retirada": return <Package className="h-5 w-5" />
      default: return <Store className="h-5 w-5" />
    }
  }

  const getTipoLabel = () => {
    switch (pedido.tipo) {
      case "entrega": return "Entrega"
      case "mesa": return `Mesa ${pedido.mesa || ""}`
      case "retirada": return "Retirada"
      default: return "Balcao"
    }
  }

  const isMesa = pedido.tipo === "mesa"

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

            <div className={cn(
              "flex items-center gap-3",
              isMesa && "text-emerald-500 font-semibold"
            )}>
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

          {/* Botoes */}
          <div className="space-y-2">
            {/* Secao de Pagamento */}
            {mostrarPagamento && (
              <div className="bg-card/80 rounded-lg border-2 border-primary p-4 space-y-4">
                <h3 className="text-sm font-bold text-primary uppercase tracking-wider">
                  Finalizar Pagamento
                </h3>

                {/* Formas de pagamento */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "dinheiro", label: "Dinheiro", icon: Banknote },
                    { value: "pix", label: "PIX", icon: QrCode },
                    { value: "cartao", label: "Cartao", icon: CreditCard },
                  ].map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setFormaPagamento(p.value as typeof formaPagamento)}
                      className={cn(
                        "flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border-2 transition-all text-sm",
                        formaPagamento === p.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <p.icon className="h-4 w-4" />
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Campo valor pago (apenas para dinheiro) */}
                {formaPagamento === "dinheiro" && (
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">
                      Valor recebido (deixe vazio para pagar total):
                    </label>
                    <Input
                      type="number"
                      placeholder={`R$ ${total.toFixed(2)}`}
                      value={valorPago}
                      onChange={(e) => setValorPago(e.target.value)}
                      className="h-12 text-lg font-bold bg-background"
                    />
                    
                    {valorPagoNum > 0 && valorPagoNum < total && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                        <p className="text-sm text-red-500 font-bold">
                          Falta pagar: R$ {restante.toFixed(2)}
                        </p>
                      </div>
                    )}

                    {valorPagoNum > total && (
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                        <p className="text-sm text-green-500 font-bold">
                          Troco: R$ {(valorPagoNum - total).toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Resumo */}
                <div className="bg-primary/10 rounded-lg p-3 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Total do pedido:</span>
                    <span className="font-bold">R$ {total.toFixed(2)}</span>
                  </div>
                  {formaPagamento === "dinheiro" && valorPagoNum > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span>Valor recebido:</span>
                        <span className="font-bold text-green-500">R$ {valorPagoNum.toFixed(2)}</span>
                      </div>
                      {restante > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Restante:</span>
                          <span className="font-bold text-red-500">R$ {restante.toFixed(2)}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Botoes de acao */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMostrarPagamento(false)
                      setValorPago("")
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleFinalizar}
                    disabled={finalizando}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold"
                  >
                    {finalizando ? "Finalizando..." : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirmar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Botao Finalizar Pedido */}
            {onFinalizarPedido && !mostrarPagamento && pedido.status !== "finalizado" && (
              <Button
                onClick={() => setMostrarPagamento(true)}
                className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Finalizar Pedido
              </Button>
            )}

            {onAdicionarItens && (
              <Button
                onClick={() => onAdicionarItens(pedido)}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
              >
                <Plus className="h-5 w-5 mr-2" />
                Adicionar Itens
              </Button>
            )}
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
