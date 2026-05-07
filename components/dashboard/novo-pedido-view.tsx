"use client"

import { useState } from "react"
import { Search, Plus, Minus, Send, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import { produtos, categorias } from "@/lib/produtos"
import type { ItemPedido } from "@/lib/types"
import { toast } from "sonner"
import Image from "next/image"

export function NovoPedidoView() {
  const [nomeCliente, setNomeCliente] = useState("")
  const [tipo, setTipo] = useState<"retirada" | "entrega">("retirada")
  const [observacao, setObservacao] = useState("")
  const [itens, setItens] = useState<ItemPedido[]>([])
  const [busca, setBusca] = useState("")
  const [categoriaAtiva, setCategoriaAtiva] = useState("Burgueres")
  const [enviando, setEnviando] = useState(false)

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

  const enviarPedido = async () => {
    if (!nomeCliente.trim()) {
      toast.error("Informe o nome do cliente")
      return
    }
    if (itens.length === 0) {
      toast.error("Adicione pelo menos um item")
      return
    }

    setEnviando(true)
    try {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente: nomeCliente,
          tipo,
          observacao,
          itens,
        }),
      })

      if (res.ok) {
        toast.success("Pedido enviado com sucesso!")
        setNomeCliente("")
        setObservacao("")
        setItens([])
      } else {
        toast.error("Erro ao enviar pedido")
      }
    } catch {
      toast.error("Erro ao enviar pedido")
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* Cardápio */}
      <div className="flex-1 flex flex-col border-r border-border">
        {/* Header */}
        <div className="p-4 lg:p-6 border-b border-border">
          <h1 className="text-2xl font-serif font-bold text-primary mb-4">Cardápio</h1>

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

        {/* Grid Produtos */}
        <div className="flex-1 overflow-auto p-4 lg:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {produtosFiltrados.map((produto) => {
              const qtd = getQuantidade(produto.id)
              return (
                <div
                  key={produto.id}
                  className={cn(
                    "relative rounded-xl border bg-card overflow-hidden transition-all",
                    qtd > 0 ? "border-primary ring-2 ring-primary/20" : "border-border"
                  )}
                >
                  {/* Imagem */}
                  <div className="relative aspect-square bg-muted">
                    {produto.imagem ? (
                      <Image
                        src={produto.imagem}
                        alt={produto.nome}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        Sem imagem
                      </div>
                    )}
                    {qtd > 0 && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                        {qtd}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <h3 className="font-medium text-sm line-clamp-1">{produto.nome}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 h-8">
                      {produto.descricao}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-primary">
                        R$ {produto.preco.toFixed(2)}
                      </span>
                      <div className="flex items-center gap-1">
                        {qtd > 0 && (
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7"
                            onClick={() => removerItem(produto.id)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          className="h-7 w-7 bg-primary hover:bg-primary/90"
                          onClick={() => adicionarItem(produto.id)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
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
            Novo Pedido
          </h2>
        </div>

        <div className="flex-1 overflow-auto p-4 lg:p-6 space-y-4">
          {/* Nome cliente */}
          <div className="space-y-2">
            <Label>Nome do Cliente</Label>
            <Input
              placeholder="Digite o nome..."
              value={nomeCliente}
              onChange={(e) => setNomeCliente(e.target.value)}
            />
          </div>

          {/* Tipo */}
          <div className="space-y-2">
            <Label>Tipo do Pedido</Label>
            <RadioGroup
              value={tipo}
              onValueChange={(v) => setTipo(v as "retirada" | "entrega")}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="retirada" id="retirada" />
                <Label htmlFor="retirada" className="cursor-pointer">Retirada</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="entrega" id="entrega" />
                <Label htmlFor="entrega" className="cursor-pointer">Entrega</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Itens */}
          <div className="space-y-2">
            <Label>Itens ({itens.length})</Label>
            {itens.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum item adicionado</p>
            ) : (
              <div className="space-y-2">
                {itens.map((item) => (
                  <div
                    key={item.produtoId}
                    className="flex items-center justify-between p-2 rounded-lg bg-background border border-border"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{item.quantidade}x</span>
                      <span className="text-sm">{item.nome}</span>
                    </div>
                    <span className="text-sm font-medium text-primary">
                      R$ {(item.preco * item.quantidade).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Observação */}
          <div className="space-y-2">
            <Label>Observação (opcional)</Label>
            <Textarea
              placeholder="Ex: Sem cebola, bem passado..."
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 lg:p-6 border-t border-border space-y-4">
          <div className="flex items-center justify-between text-lg">
            <span className="font-medium">Total:</span>
            <span className="font-bold text-primary">R$ {total.toFixed(2)}</span>
          </div>
          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12"
            onClick={enviarPedido}
            disabled={enviando || itens.length === 0}
          >
            <Send className="h-5 w-5 mr-2" />
            {enviando ? "Enviando..." : "Enviar Pedido"}
          </Button>
        </div>
      </div>
    </div>
  )
}
