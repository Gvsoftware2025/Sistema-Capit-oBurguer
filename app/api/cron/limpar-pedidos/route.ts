import { query } from "@/lib/db"
import { NextResponse } from "next/server"

// Esta rota é chamada pelo Vercel Cron
// Roda automaticamente nos horarios configurados no vercel.json

export async function GET(request: Request) {
  // Verificar se é uma chamada do Vercel Cron
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Se não tiver CRON_SECRET configurado, permitir (para testes)
    if (process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  try {
    // Deletar todos os itens dos pedidos primeiro (foreign key)
    await query("DELETE FROM capitao_burguer.order_items")
    
    // Deletar todos os pedidos
    const result = await query<{ id: number }>("DELETE FROM capitao_burguer.orders RETURNING id")
    
    // Resetar o contador diário
    await query(`
      UPDATE capitao_burguer.order_counter 
      SET last_number = 0, last_date = CURRENT_DATE
    `)

    const now = new Date()
    
    return NextResponse.json({ 
      success: true, 
      message: `${result.length} pedidos deletados`,
      executadoEm: now.toISOString()
    })
  } catch (error) {
    console.error("Erro ao limpar pedidos:", error)
    return NextResponse.json({ error: "Erro ao limpar pedidos" }, { status: 500 })
  }
}
