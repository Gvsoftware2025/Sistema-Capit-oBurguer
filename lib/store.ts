import type { Pedido } from "./types"

/**
 * Store em memória para pedidos.
 * Em produção, substituir por banco de dados (Supabase, Neon, etc).
 * Em dev e em uma única instância serverless, persiste durante a vida do processo.
 */

declare global {
  // eslint-disable-next-line no-var
  var __capitaoBurguerStore: {
    pedidos: Pedido[]
    contador: number
  } | undefined
}

const store =
  globalThis.__capitaoBurguerStore ??
  (globalThis.__capitaoBurguerStore = {
    pedidos: [],
    contador: 1,
  })

export function listarPedidos(): Pedido[] {
  return [...store.pedidos].sort(
    (a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime(),
  )
}

export function listarPedidosAtivos(): Pedido[] {
  return store.pedidos
    .filter((p) => p.status !== "finalizado")
    .sort(
      (a, b) =>
        new Date(a.criadoEm).getTime() - new Date(b.criadoEm).getTime(),
    )
}

export function listarPedidosFinalizados(): Pedido[] {
  return store.pedidos
    .filter((p) => p.status === "finalizado")
    .sort(
      (a, b) =>
        new Date(b.finalizadoEm ?? b.criadoEm).getTime() -
        new Date(a.finalizadoEm ?? a.criadoEm).getTime(),
    )
}

export function criarPedido(
  data: Omit<Pedido, "id" | "numero" | "status" | "criadoEm">,
): Pedido {
  const numero = store.contador++
  const pedido: Pedido = {
    ...data,
    id: `ped_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    numero,
    status: "novo",
    criadoEm: new Date().toISOString(),
  }
  store.pedidos.unshift(pedido)
  return pedido
}

export function finalizarPedido(id: string): Pedido | null {
  const pedido = store.pedidos.find((p) => p.id === id)
  if (!pedido) return null
  pedido.status = "finalizado"
  pedido.finalizadoEm = new Date().toISOString()
  return pedido
}

export function atualizarStatus(
  id: string,
  status: Pedido["status"],
): Pedido | null {
  const pedido = store.pedidos.find((p) => p.id === id)
  if (!pedido) return null
  pedido.status = status
  if (status === "finalizado") pedido.finalizadoEm = new Date().toISOString()
  return pedido
}
