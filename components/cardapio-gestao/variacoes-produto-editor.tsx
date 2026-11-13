"use client"

import { useState } from "react"
import useSWR from "swr"
import { Loader2, Plus, Save, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { DbProductVariation } from "@/lib/db-types"

const fetcher = (url: string) => fetch(url, { cache: "no-store" }).then((response) => response.json())

type Props = { productId: number }

function VariationRow({ variation, refresh }: { variation: DbProductVariation; refresh: () => void }) {
  const [name, setName] = useState(variation.name)
  const [price, setPrice] = useState(String(variation.price))
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!name.trim() || !Number.isFinite(Number(price)) || Number(price) < 0) {
      toast.error("Informe o nome e um preço válido")
      return
    }
    setSaving(true)
    try {
      const response = await fetch(`/api/cardapio/variacoes/${variation.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ name: name.trim(), price: Number(price), is_available: variation.is_available }),
      })
      const result = await response.json()
      if (!response.ok || !result.variacao) throw new Error(result.error || "Falha ao salvar")
      setName(result.variacao.name)
      setPrice(String(result.variacao.price))
      await refresh()
      toast.success(`${result.variacao.name} salvo por R$ ${Number(result.variacao.price).toFixed(2)}`)
    } catch {
      toast.error("Não foi possível confirmar o salvamento. Tente novamente.")
    } finally {
      setSaving(false)
    }
  }

  async function toggleAvailability(available: boolean) {
    const response = await fetch(`/api/cardapio/variacoes/${variation.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ name, price: Number(price), is_available: available }),
    })
    if (!response.ok) return toast.error("Não foi possível atualizar a disponibilidade")
    refresh()
  }

  async function remove() {
    const response = await fetch(`/api/cardapio/variacoes/${variation.id}`, { method: "DELETE" })
    if (!response.ok) return toast.error("Não foi possível excluir esta porção")
    toast.success("Porção removida")
    refresh()
  }

  return (
    <div className="grid min-w-0 grid-cols-2 gap-3 rounded-lg border p-3 sm:grid-cols-[minmax(0,1fr)_9rem_auto_auto_auto] sm:items-end">
      <div className="min-w-0 space-y-1">
        <Label htmlFor={`variation-name-${variation.id}`} className="text-xs">Tamanho / nome completo</Label>
        <Input id={`variation-name-${variation.id}`} className="min-w-0" value={name} onChange={(event) => setName(event.target.value)} />
      </div>
      <div className="min-w-0 space-y-1">
        <Label htmlFor={`variation-price-${variation.id}`} className="text-xs">Preço (R$)</Label>
        <Input id={`variation-price-${variation.id}`} type="number" min="0" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} />
      </div>
      <label className="col-span-2 flex items-center gap-2 text-xs text-muted-foreground sm:col-span-1">
        <Switch checked={variation.is_available} onCheckedChange={toggleAvailability} /> Disponível
      </label>
      <Button type="button" variant="outline" size="sm" onClick={save} disabled={saving} aria-label={`Salvar ${name}`}>
        {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={remove} aria-label={`Excluir ${name}`}>
        <Trash2 className="size-4 text-destructive" />
      </Button>
    </div>
  )
}

export function VariacoesProdutoEditor({ productId }: Props) {
  const { data, mutate, isLoading } = useSWR<{ variacoes: DbProductVariation[] }>(
    `/api/cardapio/variacoes?product_id=${productId}`,
    fetcher,
  )
  const [newName, setNewName] = useState("")
  const [newPrice, setNewPrice] = useState("")
  const [adding, setAdding] = useState(false)
  const variations = data?.variacoes ?? []

  async function add() {
    if (!newName.trim() || !Number.isFinite(Number(newPrice)) || Number(newPrice) < 0 || newPrice === "") {
      toast.error("Informe o nome e o preço da nova porção")
      return
    }
    if (variations.some((item) => item.name.trim().toLocaleLowerCase("pt-BR") === newName.trim().toLocaleLowerCase("pt-BR"))) {
      toast.error("Esse tamanho já existe neste produto. Edite o preço na linha correspondente.")
      return
    }
    setAdding(true)
    try {
      const response = await fetch("/api/cardapio/variacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, name: newName.trim(), price: Number(newPrice), is_available: true }),
      })
      if (!response.ok) throw new Error()
      setNewName("")
      setNewPrice("")
      await mutate()
      toast.success("Porção adicionada ao produto")
    } catch {
      toast.error("Não foi possível adicionar a porção")
    } finally {
      setAdding(false)
    }
  }

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border p-4" aria-labelledby="portion-editor-title">
      <div>
        <h3 id="portion-editor-title" className="font-medium">Tamanhos e porções deste produto</h3>
        <p className="text-xs text-muted-foreground">Edite aqui os preços de Meia, Inteira e outras opções. Estes valores aparecem no pedido.</p>
      </div>
      {isLoading ? <div className="flex justify-center py-3"><Loader2 className="size-5 animate-spin" /></div> : (
        <div className="flex flex-col gap-2">
          {variations.map((variation) => <VariationRow key={variation.id} variation={variation} refresh={() => { void mutate() }} />)}
          {variations.length === 0 && <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">Este produto ainda não tem tamanhos ou porções.</p>}
        </div>
      )}
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_9rem_auto] sm:items-end">
        <div className="space-y-1"><Label htmlFor="new-portion-name" className="text-xs">Novo tamanho</Label><Input id="new-portion-name" placeholder="Ex.: Meia ou Inteira" value={newName} onChange={(event) => setNewName(event.target.value)} /></div>
        <div className="space-y-1"><Label htmlFor="new-portion-price" className="text-xs">Preço (R$)</Label><Input id="new-portion-price" type="number" min="0" step="0.01" placeholder="0,00" value={newPrice} onChange={(event) => setNewPrice(event.target.value)} /></div>
        <Button type="button" variant="secondary" onClick={add} disabled={adding}>
          {adding ? <Loader2 className="size-4 animate-spin" data-icon="inline-start" /> : <Plus className="size-4" data-icon="inline-start" />}
          Adicionar porção
        </Button>
      </div>
    </section>
  )
}
