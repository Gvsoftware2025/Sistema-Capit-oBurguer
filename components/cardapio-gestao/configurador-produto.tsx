"use client"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react"
import type { DbProduct, DbProductOption, DbProductVariation } from "@/lib/db-types"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

type Props = { product: DbProduct; open: boolean; onOpenChange: (open: boolean) => void }

export function ConfiguradorProduto({ product, open, onOpenChange }: Props) {
  const { data: variationsData, mutate: mutateVariations } = useSWR<{
    variacoes: DbProductVariation[]
  }>(open ? `/api/cardapio/variacoes?product_id=${product.id}` : null, fetcher)
  const { data: optionsData, mutate: mutateOptions } = useSWR<{
    options: DbProductOption[]
  }>(open ? `/api/cardapio/product-options?product_id=${product.id}` : null, fetcher)
  const [saving, setSaving] = useState(false)
  const [variation, setVariation] = useState({ name: "", price: "" })
  const [option, setOption] = useState({ group: "", name: "", required: true })

  const variations = variationsData?.variacoes || []
  const options = optionsData?.options || []

  async function addVariation() {
    if (!variation.name.trim() || !variation.price) return toast.error("Informe nome e preço da variação")
    setSaving(true)
    try {
      const response = await fetch("/api/cardapio/variacoes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ product_id: product.id, name: variation.name.trim(), price: Number(variation.price), is_available: true }) })
      if (!response.ok) throw new Error()
      setVariation({ name: "", price: "" }); await mutateVariations(); toast.success("Variação adicionada")
    } catch { toast.error("Não foi possível adicionar a variação") } finally { setSaving(false) }
  }

  async function removeVariation(id: number) {
    await fetch(`/api/cardapio/variacoes/${id}`, { method: "DELETE" }); await mutateVariations(); toast.success("Variação removida")
  }

  async function addOption() {
    if (!option.group.trim() || !option.name.trim()) return toast.error("Informe grupo e opção")
    setSaving(true)
    try {
      const response = await fetch("/api/cardapio/product-options", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ product_id: product.id, option_group: option.group.trim(), option_name: option.name.trim(), is_required: option.required, is_available: true }) })
      if (!response.ok) throw new Error()
      setOption({ group: option.group, name: "", required: option.required }); await mutateOptions(); toast.success("Opção adicionada")
    } catch { toast.error("Não foi possível adicionar a opção") } finally { setSaving(false) }
  }

  async function updateOption(item: DbProductOption, patch: Partial<DbProductOption>) {
    await fetch(`/api/cardapio/product-options/${item.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...item, ...patch, product_id: product.id }) }); await mutateOptions()
  }

  async function removeOption(id: number) {
    await fetch(`/api/cardapio/product-options/${id}`, { method: "DELETE" }); await mutateOptions(); toast.success("Opção removida")
  }

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
      <DialogHeader><DialogTitle>Configurar opções — {product.name}</DialogTitle></DialogHeader>
      <Tabs defaultValue="tamanhos">
        <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="tamanhos">Meia / Inteira</TabsTrigger><TabsTrigger value="opcoes">Acréscimos e escolhas</TabsTrigger></TabsList>
        <TabsContent value="tamanhos" className="space-y-4 pt-4">
          <p className="text-sm text-muted-foreground">Cadastre qualquer tamanho ou porção e defina o preço.</p>
          <div className="flex gap-2"><Input placeholder="Ex.: Meia ou Inteira" value={variation.name} onChange={(e) => setVariation({ ...variation, name: e.target.value })} /><Input className="max-w-32" type="number" step="0.01" placeholder="Preço" value={variation.price} onChange={(e) => setVariation({ ...variation, price: e.target.value })} /><Button onClick={addVariation} disabled={saving}><Plus className="mr-1 h-4 w-4" />Adicionar</Button></div>
          <div className="space-y-2">{variations.map((item) => <div key={item.id} className="flex items-center gap-2 rounded-lg border p-3"><span className="flex-1 font-medium">{item.name}</span><span className="text-primary">R$ {Number(item.price).toFixed(2)}</span><Button variant="ghost" size="icon" onClick={() => removeVariation(item.id)} aria-label={`Excluir ${item.name}`}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>)}{!variations.length && <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">Nenhuma variação cadastrada.</p>}</div>
        </TabsContent>
        <TabsContent value="opcoes" className="space-y-4 pt-4">
          <p className="text-sm text-muted-foreground">Crie grupos como “BATATA COM” ou “KIBE”, escolha se são obrigatórios e remova o que não pertence ao produto.</p>
          <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto_auto]"><Input placeholder="Grupo: BATATA COM" value={option.group} onChange={(e) => setOption({ ...option, group: e.target.value })} /><Input placeholder="Opção: Catupiry" value={option.name} onChange={(e) => setOption({ ...option, name: e.target.value })} /><label className="flex items-center gap-2 text-sm"><Switch checked={option.required} onCheckedChange={(checked) => setOption({ ...option, required: checked })} />Obrigatório</label><Button onClick={addOption} disabled={saving}><Plus className="mr-1 h-4 w-4" />Adicionar</Button></div>
          <div className="space-y-2">{options.map((item) => <div key={item.id} className="flex items-center gap-2 rounded-lg border p-3"><div className="flex-1"><p className="font-medium">{item.option_name}</p><p className="text-xs text-muted-foreground">{item.option_group}</p></div><label className="flex items-center gap-2 text-xs"><Switch checked={item.is_required} onCheckedChange={(checked) => updateOption(item, { is_required: checked })} />Obrigatório</label><Button variant="ghost" size="icon" onClick={() => removeOption(item.id)} aria-label={`Excluir ${item.option_name}`}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>)}{!options.length && <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">Nenhuma opção cadastrada.</p>}</div>
        </TabsContent>
      </Tabs>
    </DialogContent>
  </Dialog>
}
