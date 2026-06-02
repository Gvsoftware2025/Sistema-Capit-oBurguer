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
    const formaPagamento = body.formaPagamento as string | undefined
    const valorPago = body.valorPago as number | undefined
    const valorRestante = body.valorRestante as number | undefined

    if (status) {
      const dbStatus = STATUS_MAP[status] || status
      
      // Se está finalizando, também salva a forma de pagamento
      let updateQuery = `UPDATE ${SCHEMA}.orders SET status = $1, updated_at = NOW()`
      const params: (string | number)[] = [dbStatus]
      let paramIndex = 2

      if (formaPagamento) {
        updateQuery += `, payment_method = $${paramIndex}`
        params.push(formaPagamento)
        paramIndex++
      }

      // Se tiver valor restante (pagamento parcial), salva nas notas
      if (valorRestante && valorRestante > 0) {
        const nota = `Pagamento parcial: R$ ${valorPago?.toFixed(2)} - Restante: R$ ${valorRestante.toFixed(2)}`
        updateQuery += `, notes = COALESCE(notes, '') || ' | ' || $${paramIndex}`
        params.push(nota)
        paramIndex++
      }

      updateQuery += ` WHERE id = $${paramIndex} RETURNING *`
      params.push(id)
      
      const [pedido] = await query<DbOrder>(updateQuery, params)
      
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Primeiro deleta os itens do pedido
    await query(
      `DELETE FROM ${SCHEMA}.order_items WHERE order_id = $1`,
      [id]
    )

    // Depois deleta o pedido
    const [pedido] = await query<DbOrder>(
      `DELETE FROM ${SCHEMA}.orders WHERE id = $1 RETURNING *`,
      [id]
    )

    if (!pedido) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true, id })
  } catch (error) {
    console.error("[API] Erro ao excluir pedido:", error)
    return NextResponse.json(
      { error: "Erro ao excluir pedido" },
      { status: 500 }
    )
  }
}
