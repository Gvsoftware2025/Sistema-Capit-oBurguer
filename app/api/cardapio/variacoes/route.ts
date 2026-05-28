import { NextResponse } from "next/server"
import { query, SCHEMA } from "@/lib/db"
import type { DbProductVariation } from "@/lib/db-types"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("product_id")
    
    let variacoes: DbProductVariation[]
    
    if (productId) {
      // Filtrar por produto específico
      variacoes = await query<DbProductVariation>(
        `SELECT pv.*, p.name as product_name 
         FROM ${SCHEMA}.product_variations pv 
         JOIN ${SCHEMA}.products p ON pv.product_id = p.id
         WHERE pv.product_id = $1
         ORDER BY pv.name`,
        [parseInt(productId)]
      )
    } else {
      // Retornar todas
      variacoes = await query<DbProductVariation>(
        `SELECT pv.*, p.name as product_name 
         FROM ${SCHEMA}.product_variations pv 
         JOIN ${SCHEMA}.products p ON pv.product_id = p.id
         ORDER BY p.name, pv.name`
      )
    }
    
    return NextResponse.json({ variacoes })
  } catch (error) {
    console.error("[API] Erro ao buscar variações:", error)
    return NextResponse.json({ variacoes: [], error: "Erro ao buscar" })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { product_id, name, price, is_available } = body

    const [variacao] = await query<DbProductVariation>(
      `INSERT INTO ${SCHEMA}.product_variations (product_id, name, price, is_available)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [product_id, name, price, is_available ?? true]
    )

    return NextResponse.json({ variacao }, { status: 201 })
  } catch (error) {
    console.error("[API] Erro ao criar variação:", error)
    return NextResponse.json({ error: "Erro ao criar" }, { status: 500 })
  }
}
