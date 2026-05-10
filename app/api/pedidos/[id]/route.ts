import { NextResponse } from "next/server"
import { query, SCHEMA } from "@/lib/db"
import type { DbOrder } from "@/lib/db-types"

export const dynamic = "force-dynamic"

const STATUS_MAP: Record<string, string> = {
  novo: "pendente",
  preparando: "preparando",
  pronto: "pronto",
  finalizado: "entregue",
  cancelado: "cancelado",
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json().catch(() => ({}))

    const action = body.action as "finalizar" | "status" | undefined
    
    if (action === "finalizar") {
      const [pedido] = await query<DbOrder>(
        `UPDATE ${SCHEMA}.orders 
         SET status = 'entregue', updated_at = NOW() 
         WHERE id = $1 
         RETURNING *`,
        [id]
      )
      
      if (!pedido) {
        return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 })
      }
      
      return NextResponse.json({
        pedido: {
          id: pedido.id.toString(),
          numero: pedido.order_number,
          status: "finalizado",
        },
      })
    }

    const status = body.status as string | undefined
    if (status) {
      const dbStatus = STATUS_MAP[status] || status
      
      const [pedido] = await query<DbOrder>(
        `UPDATE ${SCHEMA}.orders 
         SET status = $1, updated_at = NOW() 
         WHERE id = $2 
         RETURNING *`,
        [dbStatus, id]
      )
      
      if (!pedido) {
        return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 })
      }
      
      return NextResponse.json({
        pedido: {
          id: pedido.id.toString(),
          numero: pedido.order_number,
          status: pedido.status === "pendente" ? "novo" : pedido.status,
        },
      })
    }

    return NextResponse.json(
      { error: "action ou status não informado" },
      { status: 400 }
    )
  } catch (error) {
    console.error("[API] Erro ao atualizar pedido:", error)
    return NextResponse.json(
      { error: "Erro ao atualizar pedido" },
      { status: 500 }
    )
  }
}
