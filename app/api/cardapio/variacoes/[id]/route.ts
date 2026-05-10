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

    const [variacao] = await query<DbProductVariation>(
      `UPDATE ${SCHEMA}.product_variations 
       SET name = $1, price = $2, is_available = $3
       WHERE id = $4
       RETURNING *`,
      [name, price, is_available ?? true, id]
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
