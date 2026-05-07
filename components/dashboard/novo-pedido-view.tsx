"use client"

import { useState } from "react"
import { Search, Plus, Minus, User, Check, ArrowLeft, Package } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { produtos, categorias } from "@/lib/produtos"
import type { ItemPedido } from "@/lib/types"
import { toast } from "sonner"

type TipoPedido = "balcao" | "retirada" | "entrega"

export function NovoPedidoView() {
  const [nomeCliente, setNomeCliente] = useState("")
  const [tipo, setTipo] = useState<TipoPedido>("balcao")
  const [numeroMesa, setNumeroMesa] = useState("")
  const [observacao, setObservacao] = useState("")
  const [itens, setItens] = useState<ItemPedido[]>([])
  const [busca, setBusca] = useState("")
  const [categoriaAtiva, setCategoriaAtiva] = useState("Burgueres")
  const [enviando, setEnviando] = useState(false)
  const [mostrarResumo, setMostrarResumo] = useState(false)

  const produtosFiltrados = produtos.filter((p) => {
    const matchCategoria = p.categoria === categoriaAtiva
    const matchBusca = busca === "" || p.nome.toLowerCase().includes(busca.toLowerCase())
    return matchCategoria && matchBusca
  })

  const adicionarItem = (produtoId: string) => {
    const produto = produtos.find((p) => p.id === produtoId)
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
      if (existente.quantidade === 1) {
        return prev.filter((i) => i.produtoId !== produtoId)
      }
      return prev.map((i) =>
        i.produtoId === produtoId ? { ...i, quantidade: i.quantidade - 1 } : i
      )
    })
  }

  const getQuantidade = (produtoId: string) => {
    return itens.find((i) => i.produtoId === produtoId)?.quantidade || 0
  }

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
    if (tipo === "balcao" && !numeroMesa.trim()) {
      toast.error("Informe o número da mesa")
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
          cliente: tipo === "balcao" ? `${nomeCliente} - Mesa ${numeroMesa}` : nomeCliente,
          tipo,
          observacao,
          itens,
        }),
      })

      if (res.ok) {
        toast.success("Pedido enviado com sucesso!")
        setNomeCliente("")
        setNumeroMesa("")
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
      <div className="flex items-center justify-center min-h-full p-4 bg-background/80 backdrop-blur-sm">
        <div className="w-full max-w-lg bg-card border-2 border-primary rounded-2xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="bg-primary/10 border-b border-primary/30 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold text-primary">Resumo do Pedido</h2>
                <p className="text-sm text-muted-foreground">Confirme os dados antes de enviar</p>
              </div>
            </div>
          </div>

          {/* Conteudo */}
          <div className="p-6 space-y-4">
            {/* Cliente */}
            <div className="flex items-center justify-between py-3 border-b border-border">
              <span className="text-muted-foreground">Cliente</span>
              <span className="font-semibold">{nomeCliente}</span>
            </div>

            {/* Mesa (se balcao) */}
            {tipo === "balcao" && (
              <div className="flex items-center justify-between py-3 border-b border-border">
                <span className="text-muted-foreground">Mesa</span>
                <span className="font-semibold text-primary text-lg">{numeroMesa}</span>
              </div>
            )}

            {/* Tipo */}
            {tipo !== "balcao" && (
              <div className="flex items-center justify-between py-3 border-b border-border">
                <span className="text-muted-foreground">Tipo</span>
                <span className="font-semibold capitalize">{tipo}</span>
              </div>
            )}

            {/* Itens */}
            <div className="py-3 border-b border-border">
              <span className="text-muted-foreground block mb-3">Itens</span>
              <div className="space-y-2">
                {itens.map((item) => (
                  <div key={item.produtoId} className="flex items-center justify-between">
                    <span className="text-sm">
                      <span className="font-semibold text-primary">{item.quantidade}x</span>{" "}
                      {item.nome}
                    </span>
                    <span className="text-sm font-medium">
                      R$ {(item.preco * item.quantidade).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Observacao */}
            {observacao && (
              <div className="py-3 border-b border-border">
                <span className="text-muted-foreground block mb-1">Observacao</span>
                <span className="text-sm italic">{observacao}</span>
              </div>
            )}

            {/* Total */}
            <div className="flex items-center justify-between py-4 bg-primary/10 rounded-xl px-4 -mx-2">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-2xl font-bold text-primary">R$ {total.toFixed(2)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border flex gap-3">
            <Button
              variant="outline"
              className="flex-1 h-12"
              onClick={() => setMostrarResumo(false)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <Button
              className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white font-bold"
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
    <div className="flex flex-col lg:flex-row h-full">
      {/* Cardapio */}
      <div className="flex-1 flex flex-col border-r border-border">
        {/* Header */}
        <div className="p-4 lg:p-6 border-b border-border">
          <h1 className="text-2xl font-serif font-bold text-primary mb-4">Cardapio</h1>

          {/* Busca */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produto..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Categorias */}
          <div className="flex flex-wrap gap-2">
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaAtiva(cat)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                  categoriaAtiva === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border hover:border-primary/50"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Lista Produtos */}
        <div className="flex-1 overflow-auto p-4 lg:p-6">
          <div className="space-y-2">
            {produtosFiltrados.map((produto) => {
              const qtd = getQuantidade(produto.id)
              return (
                <div
                  key={produto.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border bg-card transition-all",
                    qtd > 0 ? "border-primary ring-1 ring-primary/20" : "border-border"
                  )}
                >
                  <div className="flex-1">
                    <h3 className="font-semibold uppercase text-sm">{produto.nome}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {produto.descricao}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-primary">
                      R$ {produto.preco.toFixed(2)}
                    </span>
                    <div className="flex items-center gap-1">
                      {qtd > 0 && (
                        <>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 rounded-full"
                            onClick={() => removerItem(produto.id)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-6 text-center font-bold">{qtd}</span>
                        </>
                      )}
                      <Button
                        size="icon"
                        className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90"
                        onClick={() => adicionarItem(produto.id)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Resumo Pedido */}
      <div className="w-full lg:w-96 flex flex-col bg-card/50">
        <div className="p-4 lg:p-6 border-b border-border">
          <h2 className="text-xl font-serif font-bold text-primary flex items-center gap-2">
            <User className="h-5 w-5" />
            Pedido Interno
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Funcionario</p>
        </div>

        <div className="flex-1 overflow-auto p-4 lg:p-6 space-y-4">
          {/* Nome cliente */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Cliente</Label>
            <Input
              placeholder="Nome do cliente"
              value={nomeCliente}
              onChange={(e) => setNomeCliente(e.target.value)}
            />
          </div>

          {/* Tipo */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Tipo</Label>
            <div className="grid grid-cols-3 gap-2">
              {(["balcao", "retirada", "entrega"] as TipoPedido[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTipo(t)}
                  className={cn(
                    "py-2 px-3 rounded-lg text-sm font-medium transition-all border",
                    tipo === t
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border hover:border-primary/50"
                  )}
                >
                  {t === "balcao" ? "BALCAO" : t === "retirada" ? "RETIRADA" : "ENTREGA"}
                </button>
              ))}
            </div>
          </div>

          {/* Numero Mesa (so aparece se for balcao) */}
          {tipo === "balcao" && (
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Numero da Mesa</Label>
              <Input
                placeholder="Ex: 5"
                value={numeroMesa}
                onChange={(e) => setNumeroMesa(e.target.value)}
                type="number"
                className="text-center text-lg font-bold"
              />
            </div>
          )}

          {/* Itens */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Itens ({itens.reduce((a, i) => a + i.quantidade, 0)})
            </Label>
            {itens.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Nenhum item adicionado
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-auto">
                {itens.map((item) => (
                  <div
                    key={item.produtoId}
                    className="flex items-center justify-between p-2 rounded-lg bg-background border border-border"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-primary">{item.quantidade}x</span>
                      <span className="text-sm">{item.nome}</span>
                    </div>
                    <span className="text-sm font-medium">
                      R$ {(item.preco * item.quantidade).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Observacao */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Observacao (opcional)
            </Label>
            <Textarea
              placeholder="Sem cebola, bem passado..."
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 lg:p-6 border-t border-border space-y-4">
          <div className="flex items-center justify-between text-lg">
            <span className="font-medium">Total:</span>
            <span className="font-bold text-primary text-xl">R$ {total.toFixed(2)}</span>
          </div>
          <Button
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12"
            onClick={finalizarPedido}
            disabled={itens.length === 0}
          >
            <Check className="h-5 w-5 mr-2" />
            Finalizar Pedido
          </Button>
        </div>
      </div>
    </div>
  )
}
