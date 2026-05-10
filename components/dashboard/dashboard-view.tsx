"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import useSWR from "swr"
import { Header } from "./header"
import { FiltrosPedidos } from "./filtros-pedidos"
import { PedidosGrid } from "./pedidos-grid"
import { StatsBar } from "./stats-bar"
import { PedidoDetalhesModal } from "./pedido-detalhes-modal"
import { playOrderSound } from "@/lib/audio"
import { imprimirPedido } from "./pedido-print"
import type { Pedido } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((res) => res.json()).then((data) => data.pedidos || [])

type StatusFiltro = "todos" | "novo" | "preparando" | "pronto"

export function DashboardView() {
  const [somAtivado, setSomAtivado] = useState(true)
  const [filtroAtivo, setFiltroAtivo] = useState<StatusFiltro>("todos")
  const [ordenacao, setOrdenacao] = useState("recentes")
  const [pedidoSelecionado, setPedidoSelecionado] = useState<Pedido | null>(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [impressaoAutomatica, setImpressaoAutomatica] = useState(true)
  const prevPedidosRef = useRef<string[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)

  const { data: pedidos = [], mutate } = useSWR<Pedido[]>("/api/pedidos", fetcher, {
    refreshInterval: 1000,
  })

  const ativarSom = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    setSomAtivado(true)
  }, [])

  useEffect(() => {
    const pedidosNovos = pedidos.filter((p) => p.status === "novo")
    const idsNovos = pedidosNovos.map((p) => p.id)
    
    // Encontra pedidos que acabaram de chegar
    const novosIds = idsNovos.filter((id) => !prevPedidosRef.current.includes(id))
    const novosPedidosChegaram = novosIds.length > 0 && prevPedidosRef.current.length > 0

    if (novosPedidosChegaram) {
      // Toca som se ativado
      if (somAtivado) {
        playOrderSound()
      }
      
      // Impressao automatica
      if (impressaoAutomatica) {
        novosIds.forEach((id) => {
          const pedido = pedidos.find((p) => p.id === id)
          if (pedido) {
            setTimeout(() => imprimirPedido(pedido), 500)
          }
        })
      }
    }

    prevPedidosRef.current = idsNovos
  }, [pedidos, somAtivado, impressaoAutomatica])

  const abrirDetalhes = (pedido: Pedido) => {
    setPedidoSelecionado(pedido)
    setModalAberto(true)
  }

  const fecharModal = () => {
    setModalAberto(false)
    setPedidoSelecionado(null)
  }

  const avancarPedido = async (id: string) => {
    await fetch(`/api/pedidos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "preparando" }),
    })
    mutate()
  }

  const finalizarPedido = async (id: string) => {
    await fetch(`/api/pedidos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "finalizado" }),
    })
    mutate()
  }

  const excluirPedido = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este pedido?")) return
    await fetch(`/api/pedidos/${id}`, {
      method: "DELETE",
    })
    mutate()
  }

  const pedidosAtivos = pedidos.filter((p) => p.status !== "finalizado")
  const pedidosFiltrados =
    filtroAtivo === "todos"
      ? pedidosAtivos
      : pedidosAtivos.filter((p) => p.status === filtroAtivo)

  const pedidosOrdenados = [...pedidosFiltrados].sort((a, b) => {
    if (ordenacao === "recentes") return new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
    if (ordenacao === "antigos") return new Date(a.criadoEm).getTime() - new Date(b.criadoEm).getTime()
    return b.numero - a.numero
  })

  const contagens = {
    todos: pedidosAtivos.length,
    novo: pedidosAtivos.filter((p) => p.status === "novo").length,
    preparando: pedidosAtivos.filter((p) => p.status === "preparando").length,
    pronto: pedidosAtivos.filter((p) => p.status === "pronto").length,
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        somAtivado={somAtivado}
        onToggleSom={() => (somAtivado ? setSomAtivado(false) : ativarSom())}
      />

      <FiltrosPedidos
        filtroAtivo={filtroAtivo}
        onFiltroChange={setFiltroAtivo}
        contagens={contagens}
        ordenacao={ordenacao}
        onOrdenacaoChange={setOrdenacao}
      />

      <div className="flex-1 overflow-hidden">
        <PedidosGrid
          pedidos={pedidosOrdenados}
          onFinalizar={finalizarPedido}
          onAvancar={avancarPedido}
          onClickDetalhes={abrirDetalhes}
          onExcluir={excluirPedido}
        />
      </div>

      {/* Modal detalhes */}
      <PedidoDetalhesModal
        pedido={pedidoSelecionado}
        aberto={modalAberto}
        onFechar={fecharModal}
        onImprimir={imprimirPedido}
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
