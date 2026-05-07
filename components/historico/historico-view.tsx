"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Search } from "lucide-react"
import { usePedidos } from "@/hooks/use-pedidos"

const tipoLabel = {
  retirada: "Retirada",
  entrega: "Entrega",
  balcao: "Balcão",
} as const

function formatDataHora(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function dataLocal(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR")
}

export function HistoricoView() {
  const { pedidos, isLoading } = usePedidos("finalizados")
  const [busca, setBusca] = useState("")
  const [data, setData] = useState("")

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase()
    return pedidos.filter((p) => {
      const okNome = !q || p.cliente.toLowerCase().includes(q) || String(p.numero).includes(q)
      const okData = !data || (p.finalizadoEm && dataLocal(p.finalizadoEm) === new Date(data).toLocaleDateString("pt-BR"))
      return okNome && okData
    })
  }, [pedidos, busca, data])

  const totalDia = filtrados.reduce((acc, p) => acc + p.total, 0)

  return (
    <main className="relative min-h-dvh">
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: "url(/pirate-tavern-bg.jpg)" }}
        aria-hidden
      />
      <div className="fixed inset-0 -z-10 bg-background/90" aria-hidden />

      <header className="sticky top-0 z-30 border-b border-border/40 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link
            href="/cozinha"
            aria-label="Voltar"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h1 className="font-serif text-2xl font-bold tracking-wider text-glow-gold">
              Histórico
            </h1>
            <p className="text-xs text-muted-foreground">
              {filtrados.length} pedido{filtrados.length === 1 ? "" : "s"} ·
              Total R$ {totalDia.toFixed(2)}
            </p>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por cliente ou número..."
              className="w-full rounded-md border border-border/60 bg-card/40 px-10 py-3 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="rounded-md border border-border/60 bg-card/40 px-3 py-3 text-sm text-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        {isLoading ? (
          <p className="py-10 text-center text-muted-foreground">Carregando...</p>
        ) : filtrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/60 bg-card/30 py-16">
            <p className="font-serif text-lg text-foreground/70">
              Nenhum pedido finalizado encontrado
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border/60 bg-card/60 backdrop-blur-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-3 py-2.5 text-left">#</th>
                  <th className="px-3 py-2.5 text-left">Cliente</th>
                  <th className="px-3 py-2.5 text-left">Tipo</th>
                  <th className="px-3 py-2.5 text-left">Itens</th>
                  <th className="px-3 py-2.5 text-right">Total</th>
                  <th className="px-3 py-2.5 text-left">Finalizado</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-border/40 last:border-0 hover:bg-secondary/20"
                  >
                    <td className="px-3 py-2.5 font-serif font-bold text-primary">
                      #{p.numero}
                    </td>
                    <td className="px-3 py-2.5 font-medium">{p.cliente}</td>
                    <td className="px-3 py-2.5 text-xs uppercase tracking-wider text-muted-foreground">
                      {tipoLabel[p.tipo]}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">
                      {p.itens
                        .map((i) => `${i.quantidade}x ${i.nome}`)
                        .join(", ")}
                    </td>
                    <td className="px-3 py-2.5 text-right font-bold text-glow-gold">
                      R$ {p.total.toFixed(2)}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">
                      {p.finalizadoEm ? formatDataHora(p.finalizadoEm) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}
