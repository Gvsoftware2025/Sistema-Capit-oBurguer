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
import type { DbAddon } from "@/lib/db-types"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function AdicionaisTab() {
  const { data, mutate, isLoading } = useSWR("/api/cardapio/adicionais", fetcher)
  const adicionais: DbAddon[] = data?.adicionais || []

  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState<DbAddon | null>(null)
  const [excluindo, setExcluindo] = useState<DbAddon | null>(null)
  const [salvando, setSalvando] = useState(false)

  const [form, setForm] = useState({
    name: "",
    price: "",
    max_quantity: "10",
    is_available: true,
  })

  const abrirCriar = () => {
    setEditando(null)
    setForm({ name: "", price: "", max_quantity: "10", is_available: true })
    setModalAberto(true)
  }

  const abrirEditar = (a: DbAddon) => {
    setEditando(a)
    setForm({
      name: a.name,
      price: a.price.toString(),
      max_quantity: a.max_quantity.toString(),
      is_available: a.is_available,
    })
    setModalAberto(true)
  }

  const salvar = async () => {
    if (!form.name.trim() || !form.price) {
      toast.error("Preencha todos os campos obrigatórios")
      return
    }

    setSalvando(true)
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        max_quantity: parseInt(form.max_quantity) || 10,
      }

      if (editando) {
        await fetch(`/api/cardapio/adicionais/${editando.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        toast.success("Adicional atualizado")
      } else {
        await fetch("/api/cardapio/adicionais", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        toast.success("Adicional criado")
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
      await fetch(`/api/cardapio/adicionais/${excluindo.id}`, { method: "DELETE" })
      toast.success("Adicional excluído")
      setExcluindo(null)
      mutate()
    } catch {
      toast.error("Erro ao excluir")
    }
  }

  const toggleDisponivel = async (a: DbAddon) => {
    try {
      await fetch(`/api/cardapio/adicionais/${a.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: a.name,
          price: a.price,
          max_quantity: a.max_quantity,
          is_available: !a.is_available,
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
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">{adicionais.length} adicional(is)</p>
        <Button onClick={abrirCriar} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Adicional
        </Button>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-card/50">
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Nome</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Preço</th>
              <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground hidden sm:table-cell">Max</th>
              <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">Disponível</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {adicionais.map((a) => (
              <tr key={a.id} className="border-b border-border/50 hover:bg-card/30 transition-colors">
                <td className="px-4 py-3 font-medium">{a.name}</td>
                <td className="px-4 py-3 text-right font-medium text-primary">
                  R$ {Number(a.price).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-center text-muted-foreground hidden sm:table-cell">
                  {a.max_quantity}x
                </td>
                <td className="px-4 py-3 text-center">
                  <Switch checked={a.is_available} onCheckedChange={() => toggleDisponivel(a)} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => abrirEditar(a)} className="h-8 w-8">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setExcluindo(a)} className="h-8 w-8 text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {adicionais.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Nenhum adicional cadastrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editando ? "Editar Adicional" : "Novo Adicional"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Bacon Extra"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="max_quantity">Qtd Máxima</Label>
                <Input
                  id="max_quantity"
                  type="number"
                  value={form.max_quantity}
                  onChange={(e) => setForm({ ...form, max_quantity: e.target.value })}
                  placeholder="10"
                />
              </div>
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

      <AlertDialog open={!!excluindo} onOpenChange={() => setExcluindo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir adicional?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{excluindo?.name}"?
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
