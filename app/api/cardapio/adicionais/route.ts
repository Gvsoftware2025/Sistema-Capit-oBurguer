import { NextResponse } from "next/server"
import { query, SCHEMA } from "@/lib/db"
import type { DbAddon } from "@/lib/db-types"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const adicionais = await query<DbAddon>(
      `SELECT * FROM ${SCHEMA}.addons ORDER BY display_order`
    )
    return NextResponse.json({ adicionais })
  } catch (error) {
    console.error("[API] Erro ao buscar adicionais:", error)
    return NextResponse.json({ adicionais: [], error: "Erro ao buscar" })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, price, max_quantity, is_available } = body

    const [adicional] = await query<DbAddon>(
      `INSERT INTO ${SCHEMA}.addons (name, price, max_quantity, is_available)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, price, max_quantity || 10, is_available ?? true]
    )

    return NextResponse.json({ adicional }, { status: 201 })
  } catch (error) {
    console.error("[API] Erro ao criar adicional:", error)
    return NextResponse.json({ error: "Erro ao criar" }, { status: 500 })
  }
}
