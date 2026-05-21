import { NextResponse } from "next/server"
import { query, SCHEMA } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("product_id")

    let sql = `
      SELECT po.*, p.name as product_name 
      FROM ${SCHEMA}.product_options po 
      JOIN ${SCHEMA}.products p ON po.product_id = p.id
    `
    const params: any[] = []

    if (productId) {
      sql += ` WHERE po.product_id = $1`
      params.push(productId)
    }

    sql += ` ORDER BY po.option_group, po.display_order`

    const options = await query(sql, params)

    return NextResponse.json({ options })
  } catch (error) {
    console.error("[API] Erro ao buscar opcoes:", error)
    return NextResponse.json({ options: [], error: "Erro ao buscar" })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { product_id, option_group, option_name, display_order, is_available } = body

    const [option] = await query(
      `INSERT INTO ${SCHEMA}.product_options (product_id, option_group, option_name, display_order, is_available)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [product_id, option_group, option_name, display_order || 0, is_available ?? true]
    )

    return NextResponse.json({ option }, { status: 201 })
  } catch (error) {
    console.error("[API] Erro ao criar opcao:", error)
    return NextResponse.json({ error: "Erro ao criar" }, { status: 500 })
  }
}
