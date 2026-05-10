import { NextResponse } from "next/server"
import { query, SCHEMA } from "@/lib/db"
import type { DbProduct } from "@/lib/db-types"

export const dynamic = "force-dynamic"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, price, category_id, is_available } = body

    const [produto] = await query<DbProduct>(
      `UPDATE ${SCHEMA}.products 
       SET name = $1, description = $2, price = $3, category_id = $4, is_available = $5
       WHERE id = $6
       RETURNING *`,
      [name, description || null, price, category_id, is_available ?? true, id]
    )

    if (!produto) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
    }

    return NextResponse.json({ produto })
  } catch (error) {
    console.error("[API] Erro ao atualizar produto:", error)
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    await query(`DELETE FROM ${SCHEMA}.products WHERE id = $1`, [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API] Erro ao excluir produto:", error)
    return NextResponse.json({ error: "Erro ao excluir" }, { status: 500 })
  }
}
