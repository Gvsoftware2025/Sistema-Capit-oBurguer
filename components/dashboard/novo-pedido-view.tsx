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
      <div className="flex flex-col items-center justify-center flex-1 p-4 sm:p-6">
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto mb-3">
              <User className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-primary">Novo Pedido</h1>
            <p className="text-sm text-muted-foreground">Digite o nome do cliente</p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <Input
              placeholder="Nome do cliente..."
              value={nomeCliente}
              onChange={(e) => setNomeCliente(e.target.value)}
              className="h-12 sm:h-14 text-base sm:text-lg text-center bg-card border-2 border-border focus:border-primary"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && irParaCardapio()}
            />

            <Button
              onClick={irParaCardapio}
              disabled={!nomeCliente.trim()}
              className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30"
            >
              Continuar
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>

            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard")}
              className="w-full h-10"
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
      <div className="flex flex-col items-center justify-center flex-1 p-3 sm:p-4">
        <div className="w-full max-w-lg bg-card border-2 border-primary/30 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-primary/10 border-b border-primary/20 px-4 sm:px-6 py-4 flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <Package className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-serif font-bold text-primary truncate">Resumo do Pedido</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">Confirme antes de enviar</p>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
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

          <div className="px-4 sm:px-6 pb-4 sm:pb-6 flex gap-2 sm:gap-3">
            <Button variant="outline" className="flex-1 h-10 sm:h-12 text-sm" onClick={() => setEtapa("cardapio")}>
              <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
              Voltar
            </Button>
            <Button
              className="flex-1 h-10 sm:h-12 bg-green-600 hover:bg-green-700 text-white font-bold text-sm shadow-lg shadow-green-500/20"
              onClick={enviarPedido}
              disabled={enviando}
            >
              <Check className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              {enviando ? "Enviando..." : "Enviar"}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ETAPA 2: Cardápio
  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header do Cardápio */}
      <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-border bg-card/80 shrink-0">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <button
            onClick={() => setEtapa("cliente")}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Voltar</span>
          </button>
          <div className="text-right">
            <p className="text-[10px] sm:text-xs text-muted-foreground">Cliente</p>
            <p className="font-bold text-sm sm:text-base text-primary truncate max-w-[120px] sm:max-w-none">{nomeCliente}</p>
          </div>
        </div>

        {/* Busca */}
        <div className="relative mb-2 sm:mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10 h-9 sm:h-10 bg-background/50 text-sm"
          />
        </div>

        {/* Categorias */}
        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none -mx-1 px-1">
          {CATEGORIAS.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoriaAtiva(cat.label)}
              className={cn(
                "px-2.5 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-medium transition-all whitespace-nowrap shrink-0",
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
      <div className="flex-1 overflow-auto p-2 sm:p-3 space-y-1.5 sm:space-y-2">
        {produtosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <ShoppingBag className="h-10 w-10 mb-2 opacity-50" />
            <p className="text-sm">Nenhum produto encontrado</p>
          </div>
        ) : (
          produtosFiltrados.map((produto) => {
            const qtd = getQuantidade(produto.id)
            return (
              <div
                key={produto.id}
                className={cn(
                  "flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border bg-card transition-all",
                  qtd > 0 ? "border-primary bg-primary/5 shadow-md shadow-primary/10" : "border-border"
                )}
              >
                <div className="flex-1 min-w-0 mr-2 sm:mr-3">
                  <h3 className="font-bold text-xs sm:text-sm truncate">{produto.nome}</h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{produto.descricao}</p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <span className="font-bold text-xs sm:text-sm text-primary">R$ {produto.preco.toFixed(2)}</span>
                  <div className="flex items-center gap-1">
                    {qtd > 0 && (
                      <>
                        <button
                          onClick={() => removerItem(produto.id)}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-border flex items-center justify-center hover:bg-card transition-colors"
                        >
                          <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </button>
                        <span className="w-5 sm:w-6 text-center font-bold text-xs sm:text-sm text-primary">{qtd}</span>
                      </>
                    )}
                    <button
                      onClick={() => adicionarItem(produto.id)}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary flex items-center justify-center hover:brightness-110 shadow-md shadow-primary/30 transition-all"
                    >
                      <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-foreground" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Footer fixo com resumo */}
      <div className="border-t-2 border-primary/30 bg-card p-3 sm:p-4 shrink-0 space-y-2 sm:space-y-3">
        {/* Observação inline */}
        <Textarea
          placeholder="Observação..."
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          rows={1}
          className="bg-background/50 resize-none text-xs sm:text-sm min-h-[36px] sm:min-h-[44px]"
        />

        {/* Resumo e botão */}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-muted-foreground">{totalItens} {totalItens === 1 ? "item" : "itens"}</p>
            <p className="text-xl sm:text-2xl font-bold text-primary">R$ {total.toFixed(2)}</p>
          </div>
          <Button
            onClick={finalizarPedido}
            disabled={itens.length === 0}
            className={cn(
              "h-11 sm:h-14 px-5 sm:px-8 text-sm sm:text-lg font-bold transition-all shrink-0",
              itens.length > 0
                ? "bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/30"
                : "bg-muted text-muted-foreground"
            )}
          >
            <Check className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
            Finalizar
          </Button>
        </div>
      </div>
    </div>
  )
}
