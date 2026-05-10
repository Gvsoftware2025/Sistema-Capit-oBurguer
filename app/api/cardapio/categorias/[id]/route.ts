import { NextResponse } from "next/server"
import { query, SCHEMA } from "@/lib/db"
import type { DbCategory } from "@/lib/db-types"

export const dynamic = "force-dynamic"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, is_active } = body

    const [categoria] = await query<DbCategory>(
      `UPDATE ${SCHEMA}.categories 
       SET name = $1, description = $2, is_active = $3
       WHERE id = $4
       RETURNING *`,
      [name, description || null, is_active ?? true, id]
    )

    if (!categoria) {
      return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 })
    }

    return NextResponse.json({ categoria })
  } catch (error) {
    console.error("[API] Erro ao atualizar categoria:", error)
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    await query(`DELETE FROM ${SCHEMA}.categories WHERE id = $1`, [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API] Erro ao excluir categoria:", error)
    return NextResponse.json({ error: "Erro ao excluir" }, { status: 500 })
  }
}
