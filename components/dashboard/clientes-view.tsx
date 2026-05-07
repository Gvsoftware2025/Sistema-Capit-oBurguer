"use client"

import { useState } from "react"
import useSWR from "swr"
import { Search, User, ShoppingBag, TrendingUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Pedido } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((res) => res.json()).then((data) => data.pedidos || [])

interface ClienteStats {
  nome: string
  totalPedidos: number
  totalGasto: number
  ultimoPedido: Date
}

export function ClientesView() {
  const [busca, setBusca] = useState("")

  const { data: pedidos = [] } = useSWR<Pedido[]>("/api/pedidos", fetcher, {
    refreshInterval: 10000,
  })

  // Agregar clientes
  const clientesMap = new Map<string, ClienteStats>()
  pedidos.forEach((pedido) => {
    const nome = pedido.cliente
    const total = pedido.itens.reduce((a, i) => a + i.preco * i.quantidade, 0)
    const existing = clientesMap.get(nome)

    if (existing) {
      existing.totalPedidos++
      existing.totalGasto += total
      if (new Date(pedido.criadoEm) > existing.ultimoPedido) {
        existing.ultimoPedido = new Date(pedido.criadoEm)
      }
    } else {
      clientesMap.set(nome, {
        nome,
        totalPedidos: 1,
        totalGasto: total,
        ultimoPedido: new Date(pedido.criadoEm),
      })
    }
  })

  const clientes = Array.from(clientesMap.values()).sort(
    (a, b) => b.totalGasto - a.totalGasto
  )

  const clientesFiltrados = clientes.filter(
    (c) => !busca || c.nome.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-border">
        <h1 className="text-2xl font-serif font-bold text-primary mb-4">
          Clientes
        </h1>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cliente..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 lg:px-6 flex flex-wrap gap-4">
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-card border border-border">
          <User className="h-5 w-5 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Total de clientes</p>
            <p className="text-xl font-bold">{clientes.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-card border border-border">
          <ShoppingBag className="h-5 w-5 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Total de pedidos</p>
            <p className="text-xl font-bold">{pedidos.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/30">
          <TrendingUp className="h-5 w-5 text-green-500" />
          <div>
            <p className="text-xs text-muted-foreground">Faturamento total</p>
            <p className="text-xl font-bold text-green-500">
              R$ {clientes.reduce((a, c) => a + c.totalGasto, 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-4 lg:p-6">
        {clientesFiltrados.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Nenhum cliente encontrado</p>
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-card">
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-center">Total Pedidos</TableHead>
                  <TableHead className="text-right">Total Gasto</TableHead>
                  <TableHead className="text-right">Último Pedido</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientesFiltrados.map((cliente) => (
                  <TableRow key={cliente.nome}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <span className="font-medium">{cliente.nome}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-mono">
                      {cliente.totalPedidos}
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary">
                      R$ {cliente.totalGasto.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {cliente.ultimoPedido.toLocaleDateString("pt-BR")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
