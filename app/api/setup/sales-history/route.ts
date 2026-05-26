import { query, SCHEMA } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Criar tabela de historico de vendas
    await query(`
      CREATE TABLE IF NOT EXISTS ${SCHEMA}.sales_history (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL,
        order_number INTEGER NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        delivery_type VARCHAR(20) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        subtotal DECIMAL(10, 2) DEFAULT 0,
        delivery_fee DECIMAL(10, 2) DEFAULT 0,
        total DECIMAL(10, 2) NOT NULL,
        items_json TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `)

    // Criar indice para busca por data
    await query(`
      CREATE INDEX IF NOT EXISTS idx_sales_history_created_at 
      ON ${SCHEMA}.sales_history(created_at)
    `)

    return NextResponse.json({ 
      success: true, 
      message: "Tabela sales_history criada com sucesso!" 
    })
  } catch (error) {
    console.error("Erro ao criar tabela:", error)
    return NextResponse.json({ 
      error: "Erro ao criar tabela",
      details: error instanceof Error ? error.message : "Erro desconhecido"
    }, { status: 500 })
  }
}
