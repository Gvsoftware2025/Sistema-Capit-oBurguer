"use client"

import { useState } from "react"
import useSWR from "swr"
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import type { DbProduct } from "@/lib/db-types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())
type Option = { id: number; product_id: number; product_name: string; option_group: string; option_name: string; display_order: number; is_available: boolean; is_required: boolean }

export function OpcoesTab() {
  const { data: optionsData, mutate } = useSWR("/api/cardapio/product-options", fetcher)
  const { data: productsData } = useSWR("/api/cardapio/produtos", fetcher)
  const options: Option[] = optionsData?.options || []
  const products: DbProduct[] = productsData?.produtos || []
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Option | null>(null)
  const [form, setForm] = useState({ product_id: "", option_group: "", option_name: "", is_required: true, is_available: true })
  const [saving, setSaving] = useState(false)

  const edit = (option?: Option) => {
    setEditing(option || null)
    setForm(option ? { product_id: String(option.product_id), option_group: option.option_group, option_name: option.option_name, is_required: option.is_required ?? true, is_available: option.is_available } : { product_id: "", option_group: "", option_name: "", is_required: true, is_available: true })
    setOpen(true)
  }

  const save = async () => {
    if (!form.product_id || !form.option_group.trim() || !form.option_name.trim()) { toast.error("Preencha produto, grupo e opção"); return }
    setSaving(true)
    try {
      const response = await fetch(editing ? `/api/cardapio/product-options/${editing.id}` : "/api/cardapio/product-options", { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, product_id: Number(form.product_id) }) })
      if (!response.ok) throw new Error()
      toast.success(editing ? "Opção atualizada" : "Opção criada")
      setOpen(false); mutate()
    } catch { toast.error("Não foi possível salvar a opção") } finally { setSaving(false) }
  }

  const remove = async (option: Option) => {
    if (!confirm(`Excluir ${option.option_name} de ${option.product_name}?`)) return
    const response = await fetch(`/api/cardapio/product-options/${option.id}`, { method: "DELETE" })
    if (response.ok) { toast.success("Opção excluída"); mutate() } else toast.error("Não foi possível excluir")
  }

  return <div className="space-y-4">
    <div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">Edite grupos, opções e obrigatoriedade de cada produto.</p><Button onClick={() => edit()}><Plus className="mr-2 h-4 w-4" />Nova opção</Button></div>
    <div className="rounded-lg border border-border overflow-hidden"><div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-border bg-card/50"><th className="p-3 text-left">Produto</th><th className="p-3 text-left">Grupo</th><th className="p-3 text-left">Opção</th><th className="p-3 text-center">Obrigatória</th><th className="p-3 text-right">Ações</th></tr></thead><tbody>{options.map((option) => <tr key={option.id} className="border-b border-border/50"><td className="p-3">{option.product_name}</td><td className="p-3">{option.option_group}</td><td className="p-3">{option.option_name}</td><td className="p-3 text-center"><Switch checked={option.is_required ?? true} onCheckedChange={(checked) => fetch(`/api/cardapio/product-options/${option.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...option, is_required: checked }) }).then(() => mutate())} /></td><td className="p-3 text-right"><Button variant="ghost" size="icon" onClick={() => edit(option)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => remove(option)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button></td></tr>)}</tbody></table></div></div>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? "Editar opção" : "Nova opção"}</DialogTitle></DialogHeader><div className="space-y-4 py-4"><div><Label>Produto</Label><Select value={form.product_id} onValueChange={(v) => setForm({ ...form, product_id: v })}><SelectTrigger><SelectValue placeholder="Selecione o produto" /></SelectTrigger><SelectContent>{products.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}</SelectContent></Select></div><div><Label>Grupo</Label><Input value={form.option_group} onChange={(e) => setForm({ ...form, option_group: e.target.value })} placeholder="Ex.: KIBE" /></div><div><Label>Nome da opção</Label><Input value={form.option_name} onChange={(e) => setForm({ ...form, option_name: e.target.value })} placeholder="Ex.: Tradicional" /></div><div className="flex items-center justify-between"><Label>Obrigatória</Label><Switch checked={form.is_required} onCheckedChange={(v) => setForm({ ...form, is_required: v })} /></div><div className="flex items-center justify-between"><Label>Disponível</Label><Switch checked={form.is_available} onCheckedChange={(v) => setForm({ ...form, is_available: v })} /></div></div><DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button onClick={save} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Salvar</Button></DialogFooter></DialogContent></Dialog>
  </div>
}
