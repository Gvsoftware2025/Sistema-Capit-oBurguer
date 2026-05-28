"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Pencil, Trash2, Loader2, Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type Categoria = {
  id: number
  name: string
  display_order: number
}

type Produto = {
  id: number
  name: string
  description: string | null
  price: number
  category_id: number
  image_url: string | null
  is_available: boolean
}

type Maionese = {
  id: number
  name: string
  price: number
  is_available: boolean
}

type Adicional = {
  id: number
  name: string
  price: number
  is_available: boolean
}

export function CardapioGestaoView() {
  const [busca, setBusca] = useState("")
  const [categoriaAtiva, setCategoriaAtiva] = useState<number | null>(null)
  const [tabAtiva, setTabAtiva] = useState("produtos")
  
  // Dialog states
  const [dialogProduto, setDialogProduto] = useState(false)
  const [dialogMaionese, setDialogMaionese] = useState(false)
  const [dialogAdicional, setDialogAdicional] = useState(false)
  const [editandoProduto, setEditandoProduto] = useState<Produto | null>(null)
  const [editandoMaionese, setEditandoMaionese] = useState<Maionese | null>(null)
  const [editandoAdicional, setEditandoAdicional] = useState<Adicional | null>(null)
  const [salvando, setSalvando] = useState(false)

  // Form states
  const [formNome, setFormNome] = useState("")
  const [formDescricao, setFormDescricao] = useState("")
  const [formPreco, setFormPreco] = useState("")
  const [formCategoria, setFormCategoria] = useState("")
  const [formImagem, setFormImagem] = useState("")
  const [uploadingImage, setUploadingImage] = useState(false)

  // Fetch data from API
  const { data: categoriasData, mutate: mutateCategorias } = useSWR("/api/cardapio/categorias", fetcher)
  const { data: produtosData, mutate: mutateProdutos } = useSWR("/api/cardapio/produtos", fetcher)
  const { data: maionesesData, mutate: mutateMaioneses } = useSWR("/api/cardapio/maioneses", fetcher)
  const { data: adicionaisData, mutate: mutateAdicionais } = useSWR("/api/cardapio/adicionais", fetcher)

  const categorias: Categoria[] = categoriasData?.categorias || []
  const produtos: Produto[] = produtosData?.produtos || []
  const maioneses: Maionese[] = maionesesData?.maioneses || []
  const adicionais: Adicional[] = adicionaisData?.adicionais || []

  const produtosFiltrados = produtos.filter((p) => {
    const matchCategoria = !categoriaAtiva || p.category_id === categoriaAtiva
    const matchBusca = !busca || p.name.toLowerCase().includes(busca.toLowerCase())
    return matchCategoria && matchBusca
  })

  // Produto functions
  const abrirDialogProduto = (produto?: Produto) => {
    if (produto) {
      setEditandoProduto(produto)
      setFormNome(produto.name)
      setFormDescricao(produto.description || "")
      setFormPreco(produto.price.toString())
      setFormCategoria(produto.category_id.toString())
      setFormImagem(produto.image_url || "")
    } else {
      setEditandoProduto(null)
      setFormNome("")
      setFormDescricao("")
      setFormPreco("")
      setFormCategoria(categorias[0]?.id.toString() || "")
      setFormImagem("")
    }
    setDialogProduto(true)
  }

  const handleUploadImagem = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Imagem muito grande. Maximo 4MB.")
      return
    }
    
    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      
      const data = await res.json()
      if (data.url) {
        setFormImagem(data.url)
        toast.success("Imagem enviada!")
      } else {
        toast.error(data.error || "Erro ao enviar imagem")
      }
    } catch {
      toast.error("Erro ao enviar imagem")
    } finally {
      setUploadingImage(false)
    }
  }

  const salvarProduto = async () => {
    if (!formNome || !formPreco || !formCategoria) {
      toast.error("Preencha todos os campos obrigatórios")
      return
    }
    setSalvando(true)
    try {
      if (editandoProduto) {
        const res = await fetch(`/api/cardapio/produtos/${editandoProduto.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formNome,
            description: formDescricao || null,
            price: parseFloat(formPreco),
            category_id: parseInt(formCategoria),
            image_url: formImagem || null,
            is_available: editandoProduto.is_available,
          }),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || "Erro ao atualizar")
        }
        toast.success("Produto atualizado!")
      } else {
        const res = await fetch("/api/cardapio/produtos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formNome,
            description: formDescricao || null,
            price: parseFloat(formPreco),
            category_id: parseInt(formCategoria),
            image_url: formImagem || null,
          }),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || "Erro ao adicionar")
        }
        toast.success("Produto adicionado!")
      }
      mutateProdutos()
      setDialogProduto(false)
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar produto")
    } finally {
      setSalvando(false)
    }
  }

  const toggleDisponibilidadeProduto = async (produto: Produto) => {
    try {
      await fetch(`/api/cardapio/produtos/${produto.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...produto,
          is_available: !produto.is_available,
        }),
      })
      mutateProdutos()
      toast.success(produto.is_available ? "Produto desativado" : "Produto ativado")
    } catch {
      toast.error("Erro ao atualizar disponibilidade")
    }
  }

  const excluirProduto = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return
    try {
      await fetch(`/api/cardapio/produtos/${id}`, { method: "DELETE" })
      mutateProdutos()
      toast.success("Produto excluído!")
    } catch {
      toast.error("Erro ao excluir produto")
    }
  }

  // Maionese functions
  const abrirDialogMaionese = (maionese?: Maionese) => {
    if (maionese) {
      setEditandoMaionese(maionese)
      setFormNome(maionese.name)
      setFormPreco(maionese.price.toString())
    } else {
      setEditandoMaionese(null)
      setFormNome("")
      setFormPreco("0")
    }
    setDialogMaionese(true)
  }

  const salvarMaionese = async () => {
    if (!formNome) {
      toast.error("Preencha o nome")
      return
    }
    setSalvando(true)
    try {
      if (editandoMaionese) {
        await fetch(`/api/cardapio/maioneses/${editandoMaionese.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formNome,
            price: parseFloat(formPreco) || 0,
            is_available: editandoMaionese.is_available,
          }),
        })
        toast.success("Maionese atualizada!")
      } else {
        await fetch("/api/cardapio/maioneses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formNome,
            price: parseFloat(formPreco) || 0,
          }),
        })
        toast.success("Maionese adicionada!")
      }
      mutateMaioneses()
      setDialogMaionese(false)
    } catch {
      toast.error("Erro ao salvar maionese")
    } finally {
      setSalvando(false)
    }
  }

  const toggleDisponibilidadeMaionese = async (maionese: Maionese) => {
    try {
      await fetch(`/api/cardapio/maioneses/${maionese.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...maionese,
          is_available: !maionese.is_available,
        }),
      })
      mutateMaioneses()
      toast.success(maionese.is_available ? "Maionese desativada" : "Maionese ativada")
    } catch {
      toast.error("Erro ao atualizar disponibilidade")
    }
  }

  const excluirMaionese = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta maionese?")) return
    try {
      await fetch(`/api/cardapio/maioneses/${id}`, { method: "DELETE" })
      mutateMaioneses()
      toast.success("Maionese excluída!")
    } catch {
      toast.error("Erro ao excluir maionese")
    }
  }

  // Adicional functions
  const abrirDialogAdicional = (adicional?: Adicional) => {
    if (adicional) {
      setEditandoAdicional(adicional)
      setFormNome(adicional.name)
      setFormPreco(adicional.price.toString())
    } else {
      setEditandoAdicional(null)
      setFormNome("")
      setFormPreco("")
    }
    setDialogAdicional(true)
  }

  const salvarAdicional = async () => {
    if (!formNome || !formPreco) {
      toast.error("Preencha todos os campos")
      return
    }
    setSalvando(true)
    try {
      if (editandoAdicional) {
        await fetch(`/api/cardapio/adicionais/${editandoAdicional.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formNome,
            price: parseFloat(formPreco),
            is_available: editandoAdicional.is_available,
          }),
        })
        toast.success("Adicional atualizado!")
      } else {
        await fetch("/api/cardapio/adicionais", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formNome,
            price: parseFloat(formPreco),
          }),
        })
        toast.success("Adicional adicionado!")
      }
      mutateAdicionais()
      setDialogAdicional(false)
    } catch {
      toast.error("Erro ao salvar adicional")
    } finally {
      setSalvando(false)
    }
  }

  const toggleDisponibilidadeAdicional = async (adicional: Adicional) => {
    try {
      await fetch(`/api/cardapio/adicionais/${adicional.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...adicional,
          is_available: !adicional.is_available,
        }),
      })
      mutateAdicionais()
      toast.success(adicional.is_available ? "Adicional desativado" : "Adicional ativado")
    } catch {
      toast.error("Erro ao atualizar disponibilidade")
    }
  }

  const excluirAdicional = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este adicional?")) return
    try {
      await fetch(`/api/cardapio/adicionais/${id}`, { method: "DELETE" })
      mutateAdicionais()
      toast.success("Adicional excluído!")
    } catch {
      toast.error("Erro ao excluir adicional")
    }
  }

  if (!produtosData) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-border">
        <h1 className="text-2xl font-serif font-bold text-primary mb-4">
          Gestão do Cardápio
        </h1>

        <Tabs value={tabAtiva} onValueChange={setTabAtiva}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="produtos">Produtos ({produtos.length})</TabsTrigger>
            <TabsTrigger value="maioneses">Maioneses ({maioneses.length})</TabsTrigger>
            <TabsTrigger value="adicionais">Adicionais ({adicionais.length})</TabsTrigger>
          </TabsList>

          {/* PRODUTOS */}
          <TabsContent value="produtos" className="mt-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar produto..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => abrirDialogProduto()} className="gap-2 shrink-0">
                <Plus className="h-4 w-4" />
                Novo Produto
              </Button>
            </div>

            {/* Categorias */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setCategoriaAtiva(null)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                  !categoriaAtiva
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border hover:border-primary/50"
                )}
              >
                Todos
              </button>
              {categorias.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoriaAtiva(cat.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                    categoriaAtiva === cat.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border hover:border-primary/50"
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </TabsContent>

          {/* MAIONESES */}
          <TabsContent value="maioneses" className="mt-4">
            <div className="flex justify-end mb-4">
              <Button onClick={() => abrirDialogMaionese()} className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Maionese
              </Button>
            </div>
          </TabsContent>

          {/* ADICIONAIS */}
          <TabsContent value="adicionais" className="mt-4">
            <div className="flex justify-end mb-4">
              <Button onClick={() => abrirDialogAdicional()} className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Adicional
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-auto p-4 lg:p-6">
        {tabAtiva === "produtos" && (
          <div className="grid gap-3">
            {produtosFiltrados.map((produto) => (
              <div
                key={produto.id}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl border-2 transition-all",
                  produto.is_available
                    ? "bg-card border-border"
                    : "bg-card/50 border-red-500/30 opacity-60"
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{produto.name}</h3>
                    {!produto.is_available && (
                      <Badge variant="destructive" className="text-xs">Indisponível</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {categorias.find(c => c.id === produto.category_id)?.name}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-primary">R$ {Number(produto.price).toFixed(2)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleDisponibilidadeProduto(produto)}
                    title={produto.is_available ? "Desativar" : "Ativar"}
                  >
                    {produto.is_available ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-red-500" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => abrirDialogProduto(produto)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => excluirProduto(produto.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tabAtiva === "maioneses" && (
          <div className="grid gap-3">
            {maioneses.map((maionese) => (
              <div
                key={maionese.id}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl border-2 transition-all",
                  maionese.is_available
                    ? "bg-card border-border"
                    : "bg-card/50 border-red-500/30 opacity-60"
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{maionese.name}</h3>
                    {!maionese.is_available && (
                      <Badge variant="destructive" className="text-xs">Indisponível</Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {Number(maionese.price) > 0 ? `R$ ${Number(maionese.price).toFixed(2)}` : "Grátis"}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleDisponibilidadeMaionese(maionese)}
                    title={maionese.is_available ? "Desativar" : "Ativar"}
                  >
                    {maionese.is_available ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-red-500" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => abrirDialogMaionese(maionese)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => excluirMaionese(maionese.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tabAtiva === "adicionais" && (
          <div className="grid gap-3">
            {adicionais.map((adicional) => (
              <div
                key={adicional.id}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl border-2 transition-all",
                  adicional.is_available
                    ? "bg-card border-border"
                    : "bg-card/50 border-red-500/30 opacity-60"
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{adicional.name}</h3>
                    {!adicional.is_available && (
                      <Badge variant="destructive" className="text-xs">Indisponível</Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-primary">R$ {Number(adicional.price).toFixed(2)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleDisponibilidadeAdicional(adicional)}
                    title={adicional.is_available ? "Desativar" : "Ativar"}
                  >
                    {adicional.is_available ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-red-500" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => abrirDialogAdicional(adicional)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => excluirAdicional(adicional.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dialog Produto */}
      <Dialog open={dialogProduto} onOpenChange={setDialogProduto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editandoProduto ? "Editar Produto" : "Novo Produto"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input value={formNome} onChange={(e) => setFormNome(e.target.value)} placeholder="Ex: Capitão Cheddar" />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea value={formDescricao} onChange={(e) => setFormDescricao(e.target.value)} placeholder="Descrição do produto..." rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preço *</Label>
                <Input type="number" step="0.01" value={formPreco} onChange={(e) => setFormPreco(e.target.value)} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label>Categoria *</Label>
                <Select value={formCategoria} onValueChange={setFormCategoria}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Imagem</Label>
              <div className="flex gap-2 items-center">
                <Input 
                  type="file" 
                  accept="image/*"
                  onChange={handleUploadImagem}
                  disabled={uploadingImage}
                  className="flex-1"
                />
                {uploadingImage && <Loader2 className="h-4 w-4 animate-spin" />}
              </div>
              {formImagem && (
                <div className="relative w-20 h-20 border rounded overflow-hidden">
                  <img src={formImagem} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => setFormImagem("")}
                    className="absolute top-0 right-0 bg-red-500 text-white text-xs p-1 rounded-bl"
                  >
                    X
                  </button>
                </div>
              )}
              <p className="text-xs text-muted-foreground">Maximo 4MB. JPG, PNG ou WebP.</p>
            </div>
            <Button onClick={salvarProduto} className="w-full" disabled={salvando || uploadingImage}>
              {salvando ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editandoProduto ? "Salvar Alterações" : "Adicionar Produto"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Maionese */}
      <Dialog open={dialogMaionese} onOpenChange={setDialogMaionese}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editandoMaionese ? "Editar Maionese" : "Nova Maionese"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input value={formNome} onChange={(e) => setFormNome(e.target.value)} placeholder="Ex: Maionese de Bacon" />
            </div>
            <div className="space-y-2">
              <Label>Preço (0 = Grátis)</Label>
              <Input type="number" step="0.01" value={formPreco} onChange={(e) => setFormPreco(e.target.value)} placeholder="0.00" />
            </div>
            <Button onClick={salvarMaionese} className="w-full" disabled={salvando}>
              {salvando ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editandoMaionese ? "Salvar Alterações" : "Adicionar Maionese"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Adicional */}
      <Dialog open={dialogAdicional} onOpenChange={setDialogAdicional}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editandoAdicional ? "Editar Adicional" : "Novo Adicional"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input value={formNome} onChange={(e) => setFormNome(e.target.value)} placeholder="Ex: Bacon" />
            </div>
            <div className="space-y-2">
              <Label>Preço *</Label>
              <Input type="number" step="0.01" value={formPreco} onChange={(e) => setFormPreco(e.target.value)} placeholder="0.00" />
            </div>
            <Button onClick={salvarAdicional} className="w-full" disabled={salvando}>
              {salvando ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editandoAdicional ? "Salvar Alterações" : "Adicionar Adicional"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
