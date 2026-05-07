"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ChefHat, Minus, Plus, Search, Send, Trash2 } from "lucide-react"
import { CATEGORIAS, PRODUTOS } from "@/lib/produtos"
import type { CategoriaId, ItemPedido, TipoPedido } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { CategoriaPills } from "@/components/cardapio/categoria-pills"
import { toast } from "sonner"

type Linha = ItemPedido & { imagem: string }

export function PedidoInterno() {
  const [categoria, setCategoria] = useState<CategoriaId>("burgueres")
  const [busca, setBusca] = useState("")
  const [itens, setItens] = useState<Linha[]>([])
  const [cliente, setCliente] = useState("")
  const [tipo, setTipo] = useState<TipoPedido>("balcao")
  const [observacao, setObservacao] = useState("")
  const [enviando, setEnviando] = useState(false)

  const produtosFiltrados = useMemo(() => {
    const q = busca.trim().toLowerCase()
    return PRODUTOS.filter((p) => {
      if (q) {
        return (
          p.nome.toLowerCase().includes(q) ||
          p.nomeExibicao.toLowerCase().includes(q)
        )
      }
      return p.categoria === categoria
    })
  }, [categoria, busca])

  const total = itens.reduce((acc, i) => acc + i.preco * i.quantidade, 0)

  const adicionar = (produtoId: string) => {
    const p = PRODUTOS.find((x) => x.id === produtoId)
    if (!p) return
    setItens((prev) => {
      const ex = prev.find((i) => i.produtoId === produtoId)
      if (ex) {
        return prev.map((i) =>
          i.produtoId === produtoId
            ? { ...i, quantidade: i.quantidade + 1 }
            : i,
        )
      }
      return [
        ...prev,
        {
          produtoId: p.id,
          nome: p.nome,
          preco: p.preco,
          quantidade: 1,
          imagem: p.imagem,
        },
      ]
    })
  }

  const alterar = (id: string, q: number) => {
    setItens((prev) =>
      q <= 0
        ? prev.filter((i) => i.produtoId !== id)
        : prev.map((i) => (i.produtoId === id ? { ...i, quantidade: q } : i)),
    )
  }

  const enviar = async () => {
    if (!cliente.trim()) {
      toast.error("Informe o nome do cliente")
      return
    }
    if (itens.length === 0) {
      toast.error("Adicione ao menos um item")
      return
    }
    setEnviando(true)
    try {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente: cliente.trim(),
          tipo,
          origem: "funcionario",
          observacao: observacao.trim() || undefined,
          itens: itens.map((i) => ({
            produtoId: i.produtoId,
            nome: i.nome,
            preco: i.preco,
            quantidade: i.quantidade,
          })),
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error ?? "Erro")
      }
      const { pedido } = await res.json()
      toast.success(`Pedido #${pedido.numero} enviado para a cozinha`)
      setItens([])
      setCliente("")
      setObservacao("")
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao enviar"
      toast.error(msg)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main className="relative min-h-dvh pb-32">
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: "url(/pirate-tavern-bg.jpg)" }}
        aria-hidden
      />
      <div className="fixed inset-0 -z-10 bg-background/90" aria-hidden />

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/40 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <Link
            href="/"
            aria-label="Voltar"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h1 className="font-serif text-xl font-bold tracking-wider text-glow-gold">
              Pedido Interno
            </h1>
            <p className="text-xs text-muted-foreground">
              <ChefHat className="mr-1 inline h-3 w-3" />
              Funcionário
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-4">
        {/* Cliente + tipo */}
        <section className="flex flex-col gap-3 rounded-lg border border-border/60 bg-card/60 p-3 backdrop-blur-sm">
          <div>
            <Label htmlFor="f-cliente" className="text-xs uppercase tracking-wider text-muted-foreground">
              Cliente
            </Label>
            <Input
              id="f-cliente"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              placeholder="Nome do cliente"
              className="mt-1 bg-input/40"
            />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Tipo
            </Label>
            <div className="mt-1 grid grid-cols-3 gap-2">
              {(["balcao", "retirada", "entrega"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTipo(t)}
                  className={`rounded-md border px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                    tipo === t
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border/60 text-foreground/70"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Busca + categorias */}
        <section className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar produto..."
              className="w-full rounded-md border border-border/60 bg-card/40 px-10 py-3 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <CategoriaPills ativa={categoria} onSelect={setCategoria} />
        </section>

        {/* Lista de produtos */}
        <section className="flex flex-col gap-2">
          {produtosFiltrados.map((p) => {
            const ja = itens.find((i) => i.produtoId === p.id)
            return (
              <button
                key={p.id}
                onClick={() => adicionar(p.id)}
                className="flex items-center justify-between gap-3 rounded-md border border-border/60 bg-card/60 p-3 text-left transition-colors hover:border-primary/50"
              >
                <div className="flex flex-col">
                  <span className="font-bold uppercase tracking-wider text-primary">
                    {p.nome}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {p.descricao}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">
                    R$ {p.preco.toFixed(2)}
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    {ja ? `${ja.quantidade}x` : <Plus className="h-4 w-4" />}
                  </span>
                </div>
              </button>
            )
          })}
        </section>

        {/* Observação */}
        <section className="rounded-lg border border-border/60 bg-card/60 p-3 backdrop-blur-sm">
          <Label htmlFor="f-obs" className="text-xs uppercase tracking-wider text-muted-foreground">
            Observação
          </Label>
          <Textarea
            id="f-obs"
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            placeholder="Sem cebola, ponto da carne..."
            rows={2}
            className="mt-1 bg-input/40"
          />
        </section>
      </div>

      {/* Barra inferior */}
      {itens.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/95 backdrop-blur-md">
          <div className="mx-auto max-w-2xl px-4 py-3">
            <ul className="mb-2 flex flex-col gap-1.5 max-h-32 overflow-y-auto">
              {itens.map((item) => (
                <li
                  key={item.produtoId}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <span className="flex-1 truncate">{item.nome}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        alterar(item.produtoId, item.quantidade - 1)
                      }
                      className="flex h-6 w-6 items-center justify-center rounded border border-border/60"
                      aria-label="Diminuir"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="min-w-6 text-center font-semibold">
                      {item.quantidade}
                    </span>
                    <button
                      onClick={() =>
                        alterar(item.produtoId, item.quantidade + 1)
                      }
                      className="flex h-6 w-6 items-center justify-center rounded border border-border/60"
                      aria-label="Aumentar"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => alterar(item.produtoId, 0)}
                      className="ml-1 flex h-6 w-6 items-center justify-center rounded text-destructive"
                      aria-label="Remover"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  <span className="w-16 text-right text-xs font-bold text-primary">
                    R$ {(item.preco * item.quantidade).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Total
                </p>
                <p className="font-serif text-xl font-bold text-glow-gold">
                  R$ {total.toFixed(2)}
                </p>
              </div>
              <Button
                onClick={enviar}
                disabled={enviando}
                size="lg"
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Send className="h-4 w-4" />
                {enviando ? "Enviando..." : "Enviar Pedido"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
