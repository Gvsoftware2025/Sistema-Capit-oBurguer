"use client"

import { useState } from "react"
import Image from "next/image"
import { ShoppingCart, Minus, Plus, Trash2, Send } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group"
import { useCarrinho } from "@/hooks/use-carrinho"
import { toast } from "sonner"
import type { TipoPedido } from "@/lib/types"

export function CarrinhoDrawer() {
  const { itens, total, totalItens, alterarQuantidade, remover, limpar } =
    useCarrinho()
  const [open, setOpen] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [cliente, setCliente] = useState("")
  const [telefone, setTelefone] = useState("")
  const [endereco, setEndereco] = useState("")
  const [tipo, setTipo] = useState<TipoPedido>("retirada")
  const [observacao, setObservacao] = useState("")

  const enviarPedido = async () => {
    if (!cliente.trim()) {
      toast.error("Informe seu nome, marujo!")
      return
    }
    if (itens.length === 0) {
      toast.error("Carrinho vazio")
      return
    }
    if (tipo === "entrega" && !endereco.trim()) {
      toast.error("Informe o endereço de entrega")
      return
    }

    setEnviando(true)
    try {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente: cliente.trim(),
          telefone: telefone.trim() || undefined,
          endereco: tipo === "entrega" ? endereco.trim() : undefined,
          tipo,
          origem: "cliente",
          observacao: observacao.trim() || undefined,
          itens: itens.map((i) => ({
            produtoId: i.produtoId,
            nome: i.nome,
            preco: i.preco,
            quantidade: i.quantidade,
          })),
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error ?? "Erro ao enviar pedido")
      }
      const { pedido } = await res.json()
      toast.success(`Pedido #${pedido.numero} enviado!`, {
        description: "A tripulação está preparando.",
      })
      limpar()
      setCliente("")
      setTelefone("")
      setEndereco("")
      setObservacao("")
      setOpen(false)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao enviar pedido"
      toast.error(msg)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          aria-label={`Abrir carrinho com ${totalItens} ${
            totalItens === 1 ? "item" : "itens"
          }`}
          className="relative flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
        >
          <ShoppingCart className="h-5 w-5" />
          {totalItens > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {totalItens}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 border-l border-border/60 bg-background/95 backdrop-blur-md sm:max-w-md"
      >
        <SheetHeader className="border-b border-border/60">
          <SheetTitle className="font-serif text-2xl text-glow-gold">
            Sua Comanda
          </SheetTitle>
          <SheetDescription>
            {totalItens === 0
              ? "Seu carrinho está vazio"
              : `${totalItens} ${totalItens === 1 ? "item" : "itens"}`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {itens.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">
                Adicione itens do cardápio para continuar
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {itens.map((item) => (
                <li
                  key={item.produtoId}
                  className="flex gap-3 rounded-md border border-border/60 bg-card/60 p-2"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-secondary">
                    <Image
                      src={item.imagem || "/placeholder.svg"}
                      alt={item.nome}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <p className="text-sm font-semibold leading-tight">
                      {item.nome}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      R$ {item.preco.toFixed(2)}
                    </p>
                    <div className="mt-auto flex items-center gap-2">
                      <button
                        onClick={() =>
                          alterarQuantidade(item.produtoId, item.quantidade - 1)
                        }
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-border/60 hover:border-primary/50"
                        aria-label="Diminuir"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="min-w-6 text-center text-sm font-semibold">
                        {item.quantidade}
                      </span>
                      <button
                        onClick={() =>
                          alterarQuantidade(item.produtoId, item.quantidade + 1)
                        }
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-border/60 hover:border-primary/50"
                        aria-label="Aumentar"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => remover(item.produtoId)}
                        className="ml-auto flex h-7 w-7 items-center justify-center rounded-md text-destructive hover:bg-destructive/10"
                        aria-label="Remover"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-primary">
                    R$ {(item.preco * item.quantidade).toFixed(2)}
                  </p>
                </li>
              ))}
            </ul>
          )}

          {itens.length > 0 && (
            <div className="mt-5 flex flex-col gap-3 border-t border-border/60 pt-4">
              <div>
                <Label htmlFor="cliente" className="text-xs uppercase tracking-wider text-muted-foreground">
                  Nome
                </Label>
                <Input
                  id="cliente"
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  placeholder="Seu nome"
                  className="mt-1 bg-input/40"
                />
              </div>
              <div>
                <Label htmlFor="telefone" className="text-xs uppercase tracking-wider text-muted-foreground">
                  Telefone (opcional)
                </Label>
                <Input
                  id="telefone"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(00) 00000-0000"
                  className="mt-1 bg-input/40"
                />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Tipo
                </Label>
                <RadioGroup
                  value={tipo}
                  onValueChange={(v) => setTipo(v as TipoPedido)}
                  className="mt-1 grid grid-cols-2 gap-2"
                >
                  {(["retirada", "entrega"] as const).map((t) => (
                    <Label
                      key={t}
                      className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm capitalize transition-colors ${
                        tipo === t
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/60"
                      }`}
                    >
                      <RadioGroupItem value={t} className="sr-only" />
                      {t}
                    </Label>
                  ))}
                </RadioGroup>
              </div>
              {tipo === "entrega" && (
                <div>
                  <Label htmlFor="endereco" className="text-xs uppercase tracking-wider text-muted-foreground">
                    Endereço
                  </Label>
                  <Input
                    id="endereco"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    placeholder="Rua, número, bairro"
                    className="mt-1 bg-input/40"
                  />
                </div>
              )}
              <div>
                <Label htmlFor="obs" className="text-xs uppercase tracking-wider text-muted-foreground">
                  Observação
                </Label>
                <Textarea
                  id="obs"
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  placeholder="Sem cebola, ponto da carne..."
                  rows={2}
                  className="mt-1 bg-input/40"
                />
              </div>
            </div>
          )}
        </div>

        {itens.length > 0 && (
          <SheetFooter className="border-t border-border/60 bg-card/50 sm:flex-col">
            <div className="flex w-full items-center justify-between">
              <span className="font-serif text-sm uppercase tracking-wider text-muted-foreground">
                Total
              </span>
              <span className="font-serif text-2xl font-bold text-glow-gold">
                R$ {total.toFixed(2)}
              </span>
            </div>
            <Button
              onClick={enviarPedido}
              disabled={enviando}
              size="lg"
              className="mt-2 w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Send className="h-4 w-4" />
              {enviando ? "Enviando..." : "Enviar Pedido"}
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
