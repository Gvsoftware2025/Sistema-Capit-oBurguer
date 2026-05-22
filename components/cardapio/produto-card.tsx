"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Plus, Loader2, Check, X } from "lucide-react"
import type { Produto } from "@/lib/types"
import { useCarrinho } from "@/hooks/use-carrinho"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type ProductOption = {
  id: number
  product_id: number
  option_group: string
  option_name: string
  is_available: boolean
}

export function ProdutoCard({ produto }: { produto: Produto }) {
  const { adicionar } = useCarrinho()
  const [modalAberto, setModalAberto] = useState(false)
  const [opcoes, setOpcoes] = useState<ProductOption[]>([])
  const [loadingOpcoes, setLoadingOpcoes] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState<{ [group: string]: string }>({})
  const [quantidade, setQuantidade] = useState(1)

  const handleAdd = async () => {
    // Verificar se o produto tem opcoes especiais
    setLoadingOpcoes(true)
    try {
      const res = await fetch(`/api/cardapio/product-options?product_id=${produto.id}`)
      const data = await res.json()
      
      if (data.options && data.options.length > 0) {
        setOpcoes(data.options)
        setSelectedOptions({})
        setQuantidade(1)
        setModalAberto(true)
      } else {
        // Produto sem opcoes especiais, adiciona direto
        adicionar(produto)
        toast.success(`${produto.nome} adicionado`, {
          description: `R$ ${produto.preco.toFixed(2)}`,
        })
      }
    } catch {
      // Se der erro, adiciona direto
      adicionar(produto)
      toast.success(`${produto.nome} adicionado`, {
        description: `R$ ${produto.preco.toFixed(2)}`,
      })
    } finally {
      setLoadingOpcoes(false)
    }
  }

  const grupos = Array.from(new Set(opcoes.map(o => o.option_group)))
  const todosGruposSelecionados = grupos.every(g => selectedOptions[g])

  const confirmarAdicao = () => {
    if (!todosGruposSelecionados) {
      toast.error("Selecione todas as opcoes obrigatorias")
      return
    }

    const acompanhamentos = Object.entries(selectedOptions)
      .map(([group, option]) => `${group}: ${option}`)
      .join(", ")

    adicionar(produto, quantidade, acompanhamentos)
    toast.success(`${produto.nome} adicionado`, {
      description: acompanhamentos,
    })
    setModalAberto(false)
  }

  return (
    <>
      <article className="group flex flex-col overflow-hidden rounded-lg border border-border/60 bg-card/70 backdrop-blur-sm transition-all hover:border-primary/50 hover:shadow-[0_0_25px_oklch(0.78_0.16_75/0.2)]">
        <div className="relative aspect-square w-full overflow-hidden bg-secondary">
          <span className="absolute left-2 top-2 z-10 text-[9px] font-medium tracking-wider text-foreground/50">
            Img. ilustrativa
          </span>
          <div className="absolute inset-x-0 top-0 z-[5] bg-gradient-to-b from-background/80 to-transparent pb-6 pt-2 text-center">
            <h3 className="font-serif text-sm font-bold tracking-wide text-foreground sm:text-base">
              {produto.nomeExibicao}
            </h3>
          </div>
          <Image
            src={produto.imagem || "/placeholder.svg"}
            alt={produto.nome}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute bottom-2 right-2 z-10 rounded-full bg-destructive px-3 py-1 text-xs font-bold text-destructive-foreground shadow-lg">
            R$ {produto.preco.toFixed(2)}
          </div>
          <button
            onClick={handleAdd}
            disabled={loadingOpcoes}
            aria-label={`Adicionar ${produto.nome} ao carrinho`}
            className="absolute bottom-2 left-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:scale-110 hover:shadow-[0_0_20px_oklch(0.78_0.16_75/0.7)] disabled:opacity-50"
          >
            {loadingOpcoes ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Plus className="h-5 w-5" />
            )}
          </button>
        </div>

        <div className="flex flex-col gap-1 p-3">
          <h4 className="font-serif text-sm font-bold uppercase tracking-wide text-primary">
            {produto.nome}
          </h4>
          <p className="line-clamp-2 text-xs text-muted-foreground italic">
            {produto.descricao}
          </p>
        </div>
      </article>

      {/* Modal de Opcoes Especiais */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-md bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-primary">
              {produto.nome}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">{produto.descricao}</p>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {grupos.map(group => {
              const groupOptions = opcoes.filter(o => o.option_group === group)
              return (
                <div key={group}>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    {group}: <span className="text-red-500">* Obrigatorio</span>
                  </label>
                  <div className="space-y-2">
                    {groupOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setSelectedOptions({ ...selectedOptions, [group]: opt.option_name })}
                        className={cn(
                          "w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all",
                          selectedOptions[group] === opt.option_name
                            ? "border-primary bg-primary/10 shadow-md"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                            selectedOptions[group] === opt.option_name
                              ? "border-primary bg-primary"
                              : "border-muted-foreground"
                          )}>
                            {selectedOptions[group] === opt.option_name && (
                              <Check className="h-3 w-3 text-primary-foreground" />
                            )}
                          </div>
                          <span className="font-medium">{opt.option_name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}

            {/* Quantidade */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Quantidade
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
                  className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center font-bold text-lg hover:bg-secondary/80"
                >
                  -
                </button>
                <span className="text-xl font-bold min-w-[40px] text-center">{quantidade}</span>
                <button
                  onClick={() => setQuantidade(quantidade + 1)}
                  className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg hover:bg-primary/90"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setModalAberto(false)}
              className="flex-1 py-3 rounded-xl border border-border hover:bg-secondary transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={confirmarAdicao}
              disabled={!todosGruposSelecionados}
              className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Adicionar R$ {(produto.preco * quantidade).toFixed(2)}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
