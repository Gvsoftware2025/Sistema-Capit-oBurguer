"use client"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Loader2, Search, Upload, X } from "lucide-react"
import { useRef } from "react"
import { cn } from "@/lib/utils"
import type { DbProduct, DbCategory } from "@/lib/db-types"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function ProdutosTab() {
  const { data: produtosData, mutate, isLoading } = useSWR("/api/cardapio/produtos", fetcher)
  const { data: categoriasData } = useSWR("/api/cardapio/categorias", fetcher)
  
  const produtos: DbProduct[] = produtosData?.produtos || []
  const categorias: DbCategory[] = categoriasData?.categorias || []

  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState<DbProduct | null>(null)
  const [excluindo, setExcluindo] = useState<DbProduct | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [busca, setBusca] = useState("")
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas")

  const [form, setForm] = useState({
    category_id: "",
    name: "",
    description: "",
    price: "",
    image_url: "",
    is_available: true,
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tamanho (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo 2MB.")
      return
    }

    // Validar tipo
    if (!file.type.startsWith("image/")) {
      toast.error("Arquivo deve ser uma imagem")
      return
    }

    setUploadingImage(true)

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      setForm({ ...form, image_url: base64 })
      setUploadingImage(false)
    }
    reader.onerror = () => {
      toast.error("Erro ao carregar imagem")
      setUploadingImage(false)
    }
    reader.readAsDataURL(file)
  }

  const removerImagem = () => {
    setForm({ ...form, image_url: "" })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const produtosFiltrados = produtos.filter((p) => {
    const matchBusca = p.name.toLowerCase().includes(busca.toLowerCase())
    const matchCategoria = filtroCategoria === "todas" || p.category_id.toString() === filtroCategoria
    return matchBusca && matchCategoria
  })

  const abrirCriar = () => {
    setEditando(null)
    setForm({ category_id: "", name: "", description: "", price: "", image_url: "", is_available: true })
    setModalAberto(true)
  }

  const abrirEditar = (prod: DbProduct) => {
    setEditando(prod)
    setForm({
      category_id: prod.category_id.toString(),
      name: prod.name,
      description: prod.description || "",
      price: prod.price.toString(),
      image_url: prod.image_url || "",
      is_available: prod.is_available,
    })
    setModalAberto(true)
  }

  const salvar = async () => {
    if (!form.name.trim() || !form.category_id || !form.price) {
      toast.error("Preencha todos os campos obrigatórios")
      return
    }

    setSalvando(true)
    try {
      const payload = {
        ...form,
        category_id: parseInt(form.category_id),
        price: parseFloat(form.price),
      }

      if (editando) {
        await fetch(`/api/cardapio/produtos/${editando.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        toast.success("Produto atualizado")
      } else {
        await fetch("/api/cardapio/produtos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        toast.success("Produto criado")
      }
      setModalAberto(false)
      mutate()
    } catch {
      toast.error("Erro ao salvar")
    } finally {
      setSalvando(false)
    }
  }

  const excluir = async () => {
    if (!excluindo) return
    try {
      await fetch(`/api/cardapio/produtos/${excluindo.id}`, { method: "DELETE" })
      toast.success("Produto excluído")
      setExcluindo(null)
      mutate()
    } catch {
      toast.error("Erro ao excluir")
    }
  }

  const toggleDisponivel = async (prod: DbProduct) => {
    try {
      await fetch(`/api/cardapio/produtos/${prod.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...prod,
          is_available: !prod.is_available,
        }),
      })
      mutate()
    } catch {
      toast.error("Erro ao atualizar")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produto..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              {categorias.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={abrirCriar} className="gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        {produtosFiltrados.length} produto(s) encontrado(s)
      </p>

      {/* Tabela */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-card/50">
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground w-16">Imagem</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Produto</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground hidden md:table-cell">Categoria</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Preço</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">Disponível</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtosFiltrados.map((prod) => (
                <tr key={prod.id} className="border-b border-border/50 hover:bg-card/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-card border border-border flex items-center justify-center">
                      {prod.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={prod.image_url}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-muted-foreground text-xs">Sem foto</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{prod.name}</p>
                      {prod.description && (
                        <p className="text-xs text-muted-foreground truncate max-w-xs">{prod.description}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-sm hidden md:table-cell">
                    {prod.category_name}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-primary">
                    R$ {Number(prod.price).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Switch
                      checked={prod.is_available}
                      onCheckedChange={() => toggleDisponivel(prod)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => abrirEditar(prod)} className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setExcluindo(prod)} className="h-8 w-8 text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {produtosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    Nenhum produto encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Criar/Editar */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editando ? "Editar Produto" : "Novo Produto"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Categoria *</Label>
              <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: X-Burguer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Ex: Pão, hambúrguer, queijo, salada"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Preço *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>Imagem do Produto</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              
              {form.image_url ? (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-border group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={removerImagem}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="w-32 h-32 rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {uploadingImage ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      <Upload className="h-6 w-6" />
                      <span className="text-xs text-center">Clique para enviar</span>
                    </>
                  )}
                </button>
              )}
              <p className="text-xs text-muted-foreground">PNG, JPG ou WEBP. Máximo 2MB.</p>
            </div>
            <div className="flex items-center justify-between">
              <Label>Disponível</Label>
              <Switch
                checked={form.is_available}
                onCheckedChange={(checked) => setForm({ ...form, is_available: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalAberto(false)}>Cancelar</Button>
            <Button onClick={salvar} disabled={salvando}>
              {salvando && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmação de exclusão */}
      <AlertDialog open={!!excluindo} onOpenChange={() => setExcluindo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{excluindo?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={excluir} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
