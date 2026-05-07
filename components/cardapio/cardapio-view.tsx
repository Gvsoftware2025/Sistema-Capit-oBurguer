"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Search } from "lucide-react"
import { CATEGORIAS, PRODUTOS } from "@/lib/produtos"
import type { CategoriaId } from "@/lib/types"
import { CategoriaPills } from "./categoria-pills"
import { ProdutoCard } from "./produto-card"
import { CarrinhoDrawer } from "./carrinho-drawer"

export function CardapioView() {
  const [categoria, setCategoria] = useState<CategoriaId>("burgueres")
  const [busca, setBusca] = useState("")

  const produtosFiltrados = useMemo(() => {
    const q = busca.trim().toLowerCase()
    return PRODUTOS.filter((p) => {
      if (q) {
        return (
          p.nome.toLowerCase().includes(q) ||
          p.nomeExibicao.toLowerCase().includes(q) ||
          p.descricao.toLowerCase().includes(q)
        )
      }
      return p.categoria === categoria
    })
  }, [categoria, busca])

  const categoriaLabel =
    CATEGORIAS.find((c) => c.id === categoria)?.label ?? ""

  return (
    <main className="relative min-h-dvh">
      {/* Fundo */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: "url(/pirate-tavern-bg.jpg)" }}
        aria-hidden
      />
      <div className="fixed inset-0 -z-10 bg-background/85" aria-hidden />

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link
            href="/"
            aria-label="Voltar"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-serif text-2xl font-bold tracking-wider text-glow-gold sm:text-3xl">
            Cardápio
          </h1>
          <CarrinhoDrawer />
        </div>
      </header>

      {/* Busca + categorias */}
      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Pesquisar item..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full rounded-md border border-border/60 bg-card/40 px-10 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="mt-3">
          <CategoriaPills ativa={categoria} onSelect={setCategoria} />
        </div>
      </section>

      {/* Grid de produtos */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        {busca.trim() && (
          <p className="mb-3 text-sm text-muted-foreground">
            {produtosFiltrados.length} resultado
            {produtosFiltrados.length === 1 ? "" : "s"} para &quot;{busca}&quot;
          </p>
        )}

        {!busca.trim() && (
          <h2 className="sr-only">Categoria: {categoriaLabel}</h2>
        )}

        {produtosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-border/60 bg-card/40 py-16 text-center">
            <p className="font-serif text-lg text-foreground/70">
              Nenhum item encontrado
            </p>
            <p className="text-sm text-muted-foreground">
              Tente outra categoria ou busca
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {produtosFiltrados.map((p) => (
              <ProdutoCard key={p.id} produto={p} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
