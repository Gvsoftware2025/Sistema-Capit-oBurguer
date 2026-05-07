"use client"

import { useState } from "react"
import { Search, Plus, Minus, User, Check, ArrowLeft, Package } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { PRODUTOS, CATEGORIAS } from "@/lib/produtos"
import type { ItemPedido } from "@/lib/types"
import { toast } from "sonner"

export function NovoPedidoView() {
  const [nomeCliente, setNomeCliente] = useState("")
  const [observacao, setObservacao] = useState("")
  const [itens, setItens] = useState<ItemPedido[]>([])
  const [busca, setBusca] = useState("")
  const [categoriaAtiva, setCategoriaAtiva] = useState("Burgueres")
  const [enviando, setEnviando] = useState(false)
  const [mostrarResumo, setMostrarResumo] = useState(false)

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

  const finalizarPedido = () => {
    if (!nomeCliente.trim()) {
      toast.error("Informe o nome do cliente")
      return
    }
    if (itens.length === 0) {
      toast.error("Adicione pelo menos um item")
      return
    }
    setMostrarResumo(true)
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
        toast.success("Pedido enviado!")
        setNomeCliente("")
        setObservacao("")
        setItens([])
        setMostrarResumo(false)
      } else {
        toast.error("Erro ao enviar pedido")
      }
    } catch {
      toast.error("Erro ao enviar pedido")
    } finally {
      setEnviando(false)
    }
  }

  // Modal de Resumo
  if (mostrarResumo) {
    return (
      <div className="flex items-center justify-center min-h-full p-6 animate-scale-in">
        <div className="w-full max-w-lg bg-card border-2 border-primary/40 rounded-2xl overflow-hidden shadow-2xl shadow-primary/10">
          <div className="bg-primary/10 border-b border-primary/20 px-6 py-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-primary">Resumo do Pedido</h2>
              <p className="text-xs text-muted-foreground">Confirme antes de enviar</p>
            </div>
          </div>

          <div className="p-6 space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <span className="text-muted-foreground text-sm">Cliente</span>
              <span className="font-semibold">{nomeCliente}</span>
            </div>

            <div className="py-3 border-b border-border">
              <span className="text-muted-foreground text-sm block mb-3">Itens</span>
              <div className="space-y-2">
                {itens.map((item) => (
                  <div key={item.produtoId} className="flex items-center justify-between">
                    <span className="text-sm">
                      <span className="font-bold text-primary">{item.quantidade}x</span>{" "}
                      {item.nome}
                    </span>
                    <span className="text-sm font-medium">
                      R$ {(item.preco * item.quantidade).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {observacao && (
              <div className="py-3 border-b border-border">
                <span className="text-muted-foreground text-sm block mb-1">Observação</span>
                <span className="text-sm italic text-foreground/80">{observacao}</span>
              </div>
            )}

            <div className="flex items-center justify-between py-4 bg-primary/10 rounded-xl px-4">
              <span className="text-base font-semibold">Total</span>
              <span className="text-3xl font-bold text-primary">R$ {total.toFixed(2)}</span>
            </div>
          </div>

          <div className="px-6 pb-6 flex gap-3">
            <Button variant="outline" className="flex-1 h-12" onClick={() => setMostrarResumo(false)}>
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

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden">
      {/* Cardápio */}
      <div className="flex-1 flex flex-col min-h-0 border-r border-border">
        <div className="px-6 py-4 border-b border-border bg-card/50 shrink-0">
          <h1 className="text-xl font-serif font-bold text-primary mb-3">Cardápio</h1>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produto..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10 bg-background/50 h-9"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIAS.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoriaAtiva(cat.label)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                  categoriaAtiva === cat.label
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                    : "bg-card border border-border hover:border-primary/50 hover:bg-primary/5"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-1.5">
          {produtosFiltrados.map((produto) => {
            const qtd = getQuantidade(produto.id)
            return (
              <div
                key={produto.id}
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-xl border bg-card/50 transition-all duration-200 hover:bg-card",
                  qtd > 0 ? "border-primary/50 bg-primary/5" : "border-border"
                )}
              >
                <div className="flex-1 min-w-0 mr-3">
                  <h3 className="font-semibold text-sm uppercase truncate">{produto.nome}</h3>
                  <p className="text-xs text-muted-foreground truncate">{produto.descricao}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-bold text-primary text-sm whitespace-nowrap">
                    R$ {produto.preco.toFixed(2)}
                  </span>
                  <div className="flex items-center gap-1">
                    {qtd > 0 && (
                      <>
                        <button
                          onClick={() => removerItem(produto.id)}
                          className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-card transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-5 text-center font-bold text-primary text-sm">{qtd}</span>
                      </>
                    )}
                    <button
                      onClick={() => adicionarItem(produto.id)}
                      className="w-7 h-7 rounded-full bg-primary flex items-center justify-center hover:brightness-110 shadow-md shadow-primary/30 transition-all"
                    >
                      <Plus className="h-3.5 w-3.5 text-primary-foreground" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Painel do pedido */}
      <div className="w-full lg:w-[380px] flex flex-col bg-card/30 shrink-0 min-h-0">
        <div className="px-6 py-4 border-b border-border shrink-0">
          <h2 className="text-lg font-serif font-bold text-primary flex items-center gap-2">
            <User className="h-5 w-5" />
            Novo Pedido
          </h2>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-5">
          {/* Nome cliente */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">
              Nome do Cliente
            </Label>
            <Input
              placeholder="Digite o nome..."
              value={nomeCliente}
              onChange={(e) => setNomeCliente(e.target.value)}
              className="bg-background/60 h-11 text-base"
              autoFocus
            />
          </div>

          {/* Itens selecionados */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">
              Itens ({itens.reduce((a, i) => a + i.quantidade, 0)})
            </Label>
            {itens.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-border rounded-xl text-muted-foreground text-sm">
                Nenhum item adicionado
              </div>
            ) : (
              <div className="space-y-1.5 max-h-52 overflow-auto pr-1 scrollbar-thin">
                {itens.map((item) => (
                  <div
                    key={item.produtoId}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-background/60 border border-border"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-primary">{item.quantidade}x</span>
                      <span className="text-sm">{item.nome}</span>
                    </div>
                    <span className="text-sm font-semibold">
                      R$ {(item.preco * item.quantidade).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Observação */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">
              Observação
            </Label>
            <Textarea
              placeholder="Sem cebola, bem passado..."
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              rows={2}
              className="bg-background/60 resize-none"
            />
          </div>
        </div>

        <div className="px-6 pb-6 pt-4 border-t border-border shrink-0 space-y-4 bg-card/50">
          <div className="flex items-center justify-between">
            <span className="text-base font-medium text-muted-foreground">Total</span>
            <span className="text-3xl font-bold text-primary">R$ {total.toFixed(2)}</span>
          </div>
          <button
            onClick={finalizarPedido}
            disabled={itens.length === 0 || !nomeCliente.trim()}
            className={cn(
              "w-full py-4 rounded-xl font-bold text-lg tracking-wide transition-all duration-200 flex items-center justify-center gap-3",
              itens.length > 0 && nomeCliente.trim()
                ? "bg-green-600 text-white hover:bg-green-700 shadow-xl shadow-green-500/30 hover:shadow-green-500/50 hover:scale-[1.01] active:scale-[0.99]"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            <Check className="h-5 w-5" />
            Finalizar Pedido
          </button>
        </div>
      </div>
    </div>
  )
}
