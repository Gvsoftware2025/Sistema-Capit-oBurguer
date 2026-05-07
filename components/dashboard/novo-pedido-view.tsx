"use client"

import { useState } from "react"
import { Search, Plus, Minus, User, Check, ArrowLeft, ArrowRight, Package, ShoppingBag } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { PRODUTOS, CATEGORIAS } from "@/lib/produtos"
import type { ItemPedido } from "@/lib/types"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

type Etapa = "cliente" | "cardapio" | "resumo"

export function NovoPedidoView() {
  const router = useRouter()
  const [etapa, setEtapa] = useState<Etapa>("cliente")
  const [nomeCliente, setNomeCliente] = useState("")
  const [observacao, setObservacao] = useState("")
  const [itens, setItens] = useState<ItemPedido[]>([])
  const [busca, setBusca] = useState("")
  const [categoriaAtiva, setCategoriaAtiva] = useState("Burgueres")
  const [enviando, setEnviando] = useState(false)

  const categoriaAtivaId = CATEGORIAS.find((c) => c.label === categoriaAtiva)?.id || "burgueres"

  const produtosFiltrados = PRODUTOS.filter((p) => {
    const matchCategoria = p.categoria === categoriaAtivaId
    const matchBusca = busca === "" || p.nome.toLowerCase().includes(busca.toLowerCase())
    return matchCategoria && matchBusca
  })

  const adicionarItem = (produtoId: string) => {
    const produto = PRODUTOS.find((p) => p.id === produtoId)
    if (!produto) return
    setItens((prev) => {
      const existente = prev.find((i) => i.produtoId === produtoId)
      if (existente) {
        return prev.map((i) =>
          i.produtoId === produtoId ? { ...i, quantidade: i.quantidade + 1 } : i
        )
      }
      return [...prev, { produtoId, nome: produto.nome, quantidade: 1, preco: produto.preco }]
    })
  }

  const removerItem = (produtoId: string) => {
    setItens((prev) => {
      const existente = prev.find((i) => i.produtoId === produtoId)
      if (!existente) return prev
      if (existente.quantidade === 1) return prev.filter((i) => i.produtoId !== produtoId)
      return prev.map((i) =>
        i.produtoId === produtoId ? { ...i, quantidade: i.quantidade - 1 } : i
      )
    })
  }

  const getQuantidade = (produtoId: string) =>
    itens.find((i) => i.produtoId === produtoId)?.quantidade || 0

  const total = itens.reduce((acc, item) => acc + item.preco * item.quantidade, 0)
  const totalItens = itens.reduce((acc, item) => acc + item.quantidade, 0)

  const irParaCardapio = () => {
    if (!nomeCliente.trim()) {
      toast.error("Informe o nome do cliente")
      return
    }
    setEtapa("cardapio")
  }

  const finalizarPedido = () => {
    if (itens.length === 0) {
      toast.error("Adicione pelo menos um item")
      return
    }
    setEtapa("resumo")
  }

  const enviarPedido = async () => {
    setEnviando(true)
    try {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente: nomeCliente,
          tipo: "balcao",
          observacao,
          itens,
        }),
      })
      if (res.ok) {
        toast.success("Pedido enviado com sucesso!")
        router.push("/dashboard")
      } else {
        toast.error("Erro ao enviar pedido")
      }
    } catch {
      toast.error("Erro ao enviar pedido")
    } finally {
      setEnviando(false)
    }
  }

  // ETAPA 1: Nome do Cliente
  if (etapa === "cliente") {
    return (
      <div className="flex flex-col items-center justify-center min-h-full p-6">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto mb-4">
              <User className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-primary">Novo Pedido</h1>
            <p className="text-muted-foreground">Digite o nome do cliente para começar</p>
          </div>

          <div className="space-y-4">
            <Input
              placeholder="Nome do cliente..."
              value={nomeCliente}
              onChange={(e) => setNomeCliente(e.target.value)}
              className="h-14 text-lg text-center bg-card border-2 border-border focus:border-primary"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && irParaCardapio()}
            />

            <Button
              onClick={irParaCardapio}
              disabled={!nomeCliente.trim()}
              className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30"
            >
              Continuar
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>

            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard")}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ETAPA 3: Resumo
  if (etapa === "resumo") {
    return (
      <div className="flex flex-col items-center justify-center min-h-full p-4">
        <div className="w-full max-w-lg bg-card border-2 border-primary/30 rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-primary/10 border-b border-primary/20 px-6 py-5 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-primary">Resumo do Pedido</h2>
              <p className="text-sm text-muted-foreground">Confirme os dados antes de enviar</p>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <span className="text-muted-foreground">Cliente</span>
              <span className="font-bold text-lg">{nomeCliente}</span>
            </div>

            <div className="py-3 border-b border-border">
              <span className="text-muted-foreground block mb-3">Itens ({totalItens})</span>
              <div className="space-y-2 max-h-48 overflow-auto">
                {itens.map((item) => (
                  <div key={item.produtoId} className="flex items-center justify-between bg-background/50 px-3 py-2 rounded-lg">
                    <span>
                      <span className="font-bold text-primary">{item.quantidade}x</span>{" "}
                      {item.nome}
                    </span>
                    <span className="font-semibold">R$ {(item.preco * item.quantidade).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {observacao && (
              <div className="py-3 border-b border-border">
                <span className="text-muted-foreground block mb-1">Observação</span>
                <p className="italic text-foreground/80">{observacao}</p>
              </div>
            )}

            <div className="flex items-center justify-between py-4 bg-primary/10 rounded-xl px-4 mt-4">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-3xl font-bold text-primary">R$ {total.toFixed(2)}</span>
            </div>
          </div>

          <div className="px-6 pb-6 flex gap-3">
            <Button variant="outline" className="flex-1 h-12" onClick={() => setEtapa("cardapio")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <Button
              className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-500/20"
              onClick={enviarPedido}
              disabled={enviando}
            >
              <Check className="h-5 w-5 mr-2" />
              {enviando ? "Enviando..." : "Enviar Pedido"}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ETAPA 2: Cardápio
  return (
    <div className="flex flex-col h-full">
      {/* Header do Cardápio */}
      <div className="px-4 py-3 border-b border-border bg-card/80 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setEtapa("cliente")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Voltar</span>
          </button>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Cliente</p>
            <p className="font-bold text-primary">{nomeCliente}</p>
          </div>
        </div>

        {/* Busca */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produto..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10 h-10 bg-background/50"
          />
        </div>

        {/* Categorias */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {CATEGORIAS.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoriaAtiva(cat.label)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0",
                categoriaAtiva === cat.label
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                  : "bg-card border border-border hover:border-primary/50"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Produtos */}
      <div className="flex-1 overflow-auto p-3 space-y-2">
        {produtosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <ShoppingBag className="h-12 w-12 mb-2 opacity-50" />
            <p>Nenhum produto encontrado</p>
          </div>
        ) : (
          produtosFiltrados.map((produto) => {
            const qtd = getQuantidade(produto.id)
            return (
              <div
                key={produto.id}
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-xl border bg-card transition-all",
                  qtd > 0 ? "border-primary bg-primary/5 shadow-md shadow-primary/10" : "border-border"
                )}
              >
                <div className="flex-1 min-w-0 mr-3">
                  <h3 className="font-bold text-sm truncate">{produto.nome}</h3>
                  <p className="text-xs text-muted-foreground truncate">{produto.descricao}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-bold text-primary">R$ {produto.preco.toFixed(2)}</span>
                  <div className="flex items-center gap-1.5">
                    {qtd > 0 && (
                      <>
                        <button
                          onClick={() => removerItem(produto.id)}
                          className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-card transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-6 text-center font-bold text-primary">{qtd}</span>
                      </>
                    )}
                    <button
                      onClick={() => adicionarItem(produto.id)}
                      className="w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:brightness-110 shadow-md shadow-primary/30 transition-all"
                    >
                      <Plus className="h-4 w-4 text-primary-foreground" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Footer fixo com resumo */}
      <div className="border-t-2 border-primary/30 bg-card p-4 shrink-0 space-y-3">
        {/* Observação inline */}
        <Textarea
          placeholder="Observação: sem cebola, bem passado..."
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          rows={2}
          className="bg-background/50 resize-none text-sm"
        />

        {/* Resumo e botão */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{totalItens} {totalItens === 1 ? "item" : "itens"}</p>
            <p className="text-2xl font-bold text-primary">R$ {total.toFixed(2)}</p>
          </div>
          <Button
            onClick={finalizarPedido}
            disabled={itens.length === 0}
            className={cn(
              "h-14 px-8 text-lg font-bold transition-all",
              itens.length > 0
                ? "bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/30"
                : "bg-muted text-muted-foreground"
            )}
          >
            <Check className="h-5 w-5 mr-2" />
            Finalizar
          </Button>
        </div>
      </div>
    </div>
  )
}
