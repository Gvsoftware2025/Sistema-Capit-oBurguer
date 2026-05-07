"use client"

import Image from "next/image"
import { Plus } from "lucide-react"
import type { Produto } from "@/lib/types"
import { useCarrinho } from "@/hooks/use-carrinho"
import { toast } from "sonner"

export function ProdutoCard({ produto }: { produto: Produto }) {
  const { adicionar } = useCarrinho()

  const handleAdd = () => {
    adicionar(produto)
    toast.success(`${produto.nome} adicionado`, {
      description: `R$ ${produto.preco.toFixed(2)}`,
    })
  }

  return (
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
          aria-label={`Adicionar ${produto.nome} ao carrinho`}
          className="absolute bottom-2 left-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:scale-110 hover:shadow-[0_0_20px_oklch(0.78_0.16_75/0.7)]"
        >
          <Plus className="h-5 w-5" />
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
  )
}
