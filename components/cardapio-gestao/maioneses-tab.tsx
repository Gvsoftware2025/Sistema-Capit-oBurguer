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
import type { DbMaionese } from "@/lib/db-types"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function MaionesesTab() {
  const { data, mutate, isLoading } = useSWR("/api/cardapio/maioneses", fetcher)
  const maioneses: DbMaionese[] = data?.maioneses || []

  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState<DbMaionese | null>(null)
  const [excluindo, setExcluindo] = useState<DbMaionese | null>(null)
  const [salvando, setSalvando] = useState(false)

  const [form, setForm] = useState({
    name: "",
    price: "",
    is_available: true,
  })

  const abrirCriar = () => {
    setEditando(null)
    setForm({ name: "", price: "", is_available: true })
    setModalAberto(true)
  }

  const abrirEditar = (m: DbMaionese) => {
    setEditando(m)
    setForm({
      name: m.name,
      price: m.price.toString(),
      is_available: m.is_available,
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
      }

      if (editando) {
        await fetch(`/api/cardapio/maioneses/${editando.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        toast.success("Maionese atualizada")
      } else {
        await fetch("/api/cardapio/maioneses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        toast.success("Maionese criada")
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
      await fetch(`/api/cardapio/maioneses/${excluindo.id}`, { method: "DELETE" })
      toast.success("Maionese excluída")
      setExcluindo(null)
      mutate()
    } catch {
      toast.error("Erro ao excluir")
    }
  }

  const toggleDisponivel = async (m: DbMaionese) => {
    try {
      await fetch(`/api/cardapio/maioneses/${m.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: m.name,
          price: m.price,
          is_available: !m.is_available,
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
        <p className="text-muted-foreground">{maioneses.length} maionese(s)</p>
        <Button onClick={abrirCriar} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Maionese
        </Button>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-card/50">
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Nome</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Preço</th>
              <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">Disponível</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {maioneses.map((m) => (
              <tr key={m.id} className="border-b border-border/50 hover:bg-card/30 transition-colors">
                <td className="px-4 py-3 font-medium">{m.name}</td>
                <td className="px-4 py-3 text-right font-medium text-primary">
                  {Number(m.price) > 0 ? `R$ ${Number(m.price).toFixed(2)}` : "Grátis"}
                </td>
                <td className="px-4 py-3 text-center">
                  <Switch checked={m.is_available} onCheckedChange={() => toggleDisponivel(m)} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => abrirEditar(m)} className="h-8 w-8">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setExcluindo(m)} className="h-8 w-8 text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {maioneses.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  Nenhuma maionese cadastrada
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editando ? "Editar Maionese" : "Nova Maionese"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Maionese da Casa"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Preço * (0 para grátis)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="0.00"
              />
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
            <AlertDialogTitle>Excluir maionese?</AlertDialogTitle>
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
