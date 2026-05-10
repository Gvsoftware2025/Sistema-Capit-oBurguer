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
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react"
import type { DbCategory } from "@/lib/db-types"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function CategoriasTab() {
  const { data, mutate, isLoading } = useSWR("/api/cardapio/categorias", fetcher)
  const categorias: DbCategory[] = data?.categorias || []

  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState<DbCategory | null>(null)
  const [excluindo, setExcluindo] = useState<DbCategory | null>(null)
  const [salvando, setSalvando] = useState(false)

  const [form, setForm] = useState({
    name: "",
    description: "",
    is_active: true,
  })

  const abrirCriar = () => {
    setEditando(null)
    setForm({ name: "", description: "", is_active: true })
    setModalAberto(true)
  }

  const abrirEditar = (cat: DbCategory) => {
    setEditando(cat)
    setForm({
      name: cat.name,
      description: cat.description || "",
      is_active: cat.is_active,
    })
    setModalAberto(true)
  }

  const salvar = async () => {
    if (!form.name.trim()) {
      toast.error("Nome é obrigatório")
      return
    }

    setSalvando(true)
    try {
      if (editando) {
        await fetch(`/api/cardapio/categorias/${editando.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        })
        toast.success("Categoria atualizada")
      } else {
        await fetch("/api/cardapio/categorias", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        })
        toast.success("Categoria criada")
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
      await fetch(`/api/cardapio/categorias/${excluindo.id}`, {
        method: "DELETE",
      })
      toast.success("Categoria excluída")
      setExcluindo(null)
      mutate()
    } catch {
      toast.error("Erro ao excluir")
    }
  }

  const toggleAtivo = async (cat: DbCategory) => {
    try {
      await fetch(`/api/cardapio/categorias/${cat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cat.name,
          description: cat.description,
          is_active: !cat.is_active,
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
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          {categorias.length} categoria(s) cadastrada(s)
        </p>
        <Button onClick={abrirCriar} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      {/* Tabela */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-card/50">
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Nome</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground hidden sm:table-cell">Descrição</th>
              <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">Ativo</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((cat) => (
              <tr key={cat.id} className="border-b border-border/50 hover:bg-card/30 transition-colors">
                <td className="px-4 py-3 font-medium">{cat.name}</td>
                <td className="px-4 py-3 text-muted-foreground text-sm hidden sm:table-cell">
                  {cat.description || "-"}
                </td>
                <td className="px-4 py-3 text-center">
                  <Switch
                    checked={cat.is_active}
                    onCheckedChange={() => toggleAtivo(cat)}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => abrirEditar(cat)}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setExcluindo(cat)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {categorias.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  Nenhuma categoria cadastrada
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Criar/Editar */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editando ? "Editar Categoria" : "Nova Categoria"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Hambúrgueres"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Ex: Nossos hambúrgueres artesanais"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Ativo</Label>
              <Switch
                id="is_active"
                checked={form.is_active}
                onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalAberto(false)}>
              Cancelar
            </Button>
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
            <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a categoria "{excluindo?.name}"? Esta ação não pode ser desfeita.
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
