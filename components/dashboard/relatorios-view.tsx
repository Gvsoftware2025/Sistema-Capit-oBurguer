"use client"

import { useState } from "react"
import useSWR from "swr"
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Flame,
  Calendar,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Pedido } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((res) => res.json()).then((data) => data.pedidos || [])

export function RelatoriosView() {
  const [dataInicio, setDataInicio] = useState("")
  const [dataFim, setDataFim] = useState("")

  const { data: pedidos = [] } = useSWR<Pedido[]>("/api/pedidos", fetcher)

  // Filtrar por data
  const pedidosFiltrados = pedidos.filter((p) => {
    const data = new Date(p.criadoEm)
    if (dataInicio && data < new Date(dataInicio)) return false
    if (dataFim && data > new Date(dataFim + "T23:59:59")) return false
    return true
  })

  // Status "entregue" ou "finalizado" conta como finalizado
  const pedidosFinalizados = pedidosFiltrados.filter((p) => 
    p.status === "finalizado" || p.status === "entregue" || p.status === "pronto"
  )

  // Métricas
  const faturamentoTotal = pedidosFinalizados.reduce(
    (acc, p) => acc + p.itens.reduce((a, i) => a + i.preco * i.quantidade, 0),
    0
  )

  const ticketMedio =
    pedidosFinalizados.length > 0
      ? faturamentoTotal / pedidosFinalizados.length
      : 0

  const clientesUnicos = new Set(pedidosFiltrados.map((p) => p.cliente)).size

  // Produtos mais vendidos
  const produtosVendidos = new Map<string, { nome: string; quantidade: number; total: number }>()
  pedidosFinalizados.forEach((pedido) => {
    pedido.itens.forEach((item) => {
      const existing = produtosVendidos.get(item.nome)
      if (existing) {
        existing.quantidade += item.quantidade
        existing.total += item.preco * item.quantidade
      } else {
        produtosVendidos.set(item.nome, {
          nome: item.nome,
          quantidade: item.quantidade,
          total: item.preco * item.quantidade,
        })
      }
    })
  })

  const topProdutos = Array.from(produtosVendidos.values())
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 10)

  // Pedidos por tipo
  const pedidosEntrega = pedidosFinalizados.filter((p) => p.tipo === "entrega").length
  const pedidosRetirada = pedidosFinalizados.filter((p) => p.tipo === "retirada").length

  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-border">
        <h1 className="text-2xl font-serif font-bold text-primary mb-4">
          Relatórios
        </h1>

        {/* Filtro de data */}
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Data início
            </Label>
            <Input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-auto"
            />
          </div>
          <div className="space-y-2">
            <Label>Data fim</Label>
            <Input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-auto"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 lg:p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 rounded-xl bg-green-500/10 border border-green-500/30">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="h-6 w-6 text-green-500" />
              <span className="text-sm text-muted-foreground">Faturamento</span>
            </div>
            <p className="text-3xl font-bold text-green-500">
              R$ {faturamentoTotal.toFixed(2)}
            </p>
          </div>

          <div className="p-6 rounded-xl bg-primary/10 border border-primary/30">
            <div className="flex items-center gap-3 mb-2">
              <ShoppingBag className="h-6 w-6 text-primary" />
              <span className="text-sm text-muted-foreground">Pedidos</span>
            </div>
            <p className="text-3xl font-bold">{pedidosFinalizados.length}</p>
          </div>

          <div className="p-6 rounded-xl bg-blue-500/10 border border-blue-500/30">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-6 w-6 text-blue-500" />
              <span className="text-sm text-muted-foreground">Ticket Médio</span>
            </div>
            <p className="text-3xl font-bold text-blue-500">
              R$ {ticketMedio.toFixed(2)}
            </p>
          </div>

          <div className="p-6 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-6 w-6 text-amber-500" />
              <span className="text-sm text-muted-foreground">Clientes</span>
            </div>
            <p className="text-3xl font-bold text-amber-500">{clientesUnicos}</p>
          </div>
        </div>

        {/* Grid de relatórios */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Produtos mais vendidos */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">Produtos Mais Vendidos</h2>
            </div>
            {topProdutos.length === 0 ? (
              <p className="text-muted-foreground">Nenhum dado disponível</p>
            ) : (
              <div className="space-y-3">
                {topProdutos.map((produto, index) => (
                  <div
                    key={produto.nome}
                    className="flex items-center justify-between p-3 rounded-lg bg-background"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {index + 1}
                      </span>
                      <span className="font-medium">{produto.nome}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{produto.quantidade}x</p>
                      <p className="text-xs text-muted-foreground">
                        R$ {produto.total.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pedidos por tipo */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-bold mb-4">Pedidos por Tipo</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span>Retirada</span>
                  <span className="font-bold">{pedidosRetirada}</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{
                      width: `${
                        pedidosFinalizados.length > 0
                          ? (pedidosRetirada / pedidosFinalizados.length) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Entrega</span>
                  <span className="font-bold">{pedidosEntrega}</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{
                      width: `${
                        pedidosFinalizados.length > 0
                          ? (pedidosEntrega / pedidosFinalizados.length) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Resumo */}
            <div className="mt-6 pt-6 border-t border-border">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">
                    {pedidosFinalizados.length > 0
                      ? ((pedidosRetirada / pedidosFinalizados.length) * 100).toFixed(0)
                      : 0}
                    %
                  </p>
                  <p className="text-sm text-muted-foreground">Retirada</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {pedidosFinalizados.length > 0
                      ? ((pedidosEntrega / pedidosFinalizados.length) * 100).toFixed(0)
                      : 0}
                    %
                  </p>
                  <p className="text-sm text-muted-foreground">Entrega</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
