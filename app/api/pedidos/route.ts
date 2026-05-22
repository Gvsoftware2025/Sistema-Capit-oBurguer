import { NextResponse } from "next/server"
import { query, SCHEMA } from "@/lib/db"
import type { DbOrder } from "@/lib/db-types"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const filtro = searchParams.get("filtro")

    let whereClause = ""
    if (filtro === "ativos") {
      whereClause = "WHERE o.status IN ('pendente', 'preparando', 'pronto')"
    } else if (filtro === "finalizados") {
      whereClause = "WHERE o.status IN ('entregue', 'cancelado')"
    }

    const pedidos = await query<DbOrder>(`
      SELECT o.*, 
        COALESCE(json_agg(
          json_build_object(
            'id', oi.id,
            'productName', oi.product_name,
            'quantity', oi.quantity,
            'variationName', oi.variation_name,
            'maionese', oi.maionese,
            'extraMaioneses', oi.extra_maioneses,
            'addons', oi.addons,
            'acompanhamentos', oi.acompanhamentos,
            'itemTotal', oi.item_total
          )
        ) FILTER (WHERE oi.id IS NOT NULL), '[]') as items
      FROM ${SCHEMA}.orders o
      LEFT JOIN ${SCHEMA}.order_items oi ON o.id = oi.order_id
      ${whereClause}
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `)





    // Mapear para o formato do frontend
    const pedidosMapeados = pedidos.map((p) => ({
      id: p.id.toString(),
      numero: p.order_number,
      cliente: p.customer_name,
      endereco: p.customer_address,
      tipo: p.delivery_type === "entregar" ? "entrega" : "retirada",
      pagamento: p.payment_method,
      total: Number(p.total),
      status: p.status === "pendente" ? "novo" : p.status,
      criadoEm: p.created_at,
      itens: (p.items || []).map((it: any) => {
        // Parsear adicionais - pode ser array de strings ou array de objetos JSON
        let adicionaisParsed: any[] = []
        if (it.addons) {
          try {
            // Se for string JSON, parsear
            const addons = typeof it.addons === "string" ? JSON.parse(it.addons) : it.addons
            adicionaisParsed = Array.isArray(addons) ? addons.map((add: any) => {
              if (typeof add === "string") {
                return { nome: add, quantidade: 1, preco: 0 }
              }
              return {
                nome: add.name || add.nome || "Adicional",
                quantidade: add.quantity || add.quantidade || 1,
                preco: Number(add.price || add.preco || 0)
              }
            }) : []
          } catch {
            adicionaisParsed = []
          }
        }

        // Parsear maioneses extras
        let extraMaioParsed: string[] = []
        if (it.extraMaioneses) {
          try {
            const extras = typeof it.extraMaioneses === "string" ? JSON.parse(it.extraMaioneses) : it.extraMaioneses
            extraMaioParsed = Array.isArray(extras) ? extras : []
          } catch {
            extraMaioParsed = []
          }
        }

        return {
          id: it.id?.toString(),
          nome: it.productName,
          quantidade: it.quantity,
          variacao: it.variationName,
          maionese: it.maionese,
          extraMaioneses: extraMaioParsed,
          adicionais: adicionaisParsed,
          acompanhamentos: it.acompanhamentos,
          preco: Number(it.itemTotal) / it.quantity,
        }
      }),
    }))

    return NextResponse.json({ pedidos: pedidosMapeados })
  } catch (error) {
    console.error("[API] Erro ao buscar pedidos:", error)
    return NextResponse.json({ pedidos: [], error: "Erro ao buscar pedidos" })
  }
}

