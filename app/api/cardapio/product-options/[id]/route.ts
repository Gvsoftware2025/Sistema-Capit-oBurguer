import { NextResponse } from "next/server"
import { query, SCHEMA } from "@/lib/db"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const [option] = await query(
      `UPDATE ${SCHEMA}.product_options
       SET product_id = $1, option_group = $2, option_name = $3,
           display_order = $4, is_available = $5, is_required = $6
       WHERE id = $7 RETURNING *`,
      [body.product_id, body.option_group, body.option_name, body.display_order ?? 0, body.is_available ?? true, body.is_required ?? true, id]
    )
    return option ? NextResponse.json({ option }) : NextResponse.json({ error: "Opção não encontrada" }, { status: 404 })
  } catch (error) {
    console.error("[API] Erro ao atualizar opção:", error)
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await query(`DELETE FROM ${SCHEMA}.product_options WHERE id = $1`, [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API] Erro ao excluir opção:", error)
    return NextResponse.json({ error: "Erro ao excluir" }, { status: 500 })
  }
}
