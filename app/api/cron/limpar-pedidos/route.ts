import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

// Esta rota é chamada pelo Vercel Cron
// Configurar no vercel.json para rodar às 23:00 e 23:30

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
    const now = new Date()
    // Ajustar para fuso horário de Brasília (UTC-3)
    const brasiliaOffset = -3 * 60
    const localOffset = now.getTimezoneOffset()
    const brasilia = new Date(now.getTime() + (localOffset + brasiliaOffset) * 60 * 1000)
    
    const diaSemana = brasilia.getDay()
    const hora = brasilia.getHours()
    const minutos = brasilia.getMinutes()

    // Sexta (5), Sábado (6), Domingo (0)
    const isFimDeSemana = diaSemana === 0 || diaSemana === 5 || diaSemana === 6

    // Verificar se está no horário correto para limpar
    // Segunda a Quinta: 23:00
    // Sexta a Domingo: 23:30
    let deveLimpar = false
    
    if (isFimDeSemana && hora === 23 && minutos >= 25 && minutos <= 35) {
      deveLimpar = true
    } else if (!isFimDeSemana && hora === 23 && minutos >= 0 && minutos <= 10) {
      deveLimpar = true
    }

    if (!deveLimpar) {
      return NextResponse.json({ 
        message: "Fora do horário de limpeza",
        horaBrasilia: `${hora}:${minutos}`,
        diaSemana,
        isFimDeSemana
      })
    }

    // Deletar todos os itens dos pedidos primeiro (foreign key)
    await sql`DELETE FROM capitao_burguer.order_items`
    
    // Deletar todos os pedidos
    const result = await sql`DELETE FROM capitao_burguer.orders RETURNING id`
    
    // Resetar o contador diário
    await sql`
      UPDATE capitao_burguer.order_counter 
      SET last_number = 0, last_date = CURRENT_DATE
    `

    return NextResponse.json({ 
      success: true, 
      message: `${result.length} pedidos deletados`,
      horaBrasilia: `${hora}:${minutos}`,
      diaSemana
    })
  } catch (error) {
    console.error("Erro ao limpar pedidos:", error)
    return NextResponse.json({ error: "Erro ao limpar pedidos" }, { status: 500 })
  }
}
