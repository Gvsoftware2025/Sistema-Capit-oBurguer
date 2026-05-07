"use client"

import { useState } from "react"
import { Search, Plus, Pencil, Trash2, ImageIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { produtos as produtosIniciais, categorias } from "@/lib/produtos"
import type { Produto } from "@/lib/types"
import { toast } from "sonner"
import Image from "next/image"

export function CardapioGestaoView() {
  const [produtos, setProdutos] = useState<Produto[]>(produtosIniciais)
  const [busca, setBusca] = useState("")
  const [categoriaAtiva, setCategoriaAtiva] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editando, setEditando] = useState<Produto | null>(null)

  // Form state
  const [formNome, setFormNome] = useState("")
  const [formDescricao, setFormDescricao] = useState("")
  const [formPreco, setFormPreco] = useState("")
  const [formCategoria, setFormCategoria] = useState("")

  const produtosFiltrados = produtos.filter((p) => {
    const matchCategoria = !categoriaAtiva || p.categoria === categoriaAtiva
    const matchBusca = !busca || p.nome.toLowerCase().includes(busca.toLowerCase())
    return matchCategoria && matchBusca
  })

  const abrirDialog = (produto?: Produto) => {
    if (produto) {
      setEditando(produto)
      setFormNome(produto.nome)
      setFormDescricao(produto.descricao)
      setFormPreco(produto.preco.toString())
      setFormCategoria(produto.categoria)
    } else {
      setEditando(null)
      setFormNome("")
      setFormDescricao("")
      setFormPreco("")
      setFormCategoria("")
    }
    setDialogOpen(true)
  }

  const salvarProduto = () => {
    if (!formNome || !formPreco || !formCategoria) {
      toast.error("Preencha todos os campos obrigatórios")
      return
    }

    if (editando) {
      setProdutos((prev) =>
        prev.map((p) =>
          p.id === editando.id
            ? { ...p, nome: formNome, descricao: formDescricao, preco: parseFloat(formPreco), categoria: formCategoria }
            : p
        )
      )
      toast.success("Produto atualizado!")
    } else {
      const novoProduto: Produto = {
        id: `prod-${Date.now()}`,
        nome: formNome,
        descricao: formDescricao,
        preco: parseFloat(formPreco),
        categoria: formCategoria,
        disponivel: true,
      }
      setProdutos((prev) => [...prev, novoProduto])
      toast.success("Produto adicionado!")
    }

    setDialogOpen(false)
  }

  const excluirProduto = (id: string) => {
    setProdutos((prev) => prev.filter((p) => p.id !== id))
    toast.success("Produto excluído!")
  }

  const toggleDisponibilidade = (id: string) => {
    setProdutos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, disponivel: !p.disponivel } : p))
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <h1 className="text-2xl font-serif font-bold text-primary">
            Gestão do Cardápio
          </h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => abrirDialog()} className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editando ? "Editar Produto" : "Novo Produto"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nome *</Label>
                  <Input
                    value={formNome}
                    onChange={(e) => setFormNome(e.target.value)}
                    placeholder="Ex: Capitão Cheddar"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea
                    value={formDescricao}
                    onChange={(e) => setFormDescricao(e.target.value)}
                    placeholder="Descrição do produto..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Preço *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formPreco}
                      onChange={(e) => setFormPreco(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Categoria *</Label>
                    <Select value={formCategoria} onValueChange={setFormCategoria}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={salvarProduto} className="w-full">
                  {editando ? "Salvar Alterações" : "Adicionar Produto"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Busca e filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produto..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Categorias */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => setCategoriaAtiva(null)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              !categoriaAtiva
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border hover:border-primary/50"
            )}
          >
            Todos ({produtos.length})
          </button>
          {categorias.map((cat) => {
            const count = produtos.filter((p) => p.categoria === cat).length
            return (
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
                {cat} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {produtosFiltrados.map((produto) => (
            <div
              key={produto.id}
              className={cn(
                "rounded-xl border bg-card overflow-hidden transition-all",
                !produto.disponivel && "opacity-60"
              )}
            >
              {/* Imagem */}
              <div className="relative aspect-video bg-muted">
                {produto.imagem ? (
                  <Image
                    src={produto.imagem}
                    alt={produto.nome}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <Badge variant={produto.disponivel ? "default" : "secondary"}>
                    {produto.disponivel ? "Disponível" : "Indisponível"}
                  </Badge>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold line-clamp-1">{produto.nome}</h3>
                  <span className="font-bold text-primary whitespace-nowrap">
                    R$ {produto.preco.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {produto.descricao || "Sem descrição"}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => abrirDialog(produto)}
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleDisponibilidade(produto.id)}
                  >
                    {produto.disponivel ? "Desativar" : "Ativar"}
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8"
                    onClick={() => excluirProduto(produto.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
