"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import useSWR from "swr"
import { Header } from "./header"
import { FiltrosPedidos } from "./filtros-pedidos"
import { PedidosGrid } from "./pedidos-grid"
import { StatsBar } from "./stats-bar"
import { playOrderSound } from "@/lib/audio"
import type { Pedido } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((res) => res.json()).then((data) => data.pedidos || [])

type StatusFiltro = "todos" | "novo" | "preparando" | "pronto"

export function DashboardView() {
  const [somAtivado, setSomAtivado] = useState(false)
  const [filtroAtivo, setFiltroAtivo] = useState<StatusFiltro>("todos")
  const [ordenacao, setOrdenacao] = useState("recentes")
  const prevPedidosRef = useRef<string[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)

  const { data: pedidos = [], mutate } = useSWR<Pedido[]>("/api/pedidos", fetcher, {
    refreshInterval: 2000,
  })

  // Ativar audio context
  const ativarSom = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    setSomAtivado(true)
  }, [])

  // Tocar som quando novo pedido chegar
  useEffect(() => {
    if (!somAtivado) return

    const pedidosNovos = pedidos.filter((p) => p.status === "novo")
    const idsNovos = pedidosNovos.map((p) => p.id)
    const novosPedidosChegaram = idsNovos.some((id) => !prevPedidosRef.current.includes(id))

    if (novosPedidosChegaram && prevPedidosRef.current.length > 0) {
      playOrderSound()
    }

    prevPedidosRef.current = idsNovos
  }, [pedidos, somAtivado])

  // Avançar pedido para preparando
  const avancarPedido = async (id: string) => {
    await fetch(`/api/pedidos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "preparando" }),
    })
    mutate()
  }

  // Finalizar pedido
  const finalizarPedido = async (id: string) => {
    await fetch(`/api/pedidos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "finalizado" }),
    })
    mutate()
  }

  // Filtrar pedidos
  const pedidosAtivos = pedidos.filter((p) => p.status !== "finalizado")
  const pedidosFiltrados =
    filtroAtivo === "todos"
      ? pedidosAtivos
      : pedidosAtivos.filter((p) => p.status === filtroAtivo)

  // Ordenar
  const pedidosOrdenados = [...pedidosFiltrados].sort((a, b) => {
    if (ordenacao === "recentes") return new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
    if (ordenacao === "antigos") return new Date(a.criadoEm).getTime() - new Date(b.criadoEm).getTime()
    return b.numero - a.numero
  })

  // Contagens
  const contagens = {
    todos: pedidosAtivos.length,
    novo: pedidosAtivos.filter((p) => p.status === "novo").length,
    preparando: pedidosAtivos.filter((p) => p.status === "preparando").length,
    pronto: pedidosAtivos.filter((p) => p.status === "pronto").length,
  }

  return (
    <div className="flex flex-col h-full">
      <Header
        titulo="Pedidos em Tempo Real"
        subtitulo="Atualizando..."
        somAtivado={somAtivado}
        onToggleSom={() => (somAtivado ? setSomAtivado(false) : ativarSom())}
        ultimaAtualizacao={new Date()}
        onRefresh={() => mutate()}
      />

      <FiltrosPedidos
        filtroAtivo={filtroAtivo}
        onFiltroChange={setFiltroAtivo}
        contagens={contagens}
        ordenacao={ordenacao}
        onOrdenacaoChange={setOrdenacao}
      />

      <PedidosGrid
        pedidos={pedidosOrdenados}
        onFinalizar={finalizarPedido}
        onAvancar={avancarPedido}
      />

      <StatsBar
        total={contagens.todos}
        novos={contagens.novo}
        preparando={contagens.preparando}
        prontos={contagens.pronto}
      />
    </div>
  )
}
