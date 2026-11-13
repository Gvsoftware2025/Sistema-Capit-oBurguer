import { NextResponse } from "next/server"
import { query, SCHEMA } from "@/lib/db"
import type { DbProductVariation } from "@/lib/db-types"

export const dynamic = "force-dynamic"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, price, is_available } = body
    const parsedPrice = Number(price)
    if (typeof name !== "string" || !name.trim() || !Number.isFinite(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json({ error: "Nome e preço válidos são obrigatórios" }, { status: 400 })
    }

    const [variacao] = await query<DbProductVariation>(
      `UPDATE ${SCHEMA}.product_variations
       SET name = $1,
           price = $2,
           is_available = COALESCE($3, is_available)
       WHERE id = $4
       RETURNING id, product_id, name, price, is_available`,
      [name.trim(), parsedPrice, typeof is_available === "boolean" ? is_available : null, id]
    )

    if (!variacao) {
      return NextResponse.json({ error: "Variação não encontrada" }, { status: 404 })
    }

    return NextResponse.json({ variacao })
  } catch (error) {
    console.error("[API] Erro ao atualizar variação:", error)
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    await query(`DELETE FROM ${SCHEMA}.product_variations WHERE id = $1`, [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API] Erro ao excluir variação:", error)
    return NextResponse.json({ error: "Erro ao excluir" }, { status: 500 })
  }
}
