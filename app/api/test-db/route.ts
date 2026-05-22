import { NextResponse } from "next/server"
import { query, SCHEMA } from "@/lib/db"

export async function GET() {
  try {
    // Verificar tabelas existentes
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = $1
    `, [SCHEMA])
    
    // Verificar produtos
    const produtos = await query(`SELECT COUNT(*) as count FROM ${SCHEMA}.products`)
    
    // Verificar categorias
    const categorias = await query(`SELECT COUNT(*) as count FROM ${SCHEMA}.categories`)
    
    return NextResponse.json({ 
      success: true,
      schema: SCHEMA,
      tables,
      produtosCount: produtos[0],
      categoriasCount: categorias[0]
    })
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message,
      code: error.code 
    }, { status: 500 })
  }
}
