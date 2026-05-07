import { NextResponse } from "next/server"
import {
  criarPedido,
  listarPedidos,
  listarPedidosAtivos,
  listarPedidosFinalizados,
} from "@/lib/store"
import type { OrigemPedido, TipoPedido, ItemPedido } from "@/lib/types"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const filtro = searchParams.get("filtro")

  if (filtro === "ativos") {
    return NextResponse.json({ pedidos: listarPedidosAtivos() })
  }
  if (filtro === "finalizados") {
    return NextResponse.json({ pedidos: listarPedidosFinalizados() })
  }
  return NextResponse.json({ pedidos: listarPedidos() })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const cliente = String(body.cliente ?? "").trim()
    const tipo = (body.tipo ?? "balcao") as TipoPedido
    const origem = (body.origem ?? "cliente") as OrigemPedido
    const itens = Array.isArray(body.itens) ? (body.itens as ItemPedido[]) : []

    if (!cliente) {
      return NextResponse.json(
        { error: "Nome do cliente é obrigatório" },
        { status: 400 },
      )
    }
    if (itens.length === 0) {
      return NextResponse.json(
        { error: "Adicione ao menos um item" },
        { status: 400 },
      )
    }

    const total = itens.reduce(
      (acc, it) => acc + Number(it.preco) * Number(it.quantidade),
      0,
    )

    const pedido = criarPedido({
      cliente,
      telefone: body.telefone,
      endereco: body.endereco,
      tipo,
      origem,
      itens,
      observacao: body.observacao,
      total,
    })

    // TODO: Integração futura com impressora térmica ESC/POS
    // fetch("http://localhost:3001/print", { method: "POST", body: JSON.stringify(pedido) })

    return NextResponse.json({ pedido }, { status: 201 })
  } catch (e) {
    return NextResponse.json(
      { error: "Erro ao criar pedido" },
      { status: 500 },
    )
  }
}
