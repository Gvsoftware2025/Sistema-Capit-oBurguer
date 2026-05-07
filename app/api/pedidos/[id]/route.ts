import { NextResponse } from "next/server"
import { atualizarStatus, finalizarPedido } from "@/lib/store"
import type { StatusPedido } from "@/lib/types"

export const dynamic = "force-dynamic"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const body = await request.json().catch(() => ({}))

  const action = body.action as "finalizar" | "status" | undefined
  if (action === "finalizar") {
    const pedido = finalizarPedido(id)
    if (!pedido) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 })
    }
    return NextResponse.json({ pedido })
  }

  const status = body.status as StatusPedido | undefined
  if (status) {
    const pedido = atualizarStatus(id, status)
    if (!pedido) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 })
    }
    return NextResponse.json({ pedido })
  }

  return NextResponse.json(
    { error: "action ou status não informado" },
    { status: 400 },
  )
}