export async function DELETE() {
  try {
    // Primeiro excluir os itens dos pedidos
    await query(`DELETE FROM ${SCHEMA}.order_items`)
    // Depois excluir os pedidos
    await query(`DELETE FROM ${SCHEMA}.orders`)

    return NextResponse.json({ success: true, message: "Todos os pedidos foram excluídos" })
  } catch (error) {
    console.error("[API] Erro ao excluir todos os pedidos:", error)
    return NextResponse.json(
      { error: "Erro ao excluir pedidos" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const cliente = String(body.cliente ?? body.customer_name ?? body.nome ?? "").trim()
    const telefone = String(body.telefone ?? body.customer_phone ?? body.phone ?? "").trim()
    const endereco = String(body.endereco ?? body.customer_address ?? body.address ?? "").trim()
    const tipo = (body.tipo === "entrega" || body.delivery_type === "entregar") ? "entregar" : "retirar"
    const pagamento = body.pagamento || body.payment_method || "dinheiro"
    const observacao = String(body.observacao ?? body.notes ?? "").trim()
    
    // Aceitar itens de diferentes formatos
    let itens = Array.isArray(body.itens) ? body.itens : []
    if (itens.length === 0 && Array.isArray(body.items)) {
      itens = body.items
    }
    if (itens.length === 0 && Array.isArray(body.products)) {
      itens = body.products
    }

    if (!cliente) {
      return NextResponse.json(
        { error: "Nome do cliente é obrigatório" },
        { status: 400 }
      )
    }
    if (itens.length === 0) {
      return NextResponse.json(
        { error: "Adicione ao menos um item" },
        { status: 400 }
      )
    }

    // Calcular total baseado nos itens normalizados
    const total = itens.reduce(
      (acc: number, it: any) => acc + Number(it.preco || it.price || it.unit_price || 0) * Number(it.quantidade || it.quantity || 1),
      0
    )

    // Buscar próximo número do pedido
    const [{ max_number }] = await query<{ max_number: number }>(
      `SELECT COALESCE(MAX(order_number), 0) + 1 as max_number FROM ${SCHEMA}.orders`
    )

    // Inserir pedido
    const [pedido] = await query<DbOrder>(
      `INSERT INTO ${SCHEMA}.orders 
        (order_number, customer_name, customer_phone, customer_address, delivery_type, payment_method, subtotal, delivery_fee, total, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 0, $7, 'pendente', $8)
       RETURNING *`,
      [max_number, cliente, telefone || null, endereco || null, tipo, pagamento, total, observacao || null]
    )

    // Inserir itens com todos os detalhes
    for (const item of itens) {
      // Normalizar campos do item (aceitar diferentes formatos)
      const itemNome = item.nome || item.name || item.product_name || "Item sem nome"
      const itemQuantidade = Number(item.quantidade || item.quantity || 1)
      const itemPreco = Number(item.preco || item.price || item.unit_price || 0)
      
      // Extrair detalhes do item
      const variacao = item.variacao || item.variation || item.variation_name || item.observacao || null
      const maionese = item.maionese || item.mayo || null
      const extraMaioneses = item.extraMaioneses || item.extra_maioneses ? JSON.stringify(item.extraMaioneses || item.extra_maioneses) : null
      const adicionais = item.adicionais || item.addons ? JSON.stringify(item.adicionais || item.addons) : null
      const acompanhamentos = item.acompanhamentos || item.accompaniments || item.opcoes || null
      
      await query(
        `INSERT INTO ${SCHEMA}.order_items 
          (order_id, product_name, quantity, variation_name, maionese, extra_maioneses, addons, acompanhamentos, item_total)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          pedido.id, 
          itemNome, 
          itemQuantidade, 
          variacao,
          maionese,
          extraMaioneses,
          adicionais,
          acompanhamentos,
          itemPreco * itemQuantidade
        ]
      )
    }

    return NextResponse.json({
      pedido: {
        id: pedido.id.toString(),
        numero: pedido.order_number,
        cliente: pedido.customer_name,
        total: Number(pedido.total),
        status: "novo",
        criadoEm: pedido.created_at,
      },
    }, { status: 201 })
  } catch (error: any) {
    console.error("[API] Erro ao criar pedido:", error?.message || error)
    return NextResponse.json(
      { error: "Erro ao criar pedido", details: error?.message },
      { status: 500 }
    )
  }
}
