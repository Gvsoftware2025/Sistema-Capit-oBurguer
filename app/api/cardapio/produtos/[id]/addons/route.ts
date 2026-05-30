import { NextResponse } from "next/server"
import { query, SCHEMA } from "@/lib/db"

export const dynamic = "force-dynamic"

// Buscar addons associados a um produto especifico
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const productId = parseInt(id)

    if (isNaN(productId)) {
      return NextResponse.json({ error: "ID invalido" }, { status: 400 })
    }

    // Buscar addons associados ao produto via tabela product_addons
    const addons = await query(
      `SELECT a.* 
       FROM ${SCHEMA}.addons a
       JOIN ${SCHEMA}.product_addons pa ON a.id = pa.addon_id
       WHERE pa.product_id = $1 AND a.is_available = true
       ORDER BY a.name`,
      [productId]
    )

    return NextResponse.json({ addons })
  } catch (error) {
    console.error("[API] Erro ao buscar addons do produto:", error)
    return NextResponse.json({ addons: [], error: "Erro ao buscar" })
  }
}
