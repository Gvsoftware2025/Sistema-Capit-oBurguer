import { NextResponse } from "next/server"
import { query, SCHEMA } from "@/lib/db"
import type { DbCategory } from "@/lib/db-types"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const categorias = await query<DbCategory>(
      `SELECT * FROM ${SCHEMA}.categories ORDER BY display_order`
    )
    return NextResponse.json({ categorias })
  } catch (error) {
    console.error("[API] Erro ao buscar categorias:", error)
    return NextResponse.json({ categorias: [], error: "Erro ao buscar" })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, display_order, is_active } = body

    const [categoria] = await query<DbCategory>(
      `INSERT INTO ${SCHEMA}.categories (name, description, display_order, is_active)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, description || null, display_order || 0, is_active ?? true]
    )

    return NextResponse.json({ categoria }, { status: 201 })
  } catch (error) {
    console.error("[API] Erro ao criar categoria:", error)
    return NextResponse.json({ error: "Erro ao criar" }, { status: 500 })
  }
}
