"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChefHat, History, Volume2, VolumeX } from "lucide-react"
import { usePedidos } from "@/hooks/use-pedidos"
import { playOrderSound, unlockAudio } from "@/lib/audio"
import { PedidoCard } from "./pedido-card"
import { Embers } from "@/components/embers"
import { toast } from "sonner"

export function CozinhaDashboard() {
  const { pedidos, mutate } = usePedidos("ativos")
  const [audioOn, setAudioOn] = useState(false)
  const idsAnterioresRef = useRef<Set<string>>(new Set())
  const novosIdsRef = useRef<Set<string>>(new Set())
  const [, force] = useState(0)
  const inicializadoRef = useRef(false)

  // Detectar pedidos novos para tocar som + destacar
  useEffect(() => {
    const idsAtuais = new Set(pedidos.map((p) => p.id))

    if (!inicializadoRef.current) {
      // Primeira carga: não toca som por pedidos pré-existentes
      idsAnterioresRef.current = idsAtuais
      inicializadoRef.current = true
      return
    }

    const novos: string[] = []
    idsAtuais.forEach((id) => {
      if (!idsAnterioresRef.current.has(id)) novos.push(id)
    })

    if (novos.length > 0) {
      if (audioOn) playOrderSound()
      novos.forEach((id) => novosIdsRef.current.add(id))
      // Notificação visual
      toast(`${novos.length} novo${novos.length > 1 ? "s" : ""} pedido${novos.length > 1 ? "s" : ""}!`, {
        description: "Verifique o painel.",
      })
      force((x) => x + 1)
      // Remover destaque após 3s
      setTimeout(() => {
        novos.forEach((id) => novosIdsRef.current.delete(id))
        force((x) => x + 1)
      }, 3000)
    }

    idsAnterioresRef.current = idsAtuais
  }, [pedidos, audioOn])

  const ativarAudio = async () => {
    await unlockAudio()
    setAudioOn(true)
    // Bip teste
    playOrderSound()
    toast.success("Áudio ativado")
  }

  const finalizar = async (id: string) => {
    const res = await fetch(`/api/pedidos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "finalizar" }),
    })
    if (!res.ok) throw new Error("Falha ao finalizar")
    mutate()
  }

  return (
    <main className="relative min-h-dvh">
      {/* Fundo */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: "url(/pirate-tavern-bg.jpg)" }}
        aria-hidden
      />
      <div className="fixed inset-0 -z-10 bg-background/90" aria-hidden />
      <Embers count={20} />

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/40 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-full ring-1 ring-primary/40">
              <Image
                src="/logo-capitao-burguer.jpeg"
                alt="Capitão Burguer"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="font-serif text-xl font-bold tracking-wider text-glow-gold sm:text-2xl">
                Cozinha
              </h1>
              <p className="text-xs text-muted-foreground">
                {pedidos.length} pedido{pedidos.length === 1 ? "" : "s"} ativo
                {pedidos.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!audioOn ? (
              <button
                onClick={ativarAudio}
                className="flex items-center gap-2 rounded-md border border-accent/60 bg-accent/15 px-3 py-2 text-xs font-bold uppercase tracking-wider text-accent animate-pulse-glow"
              >
                <VolumeX className="h-4 w-4" />
                Ativar áudio
              </button>
            ) : (
              <button
                onClick={() => setAudioOn(false)}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-primary/60 bg-primary/15 text-primary"
                aria-label="Desativar áudio"
              >
                <Volume2 className="h-4 w-4" />
              </button>
            )}
            <Link
              href="/historico"
              className="flex h-9 items-center gap-2 rounded-md border border-border/60 bg-card/40 px-3 text-xs font-bold uppercase tracking-wider text-foreground/80 hover:border-primary/50 hover:text-primary"
            >
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Histórico</span>
            </Link>
            <Link
              href="/funcionario"
              className="flex h-9 items-center gap-2 rounded-md border border-border/60 bg-card/40 px-3 text-xs font-bold uppercase tracking-wider text-foreground/80 hover:border-primary/50 hover:text-primary"
            >
              <ChefHat className="h-4 w-4" />
              <span className="hidden sm:inline">Pedido interno</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Grid */}
      <section className="mx-auto max-w-[1800px] px-4 py-6 sm:px-6">
        {pedidos.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border/60 bg-card/30 py-24 text-center">
            <ChefHat className="h-14 w-14 text-muted-foreground/50" />
            <p className="font-serif text-2xl text-foreground/60">
              Nenhum pedido na fila
            </p>
            <p className="text-sm text-muted-foreground">
              Os novos pedidos aparecerão aqui em tempo real
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pedidos.map((pedido) => (
              <PedidoCard
                key={pedido.id}
                pedido={pedido}
                isNovo={novosIdsRef.current.has(pedido.id)}
                onFinalizar={finalizar}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
