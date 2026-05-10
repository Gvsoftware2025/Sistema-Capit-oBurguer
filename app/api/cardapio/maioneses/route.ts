import { NextResponse } from "next/server"
import { query, SCHEMA } from "@/lib/db"
import type { DbMaionese } from "@/lib/db-types"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const maioneses = await query<DbMaionese>(
      `SELECT * FROM ${SCHEMA}.maioneses ORDER BY display_order`
    )
    return NextResponse.json({ maioneses })
  } catch (error) {
    console.error("[API] Erro ao buscar maioneses:", error)
    return NextResponse.json({ maioneses: [], error: "Erro ao buscar" })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, price, is_available } = body

    const [maionese] = await query<DbMaionese>(
      `INSERT INTO ${SCHEMA}.maioneses (name, price, is_available)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, price, is_available ?? true]
    )

    return NextResponse.json({ maionese }, { status: 201 })
  } catch (error) {
    console.error("[API] Erro ao criar maionese:", error)
    return NextResponse.json({ error: "Erro ao criar" }, { status: 500 })
  }
}
