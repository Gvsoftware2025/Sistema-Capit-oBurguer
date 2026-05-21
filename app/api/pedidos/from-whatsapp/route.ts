import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { parseWhatsAppOrder } from "@/lib/parse-whatsapp-order"

const SCHEMA = process.env.DB_SCHEMA || "capitao_burguer"

// Endpoint para receber mensagens formatadas do WhatsApp e criar pedidos
// POST /api/pedidos/from-whatsapp
// Body: { message: "texto da mensagem do whatsapp" }

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { message } = body

    if (!message) {
      return NextResponse.json(
        { error: "Mensagem nao fornecida" },
        { status: 400 }
      )
    }

    // Parsear a mensagem
    const parsed = parseWhatsAppOrder(message)

    if (!parsed || parsed.itens.length === 0) {
      return NextResponse.json(
        { error: "Nao foi possivel extrair o pedido da mensagem" },
        { status: 400 }
      )
    }

    // Gerar numero do pedido
    const result = await query<{ max_number: number }>(
      `SELECT COALESCE(MAX(order_number), 0) + 1 as max_number FROM ${SCHEMA}.orders`
    )
    const max_number = result[0]?.max_number ?? 1

    // Criar o pedido
    const [pedido] = await query<{ id: number; order_number: number }>(
      `INSERT INTO ${SCHEMA}.orders 
        (order_number, customer_name, customer_phone, customer_address, delivery_type, payment_method, total, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        max_number,
        parsed.cliente,
        parsed.telefone || null,
        parsed.endereco || null,
        parsed.tipo,
        parsed.pagamento,
        parsed.total,
        null
      ]
    )

    // Inserir itens com acompanhamentos
    for (const item of parsed.itens) {
      await query(
        `INSERT INTO ${SCHEMA}.order_items 
          (order_id, product_name, quantity, acompanhamentos, item_total)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          pedido.id,
          item.nome,
          item.quantidade,
          item.acompanhamentos || null,
          item.preco * item.quantidade
        ]
      )
    }

    return NextResponse.json({
      success: true,
      pedido: {
        id: pedido.id,
        numero: pedido.order_number,
        cliente: parsed.cliente,
        itens: parsed.itens
      }
    })

  } catch (error) {
    console.error("[API] Erro ao processar mensagem WhatsApp:", error)
    return NextResponse.json(
      { error: "Erro ao processar pedido" },
      { status: 500 }
    )
  }
}
