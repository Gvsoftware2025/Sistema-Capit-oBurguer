import { NextResponse } from "next/server"
import { query, SCHEMA } from "@/lib/db"
import type { DbAddon } from "@/lib/db-types"

export const dynamic = "force-dynamic"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, price, max_quantity, is_available } = body

    const [adicional] = await query<DbAddon>(
      `UPDATE ${SCHEMA}.addons 
       SET name = $1, price = $2, max_quantity = $3, is_available = $4
       WHERE id = $5
       RETURNING *`,
      [name, price, max_quantity || 10, is_available ?? true, id]
    )

    if (!adicional) {
      return NextResponse.json({ error: "Adicional não encontrado" }, { status: 404 })
    }

    return NextResponse.json({ adicional })
  } catch (error) {
    console.error("[API] Erro ao atualizar adicional:", error)
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    await query(`DELETE FROM ${SCHEMA}.addons WHERE id = $1`, [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API] Erro ao excluir adicional:", error)
    return NextResponse.json({ error: "Erro ao excluir" }, { status: 500 })
  }
}
