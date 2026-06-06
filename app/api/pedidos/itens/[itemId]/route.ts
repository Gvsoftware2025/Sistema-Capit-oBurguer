import { NextResponse } from "next/server"
import { query, SCHEMA } from "@/lib/db"

export const dynamic = "force-dynamic"

// Atualizar quantidade de um item
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params
    const body = await request.json().catch(() => ({}))
    const novaQuantidade = Number(body.quantidade)

    if (!novaQuantidade || novaQuantidade < 1) {
      return NextResponse.json({ error: "Quantidade invalida" }, { status: 400 })
    }

    // Buscar o item atual
    const [item] = await query<{ id: number; order_id: number; product_price: string; quantity: number; item_total: string }>(
      `SELECT id, order_id, product_price, quantity, item_total FROM ${SCHEMA}.order_items WHERE id = $1`,
      [itemId]
    )

    if (!item) {
      return NextResponse.json({ error: "Item nao encontrado" }, { status: 404 })
    }

    // Preco unitario (item_total atual / quantidade atual)
    const precoUnitario = Number(item.item_total) / item.quantity
    const novoItemTotal = precoUnitario * novaQuantidade
    const diferenca = novoItemTotal - Number(item.item_total)

    // Atualizar o item
    await query(
      `UPDATE ${SCHEMA}.order_items SET quantity = $1, item_total = $2 WHERE id = $3`,
      [novaQuantidade, novoItemTotal, itemId]
    )

    // Atualizar o total do pedido
    await query(
      `UPDATE ${SCHEMA}.orders SET total = total + $1, subtotal = COALESCE(subtotal, 0) + $1, updated_at = NOW() WHERE id = $2`,
      [diferenca, item.order_id]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API] Erro ao atualizar item:", error)
    return NextResponse.json({ error: "Erro ao atualizar item" }, { status: 500 })
  }
}

// Excluir um item do pedido
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params

    // Buscar o item para saber o valor e o pedido
    const [item] = await query<{ id: number; order_id: number; item_total: string }>(
      `SELECT id, order_id, item_total FROM ${SCHEMA}.order_items WHERE id = $1`,
      [itemId]
    )

    if (!item) {
      return NextResponse.json({ error: "Item nao encontrado" }, { status: 404 })
    }

    // Verificar quantos itens o pedido tem
    const [{ count }] = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM ${SCHEMA}.order_items WHERE order_id = $1`,
      [item.order_id]
    )

    // Excluir o item
    await query(`DELETE FROM ${SCHEMA}.order_items WHERE id = $1`, [itemId])

    // Se era o ultimo item, excluir o pedido inteiro
    if (Number(count) <= 1) {
      await query(`DELETE FROM ${SCHEMA}.orders WHERE id = $1`, [item.order_id])
      return NextResponse.json({ success: true, pedidoExcluido: true })
    }

    // Senao, atualizar o total do pedido
    await query(
      `UPDATE ${SCHEMA}.orders SET total = total - $1, subtotal = GREATEST(0, COALESCE(subtotal, 0) - $1), updated_at = NOW() WHERE id = $2`,
      [Number(item.item_total), item.order_id]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API] Erro ao excluir item:", error)
    return NextResponse.json({ error: "Erro ao excluir item" }, { status: 500 })
  }
}
