import { NextResponse } from "next/server"
import { query, SCHEMA } from "@/lib/db"
import type { DbProduct } from "@/lib/db-types"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const produtos = await query<DbProduct>(
      `SELECT p.*, c.name as category_name 
       FROM ${SCHEMA}.products p 
       JOIN ${SCHEMA}.categories c ON p.category_id = c.id 
       ORDER BY c.display_order, p.display_order`
    )
    return NextResponse.json({ produtos })
  } catch (error) {
    console.error("[API] Erro ao buscar produtos:", error)
    return NextResponse.json({ produtos: [], error: "Erro ao buscar" })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { category_id, name, description, price, image_url, is_available } = body

    const [produto] = await query<DbProduct>(
      `INSERT INTO ${SCHEMA}.products (category_id, name, description, price, image_url, is_available)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [category_id, name, description || null, price, image_url || null, is_available ?? true]
    )

    return NextResponse.json({ produto }, { status: 201 })
  } catch (error) {
    console.error("[API] Erro ao criar produto:", error)
    return NextResponse.json({ error: "Erro ao criar" }, { status: 500 })
  }
}
