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
    const pedidosMapeados = pedidos.map((p) => {
      // Determinar tipo do pedido
      let tipo = "retirada"
      if (p.delivery_type === "entregar" || p.delivery_type === "entrega") {
        tipo = "entrega"
      } else if (p.delivery_type === "mesa" || p.table_number) {
        tipo = "mesa"
      }

      return {
        id: p.id.toString(),
        numero: p.order_number,
        cliente: p.customer_name,
        endereco: p.customer_address,
        tipo,
        mesa: p.table_number ? Number(p.table_number) : undefined,
        pagamento: p.payment_method,
        troco: p.cash_amount ? Number(p.cash_amount) : undefined,
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
    }})

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
    const pagamento = body.pagamento || body.payment_method || "dinheiro"
    const troco = body.valorPago !== undefined ? Number(body.valorPago) : (body.troco !== undefined ? Number(body.troco) : (body.change_for !== undefined ? Number(body.change_for) : null))
    const observacao = String(body.observacao ?? body.notes ?? "").trim()
    const taxaEntregaValor = body.taxaEntrega !== undefined ? Number(body.taxaEntrega) : 0
    const descontoValor = body.desconto !== undefined ? Number(body.desconto) : 0
    
    // Verificar se é para adicionar a um pedido existente (pelo ID)
    const pedidoOriginalId = body.pedidoOriginalId || null
    
    // Detectar se é pedido de mesa (ex: "Mesa 4", "mesa 10", "Mesa4")
    const mesaMatch = cliente.match(/^mesa\s*(\d+)$/i)
    const tableNumber = mesaMatch ? parseInt(mesaMatch[1]) : (body.table_number ? parseInt(body.table_number) : null)
    
    // Determinar tipo do pedido
    let tipo = "retirar"
    if (body.tipo === "entrega" || body.delivery_type === "entregar") {
      tipo = "entregar"
    } else if (tableNumber || body.tipo === "mesa" || body.delivery_type === "mesa") {
      tipo = "mesa"
    }
    
    console.log("[v0] Pedido recebido - mesa:", tableNumber, "tipo:", tipo, "pedidoOriginalId:", pedidoOriginalId)
    
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
    const subtotal = itens.reduce(
      (acc: number, it: any) => acc + Number(it.preco || it.precoUnitario || it.price || it.unit_price || it.product_price || 0) * Number(it.quantidade || it.quantity || 1),
      0
    )
    const totalFinal = subtotal + taxaEntregaValor - descontoValor

    // Verificar se deve adicionar a um pedido existente
    let pedido: DbOrder
    let pedidoExistente = false
    
    // Prioridade 1: Se tem pedidoOriginalId (botao "Adicionar Itens" do sistema de gestao)
    // IMPORTANTE: pedidoOriginalId pode vir como string, numero ou null
    const pedidoIdNum = pedidoOriginalId ? parseInt(String(pedidoOriginalId)) : null
    
    if (pedidoIdNum && !isNaN(pedidoIdNum)) {
      const [pedidoOriginal] = await query<DbOrder>(
        `SELECT * FROM ${SCHEMA}.orders WHERE id = $1`,
        [pedidoIdNum]
      )
      if (pedidoOriginal) {
        pedido = pedidoOriginal
        pedidoExistente = true
        console.log("[v0] Adicionando itens ao pedido existente por ID:", pedidoIdNum)
        
        // Atualizar total do pedido (apenas soma o subtotal dos novos itens)
        const novoTotal = Number(pedido.total) + subtotal
        const novoSubtotal = Number(pedido.subtotal || 0) + subtotal
        await query(
          `UPDATE ${SCHEMA}.orders SET total = $1, subtotal = $2 WHERE id = $3`,
          [novoTotal, novoSubtotal, pedido.id]
        )
      }
    }
    
    // Prioridade 2: Se for pedido de mesa do CARDAPIO ONLINE (nao do sistema de gestao)
    // Cardapio online envia delivery_type = "mesa", sistema de gestao envia tipo = "retirada" ou "entrega"
    if (!pedidoExistente && tableNumber && !pedidoIdNum) {
      // Verificar se e do cardapio online (tem delivery_type = "mesa" no body)
      const isCardapioOnline = body.delivery_type === "mesa"
      
      if (isCardapioOnline) {
        const pedidosAbertos = await query<DbOrder>(
          `SELECT * FROM ${SCHEMA}.orders 
           WHERE table_number = $1 AND status NOT IN ('finalizado', 'cancelado', 'entregue') 
           ORDER BY created_at DESC LIMIT 1`,
          [tableNumber]
        )
        
        if (pedidosAbertos.length > 0) {
          pedido = pedidosAbertos[0]
          pedidoExistente = true
          console.log("[v0] Cardapio online - Adicionando itens ao pedido existente da Mesa", tableNumber)
          
          const novoTotal = Number(pedido.total) + subtotal
          const novoSubtotal = Number(pedido.subtotal || 0) + subtotal
          await query(
            `UPDATE ${SCHEMA}.orders SET total = $1, subtotal = $2 WHERE id = $3`,
            [novoTotal, novoSubtotal, pedido.id]
          )
        }
      }
    }
    
    // Se não encontrou pedido existente, criar novo
    if (!pedidoExistente) {
      // Gerar número do pedido no formato CB-YYYYMMDD-XXXX
      const hoje = new Date()
      const dataStr = hoje.toISOString().slice(0, 10).replace(/-/g, '')
      
      // Buscar último número do dia
      const [{ count }] = await query<{ count: string }>(
        `SELECT COUNT(*)::text as count FROM ${SCHEMA}.orders WHERE order_number LIKE $1`,
        [`CB-${dataStr}-%`]
      )
      const proximoNum = (parseInt(count) + 1).toString().padStart(4, '0')
      const orderNumber = `CB-${dataStr}-${proximoNum}`

      // Inserir pedido
      const [novoPedido] = await query<DbOrder>(
        `INSERT INTO ${SCHEMA}.orders 
          (order_number, customer_name, customer_phone, customer_address, delivery_type, payment_method, cash_amount, subtotal, delivery_fee, total, status, notes, table_number)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pendente', $11, $12)
         RETURNING *`,
        [orderNumber, tableNumber ? `Mesa ${tableNumber}` : cliente, telefone || null, endereco || null, tipo, pagamento, troco, subtotal, taxaEntregaValor, totalFinal, observacao || null, tableNumber]
      )
      pedido = novoPedido
    }

    // Inserir itens com todos os detalhes
    for (const item of itens) {
      // Normalizar campos do item (aceitar diferentes formatos)
      const itemNome = item.nome || item.name || item.product_name || "Item sem nome"
      const itemQuantidade = Number(item.quantidade || item.quantity || 1)
      const itemPreco = Number(item.preco || item.precoUnitario || item.price || item.unit_price || item.product_price || 0)
      
      // Extrair variacao do nome se estiver no formato "Produto (Variacao)"
      let nomeBase = itemNome
      let variacaoExtraida = null
      const matchVariacao = itemNome.match(/^(.+?)\s*\(([^)]+)\)$/)
      if (matchVariacao) {
        nomeBase = matchVariacao[1].trim()
        variacaoExtraida = matchVariacao[2].trim()
      }
      
      // Extrair detalhes do item
      const variacao = item.variacao || item.variation || item.variation_name || variacaoExtraida || null
      const maionese = item.maionese || item.mayo || null
      // extra_maioneses é TEXT[] no banco, não JSON
      const extraMaionesisArr = item.extraMaioneses || item.extra_maioneses || []
      const extraMaioneses = Array.isArray(extraMaionesisArr) && extraMaionesisArr.length > 0 
        ? `{${extraMaionesisArr.map((m: string) => `"${m}"`).join(',')}}` 
        : null
      const adicionais = item.adicionais || item.addons ? JSON.stringify(item.adicionais || item.addons) : null
      const acompanhamentos = item.acompanhamentos || item.accompaniments || item.opcoes || null
      
      await query(
        `INSERT INTO ${SCHEMA}.order_items 
          (order_id, product_name, product_price, quantity, variation_name, maionese, extra_maioneses, addons, acompanhamentos, item_total)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          pedido.id, 
          nomeBase, 
          itemPreco,
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

    // Salvar no historico de vendas (para relatorios persistentes)
    try {
      const itensJson = JSON.stringify(itens.map((item: any) => ({
        nome: item.nome || item.name || item.produto || item.product_name || "Item",
        quantidade: Number(item.quantidade || item.quantity || 1),
        preco: Number(item.preco || item.precoUnitario || item.price || 0),
        variacao: item.variacao || null
      })))

      await query(
        `INSERT INTO ${SCHEMA}.sales_history 
         (order_id, order_number, customer_name, delivery_type, payment_method, subtotal, delivery_fee, total, items_json)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          pedido.id,
          pedido.order_number,
          pedido.customer_name,
          tipo || "retirar",
          pagamento || "dinheiro",
          subtotal,
          taxaEntrega,
          totalFinal,
          itensJson
        ]
      )
    } catch (historyError) {
      // Nao falha o pedido se o historico falhar
      console.error("[API] Erro ao salvar historico:", historyError)
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
