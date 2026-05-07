"use client"

import { CATEGORIAS } from "@/lib/produtos"
import type { CategoriaId } from "@/lib/types"

export function CategoriaPills({
  ativa,
  onSelect,
}: {
  ativa: CategoriaId
  onSelect: (id: CategoriaId) => void
}) {
  return (
    <div className="scrollbar-thin -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <div className="flex w-max min-w-full gap-2 pb-2">
        {CATEGORIAS.map((cat) => {
          const ativo = ativa === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={`whitespace-nowrap rounded-md border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                ativo
                  ? "border-primary bg-primary text-primary-foreground shadow-[0_0_20px_oklch(0.78_0.16_75/0.5)]"
                  : "border-border/60 bg-card/40 text-foreground/70 hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {cat.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
