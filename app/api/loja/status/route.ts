import { NextResponse } from "next/server"
import { query } from "@/lib/db"

const SCHEMA = "capitao_burguer"

interface StoreConfig {
  value: string
  updated_at: Date
}

// GET - Buscar status atual
export async function GET() {
  try {
    const result = await query<StoreConfig>(
      `SELECT value, updated_at FROM ${SCHEMA}.store_config WHERE key = 'is_open'`
    )

    if (result.length === 0) {
      // Se não existe, criar com valor padrão false
      await query(
        `INSERT INTO ${SCHEMA}.store_config (key, value) VALUES ('is_open', 'false') ON CONFLICT (key) DO NOTHING`
      )
      return NextResponse.json({ isOpen: false, updatedAt: new Date() })
    }

    return NextResponse.json({
      isOpen: result[0].value === "true",
      updatedAt: result[0].updated_at,
    })
  } catch (error) {
    console.error("[API] Erro ao buscar status da loja:", error)
    return NextResponse.json({ isOpen: false, updatedAt: null, error: "Erro ao buscar" })
  }
}

// PUT - Atualizar status
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { isOpen } = body

    const value = isOpen ? "true" : "false"

    await query(
      `UPDATE ${SCHEMA}.store_config SET value = $1, updated_at = NOW() WHERE key = 'is_open'`,
      [value]
    )

    const result = await query<StoreConfig>(
      `SELECT value, updated_at FROM ${SCHEMA}.store_config WHERE key = 'is_open'`
    )

    return NextResponse.json({
      isOpen: result[0]?.value === "true",
      updatedAt: result[0]?.updated_at,
    })
  } catch (error) {
    console.error("[API] Erro ao atualizar status da loja:", error)
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 })
  }
}
