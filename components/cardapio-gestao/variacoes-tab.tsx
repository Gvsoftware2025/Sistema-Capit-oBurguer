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
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react"
import type { DbProductVariation, DbProduct } from "@/lib/db-types"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function VariacoesTab() {
  const { data: variacoesData, mutate, isLoading } = useSWR("/api/cardapio/variacoes", fetcher)
  const { data: produtosData } = useSWR("/api/cardapio/produtos", fetcher)
  
  const variacoes: DbProductVariation[] = variacoesData?.variacoes || []
  const produtos: DbProduct[] = produtosData?.produtos || []

  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState<DbProductVariation | null>(null)
  const [excluindo, setExcluindo] = useState<DbProductVariation | null>(null)
  const [salvando, setSalvando] = useState(false)

  const [form, setForm] = useState({
    product_id: "",
    name: "",
    price: "",
    is_available: true,
  })

  const abrirCriar = () => {
    setEditando(null)
    setForm({ product_id: "", name: "", price: "", is_available: true })
    setModalAberto(true)
  }

  const abrirEditar = (v: DbProductVariation) => {
    setEditando(v)
    setForm({
      product_id: v.product_id.toString(),
      name: v.name,
      price: v.price.toString(),
      is_available: v.is_available,
    })
    setModalAberto(true)
  }

  const salvar = async () => {
    if (!form.name.trim() || !form.product_id || !form.price) {
      toast.error("Preencha todos os campos obrigatórios")
      return
    }

    setSalvando(true)
    try {
      const payload = {
        ...form,
        product_id: parseInt(form.product_id),
        price: parseFloat(form.price),
      }

      if (editando) {
        await fetch(`/api/cardapio/variacoes/${editando.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        toast.success("Variação atualizada")
      } else {
        await fetch("/api/cardapio/variacoes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        toast.success("Variação criada")
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
      await fetch(`/api/cardapio/variacoes/${excluindo.id}`, { method: "DELETE" })
      toast.success("Variação excluída")
      setExcluindo(null)
      mutate()
    } catch {
      toast.error("Erro ao excluir")
    }
  }

  const toggleDisponivel = async (v: DbProductVariation) => {
    try {
      await fetch(`/api/cardapio/variacoes/${v.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: v.name,
          price: v.price,
          is_available: !v.is_available,
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
        <p className="text-muted-foreground">{variacoes.length} variação(ões)</p>
        <Button onClick={abrirCriar} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Variação
        </Button>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-card/50">
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Produto</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Tamanho</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Preço</th>
              <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">Disponível</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {variacoes.map((v) => (
              <tr key={v.id} className="border-b border-border/50 hover:bg-card/30 transition-colors">
                <td className="px-4 py-3 font-medium">{v.product_name}</td>
                <td className="px-4 py-3 text-muted-foreground">{v.name}</td>
                <td className="px-4 py-3 text-right font-medium text-primary">R$ {Number(v.price).toFixed(2)}</td>
                <td className="px-4 py-3 text-center">
                  <Switch checked={v.is_available} onCheckedChange={() => toggleDisponivel(v)} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => abrirEditar(v)} className="h-8 w-8">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setExcluindo(v)} className="h-8 w-8 text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {variacoes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Nenhuma variação cadastrada
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editando ? "Editar Variação" : "Nova Variação"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Produto *</Label>
              <Select value={form.product_id} onValueChange={(v) => setForm({ ...form, product_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o produto" />
                </SelectTrigger>
                <SelectContent>
                  {produtos.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Tamanho *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Grande"
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
            <AlertDialogTitle>Excluir variação?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{excluindo?.name}" de "{excluindo?.product_name}"?
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
