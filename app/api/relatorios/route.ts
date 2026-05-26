import { NextResponse } from "next/server"
import { query, SCHEMA } from "@/lib/db"
import type { DbSalesHistory } from "@/lib/db-types"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const periodo = searchParams.get("periodo") || "hoje" // hoje, semana, mes, ano, custom
    const dataInicio = searchParams.get("dataInicio")
    const dataFim = searchParams.get("dataFim")

    let whereClause = ""
    const params: (string | Date)[] = []

    // Ajustar para fuso horário de Brasília (UTC-3)
    const now = new Date()
    const brasiliaOffset = -3 * 60 * 60 * 1000
    const brasilia = new Date(now.getTime() + brasiliaOffset)

    if (periodo === "custom" && dataInicio && dataFim) {
      whereClause = "WHERE created_at >= $1 AND created_at <= $2"
      params.push(dataInicio, dataFim + "T23:59:59.999Z")
    } else if (periodo === "hoje") {
      const hoje = brasilia.toISOString().split("T")[0]
      whereClause = "WHERE DATE(created_at AT TIME ZONE 'America/Sao_Paulo') = $1"
      params.push(hoje)
    } else if (periodo === "semana") {
      whereClause = "WHERE created_at >= NOW() - INTERVAL '7 days'"
    } else if (periodo === "mes") {
      whereClause = "WHERE DATE_TRUNC('month', created_at AT TIME ZONE 'America/Sao_Paulo') = DATE_TRUNC('month', NOW() AT TIME ZONE 'America/Sao_Paulo')"
    } else if (periodo === "ano") {
      whereClause = "WHERE DATE_TRUNC('year', created_at AT TIME ZONE 'America/Sao_Paulo') = DATE_TRUNC('year', NOW() AT TIME ZONE 'America/Sao_Paulo')"
    }

    // Buscar vendas
    const vendas = await query<DbSalesHistory>(
      `SELECT * FROM ${SCHEMA}.sales_history ${whereClause} ORDER BY created_at DESC`,
      params
    )

    // Calcular metricas
    const faturamentoTotal = vendas.reduce((acc, v) => acc + Number(v.total), 0)
    const totalPedidos = vendas.length
    const ticketMedio = totalPedidos > 0 ? faturamentoTotal / totalPedidos : 0

    // Pedidos por tipo
    const pedidosEntrega = vendas.filter(v => v.delivery_type === "entregar").length
    const pedidosRetirada = vendas.filter(v => v.delivery_type === "retirar").length

    // Pedidos por forma de pagamento
    const porPagamento: { [key: string]: number } = {}
    vendas.forEach(v => {
      porPagamento[v.payment_method] = (porPagamento[v.payment_method] || 0) + 1
    })

    // Produtos mais vendidos
    const produtosVendidos: { [nome: string]: { quantidade: number; total: number } } = {}
    vendas.forEach(v => {
      try {
        const itens = JSON.parse(v.items_json)
        itens.forEach((item: { nome: string; quantidade: number; preco: number }) => {
          if (!produtosVendidos[item.nome]) {
            produtosVendidos[item.nome] = { quantidade: 0, total: 0 }
          }
          produtosVendidos[item.nome].quantidade += item.quantidade
          produtosVendidos[item.nome].total += item.preco * item.quantidade
        })
      } catch {
        // Ignora erros de parse
      }
    })

    const topProdutos = Object.entries(produtosVendidos)
      .map(([nome, dados]) => ({ nome, ...dados }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10)

    // Vendas por dia (para grafico)
    const vendasPorDia: { [data: string]: { total: number; pedidos: number } } = {}
    vendas.forEach(v => {
      const data = new Date(v.created_at).toISOString().split("T")[0]
      if (!vendasPorDia[data]) {
        vendasPorDia[data] = { total: 0, pedidos: 0 }
      }
      vendasPorDia[data].total += Number(v.total)
      vendasPorDia[data].pedidos += 1
    })

    const graficoVendas = Object.entries(vendasPorDia)
      .map(([data, dados]) => ({
        data,
        total: dados.total,
        pedidos: dados.pedidos
      }))
      .sort((a, b) => a.data.localeCompare(b.data))

    // Vendas por hora (para grafico)
    const vendasPorHora: { [hora: number]: { total: number; pedidos: number } } = {}
    vendas.forEach(v => {
      const hora = new Date(v.created_at).getHours()
      if (!vendasPorHora[hora]) {
        vendasPorHora[hora] = { total: 0, pedidos: 0 }
      }
      vendasPorHora[hora].total += Number(v.total)
      vendasPorHora[hora].pedidos += 1
    })

    const graficoHoras = Object.entries(vendasPorHora)
      .map(([hora, dados]) => ({
        hora: `${hora}h`,
        total: dados.total,
        pedidos: dados.pedidos
      }))
      .sort((a, b) => parseInt(a.hora) - parseInt(b.hora))

    return NextResponse.json({
      metricas: {
        faturamentoTotal,
        totalPedidos,
        ticketMedio,
        pedidosEntrega,
        pedidosRetirada,
      },
      topProdutos,
      porPagamento,
      graficoVendas,
      graficoHoras,
      vendas: vendas.slice(0, 50) // Ultimas 50 vendas
    })
  } catch (error) {
    console.error("[API] Erro ao buscar relatorios:", error)
    return NextResponse.json({ error: "Erro ao buscar relatorios" }, { status: 500 })
  }
}
