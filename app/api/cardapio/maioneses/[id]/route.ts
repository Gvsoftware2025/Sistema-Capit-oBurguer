import { NextResponse } from "next/server"
import { query, SCHEMA } from "@/lib/db"
import type { DbMaionese } from "@/lib/db-types"

export const dynamic = "force-dynamic"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, price, is_available } = body

    const [maionese] = await query<DbMaionese>(
      `UPDATE ${SCHEMA}.maioneses 
       SET name = $1, price = $2, is_available = $3
       WHERE id = $4
       RETURNING *`,
      [name, price, is_available ?? true, id]
    )

    if (!maionese) {
      return NextResponse.json({ error: "Maionese não encontrada" }, { status: 404 })
    }

    return NextResponse.json({ maionese })
  } catch (error) {
    console.error("[API] Erro ao atualizar maionese:", error)
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    await query(`DELETE FROM ${SCHEMA}.maioneses WHERE id = $1`, [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API] Erro ao excluir maionese:", error)
    return NextResponse.json({ error: "Erro ao excluir" }, { status: 500 })
  }
}
