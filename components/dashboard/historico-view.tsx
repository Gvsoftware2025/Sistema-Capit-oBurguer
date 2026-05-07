"use client"

import { useState } from "react"
import useSWR from "swr"
import { Search, Calendar, Package, Truck, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
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

export function HistoricoView() {
  const [busca, setBusca] = useState("")
  const [dataFiltro, setDataFiltro] = useState("")

  const { data: pedidos = [] } = useSWR<Pedido[]>("/api/pedidos", fetcher, {
    refreshInterval: 5000,
  })

  const pedidosFinalizados = pedidos.filter((p) => p.status === "finalizado")

  const pedidosFiltrados = pedidosFinalizados.filter((p) => {
    const matchBusca =
      busca === "" ||
      p.cliente.toLowerCase().includes(busca.toLowerCase()) ||
      p.numero.toString().includes(busca)
    const matchData =
      dataFiltro === "" ||
      new Date(p.criadoEm).toISOString().split("T")[0] === dataFiltro
    return matchBusca && matchData
  })

  const totalVendas = pedidosFiltrados.reduce(
    (acc, p) => acc + p.itens.reduce((a, i) => a + i.preco * i.quantidade, 0),
    0
  )

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-border">
        <h1 className="text-2xl font-serif font-bold text-primary mb-4">
          Histórico de Pedidos
        </h1>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou número..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={dataFiltro}
              onChange={(e) => setDataFiltro(e.target.value)}
              className="pl-10 w-full sm:w-auto"
            />
          </div>
          {dataFiltro && (
            <Button variant="outline" onClick={() => setDataFiltro("")}>
              Limpar filtro
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 lg:px-6 flex flex-wrap gap-4">
        <div className="px-4 py-2 rounded-lg bg-card border border-border">
          <p className="text-xs text-muted-foreground">Total de pedidos</p>
          <p className="text-xl font-bold">{pedidosFiltrados.length}</p>
        </div>
        <div className="px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/30">
          <p className="text-xs text-muted-foreground">Total em vendas</p>
          <p className="text-xl font-bold text-green-500">
            R$ {totalVendas.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-4 lg:p-6">
        {pedidosFiltrados.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Nenhum pedido encontrado</p>
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-card">
                  <TableHead className="w-20">#</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead>Observação</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Data/Hora</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pedidosFiltrados.map((pedido) => (
                  <TableRow key={pedido.id}>
                    <TableCell className="font-mono font-bold">
                      #{pedido.numero}
                    </TableCell>
                    <TableCell className="font-medium">{pedido.cliente}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        {pedido.tipo === "entrega" ? (
                          <Truck className="h-4 w-4" />
                        ) : (
                          <Package className="h-4 w-4" />
                        )}
                        <span className="capitalize">{pedido.tipo}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {pedido.itens.map((item, i) => (
                          <span key={i}>
                            {item.quantidade}x {item.nome}
                            {i < pedido.itens.length - 1 && ", "}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate">
                      {pedido.observacao || "-"}
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary">
                      R${" "}
                      {pedido.itens
                        .reduce((a, i) => a + i.preco * i.quantidade, 0)
                        .toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      <div className="flex items-center justify-end gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(pedido.criadoEm).toLocaleString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
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
