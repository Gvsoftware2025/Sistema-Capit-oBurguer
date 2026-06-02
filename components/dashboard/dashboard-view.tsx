"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
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
  const router = useRouter()
  const [somAtivado, setSomAtivado] = useState(true)
  const [filtroAtivo, setFiltroAtivo] = useState<StatusFiltro>("todos")
  const [ordenacao, setOrdenacao] = useState("recentes")
  const [pedidoSelecionado, setPedidoSelecionado] = useState<Pedido | null>(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [impressaoAutomatica, setImpressaoAutomatica] = useState(true)
  const prevPedidosRef = useRef<string[] | null>(null)
  const impressoesRef = useRef<Set<string>>(new Set()) // Controle de pedidos já impressos
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
    const pedidosNovos = pedidos.filter((p) => p.status === "novo" || p.status === "pendente")
    const idsNovos = pedidosNovos.map((p) => p.id)
    
    // Na primeira vez, apenas inicializa
    if (prevPedidosRef.current === null) {
      prevPedidosRef.current = idsNovos
      return
    }
    
    // Encontra pedidos que acabaram de chegar
    const novosIds = idsNovos.filter((id) => !prevPedidosRef.current!.includes(id))
    
    if (novosIds.length > 0) {
      // Toca som se ativado
      if (somAtivado) {
        playOrderSound()
      }
      
      // Impressao automatica - evita duplicatas e nao imprime em dispositivos moveis
      const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      if (impressaoAutomatica && !isMobile) {
        novosIds.forEach((id) => {
          // Verifica se já imprimiu esse pedido
          if (impressoesRef.current.has(id)) return
          
          const pedido = pedidos.find((p) => p.id === id)
          if (pedido) {
            impressoesRef.current.add(id) // Marca como impresso
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

  const excluirTodosPedidos = async () => {
    if (!confirm("Tem certeza que deseja excluir TODOS os pedidos? Esta acao nao pode ser desfeita.")) return
    await fetch("/api/pedidos", {
      method: "DELETE",
    })
    mutate()
  }

  const adicionarItensAoPedido = (pedido: Pedido) => {
    // Redireciona para o novo-pedido com os dados do pedido existente
    // Salva o pedido no localStorage para recuperar na pagina de novo pedido
    localStorage.setItem("pedido_para_editar", JSON.stringify(pedido))
    setModalAberto(false)
    router.push("/dashboard/novo-pedido?editar=true")
  }

  const finalizarPedido = async (pedido: Pedido, pagamento: { forma: string; valorPago: number; restante: number }) => {
    try {
      const response = await fetch(`/api/pedidos/${pedido.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "finalizado",
          formaPagamento: pagamento.forma,
          valorPago: pagamento.valorPago,
          valorRestante: pagamento.restante,
        }),
      })

      if (!response.ok) {
        throw new Error("Erro ao finalizar pedido")
      }

      mutate()
      setModalAberto(false)
    } catch (error) {
      console.error("Erro ao finalizar pedido:", error)
      throw error
    }
  }

  const pedidosAtivos = pedidos.filter((p) => p.status !== "finalizado")
  const pedidosFiltrados =
    filtroAtivo === "todos"
      ? pedidosAtivos
      : filtroAtivo === "mesa"
        ? pedidosAtivos.filter((p) => p.tipo === "mesa")
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
    mesa: pedidosAtivos.filter((p) => p.tipo === "mesa").length,
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        somAtivado={somAtivado}
        onToggleSom={() => (somAtivado ? setSomAtivado(false) : ativarSom())}
        impressaoAutomatica={impressaoAutomatica}
        onToggleImpressao={() => setImpressaoAutomatica(!impressaoAutomatica)}
      />

      <FiltrosPedidos
        filtroAtivo={filtroAtivo}
        onFiltroChange={setFiltroAtivo}
        contagens={contagens}
        ordenacao={ordenacao}
        onOrdenacaoChange={setOrdenacao}
        onExcluirTodos={excluirTodosPedidos}
        temPedidos={pedidosAtivos.length > 0}
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
        onAdicionarItens={adicionarItensAoPedido}
        onFinalizarPedido={finalizarPedido}
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
