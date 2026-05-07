"use client"

import { useState } from "react"
import { Check, Clock, MapPin, ShoppingBag, Store, User } from "lucide-react"
import type { Pedido } from "@/lib/types"
import { toast } from "sonner"

const tipoIcon = {
  retirada: Store,
  entrega: MapPin,
  balcao: ShoppingBag,
} as const

const tipoLabel = {
  retirada: "Retirada",
  entrega: "Entrega",
  balcao: "Balcão",
} as const

function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function tempoDecorrido(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return "agora"
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  return `${h}h ${min % 60}min`
}

export function PedidoCard({
  pedido,
  isNovo,
  onFinalizar,
}: {
  pedido: Pedido
  isNovo?: boolean
  onFinalizar: (id: string) => Promise<void>
}) {
  const [finalizando, setFinalizando] = useState(false)
  const TipoIcon = tipoIcon[pedido.tipo]

  const handleFinalizar = async () => {
    if (finalizando) return
    setFinalizando(true)
    try {
      await onFinalizar(pedido.id)
      toast.success(`Pedido #${pedido.numero} finalizado`)
    } catch (e) {
      toast.error("Erro ao finalizar")
      setFinalizando(false)
    }
  }

  return (
    <article
      className={`flex flex-col gap-3 rounded-lg border-2 bg-card/80 p-4 backdrop-blur-sm transition-all ${
        isNovo
          ? "animate-new-order border-accent/70 shadow-[0_0_30px_oklch(0.62_0.22_30/0.5)]"
          : "border-border/60"
      }`}
    >
      {/* Header do card */}
      <div className="flex items-start justify-between gap-2 border-b border-border/50 pb-2">
        <div className="flex items-center gap-2">
          <span className="font-serif text-2xl font-black text-glow-gold">
            #{pedido.numero}
          </span>
          {pedido.origem === "funcionario" && (
            <span className="rounded bg-secondary px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-foreground/70">
              Interno
            </span>
          )}
        </div>
        <div className="flex flex-col items-end gap-0.5 text-xs">
          <span className="flex items-center gap-1 font-semibold text-foreground">
            <Clock className="h-3 w-3" />
            {formatHora(pedido.criadoEm)}
          </span>
          <span className="text-muted-foreground">
            {tempoDecorrido(pedido.criadoEm)}
          </span>
        </div>
      </div>

      {/* Cliente */}
      <div className="flex items-center gap-2 text-sm">
        <User className="h-4 w-4 shrink-0 text-primary" />
        <span className="font-bold">{pedido.cliente}</span>
      </div>

      {/* Tipo */}
      <div className="flex items-center gap-2 text-xs">
        <TipoIcon className="h-3.5 w-3.5 shrink-0 text-accent" />
        <span className="font-semibold uppercase tracking-wider text-accent">
          {tipoLabel[pedido.tipo]}
        </span>
        {pedido.endereco && (
          <span className="truncate text-muted-foreground">
            · {pedido.endereco}
          </span>
        )}
      </div>

      {/* Itens */}
      <ul className="flex flex-col gap-1.5 border-t border-border/50 pt-2">
        {pedido.itens.map((item, idx) => (
          <li
            key={idx}
            className="flex items-start justify-between gap-2 text-sm"
          >
            <span className="flex-1">
              <span className="mr-2 font-bold text-primary">
                {item.quantidade}x
              </span>
              {item.nome}
              {item.observacao && (
                <span className="block pl-6 text-xs italic text-muted-foreground">
                  → {item.observacao}
                </span>
              )}
            </span>
            <span className="text-xs text-muted-foreground">
              R$ {(item.preco * item.quantidade).toFixed(2)}
            </span>
          </li>
        ))}
      </ul>

      {/* Observação */}
      {pedido.observacao && (
        <div className="rounded-md border border-accent/40 bg-accent/10 p-2 text-xs">
          <p className="mb-0.5 font-bold uppercase tracking-wider text-accent">
            Obs:
          </p>
          <p className="text-foreground/90">{pedido.observacao}</p>
        </div>
      )}

      {/* Total */}
      <div className="flex items-center justify-between border-t border-border/50 pt-2">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          Total
        </span>
        <span className="font-serif text-lg font-bold text-glow-gold">
          R$ {pedido.total.toFixed(2)}
        </span>
      </div>

      {/* Botão Finalizar */}
      <button
        onClick={handleFinalizar}
        disabled={finalizando}
        className="mt-1 flex h-12 items-center justify-center gap-2 rounded-md bg-primary text-base font-bold uppercase tracking-wider text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_25px_oklch(0.78_0.16_75/0.5)] disabled:opacity-50"
      >
        <Check className="h-5 w-5" />
        {finalizando ? "Finalizando..." : "Finalizar Pedido"}
      </button>
    </article>
  )
}
