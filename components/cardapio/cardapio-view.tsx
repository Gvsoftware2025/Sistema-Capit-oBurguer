"use client"

import { useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Search, Clock, Loader2 } from "lucide-react"
import useSWR from "swr"
import type { CategoriaId } from "@/lib/types"
import { ProdutoCard } from "./produto-card"
import { CarrinhoDrawer } from "./carrinho-drawer"
import { getHorarioFuncionamento } from "@/lib/horario-funcionamento"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Categoria {
  id: number
  name: string
  slug: string
}

interface Produto {
  id: number
  name: string
  description: string
  price: string
  image_url: string
  category_id: number
  is_available: boolean
}

export function CardapioView() {
  const [categoriaAtiva, setCategoriaAtiva] = useState<number | null>(null)
  const [busca, setBusca] = useState("")
  const [horario, setHorario] = useState<ReturnType<typeof getHorarioFuncionamento> | null>(null)

  // Buscar dados do banco
  const { data: catData, isLoading: loadingCat } = useSWR("/api/cardapio/categorias", fetcher, { refreshInterval: 30000 })
  const { data: prodData, isLoading: loadingProd } = useSWR("/api/cardapio/produtos", fetcher, { refreshInterval: 30000 })

  const categorias: Categoria[] = catData?.categorias || []
  const produtos: Produto[] = (prodData?.produtos || []).filter((p: Produto) => p.is_available)

  // Selecionar primeira categoria quando carregar
  useEffect(() => {
    if (categorias.length > 0 && categoriaAtiva === null) {
      setCategoriaAtiva(categorias[0].id)
    }
  }, [categorias, categoriaAtiva])

  useEffect(() => {
    setHorario(getHorarioFuncionamento())
    const interval = setInterval(() => {
      setHorario(getHorarioFuncionamento())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const produtosFiltrados = useMemo(() => {
    const q = busca.trim().toLowerCase()
    return produtos.filter((p) => {
      if (q) {
        return (
          p.name.toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q)
        )
      }
      return p.category_id === categoriaAtiva
    })
  }, [categoriaAtiva, busca, produtos])

  const categoriaLabel = categorias.find((c) => c.id === categoriaAtiva)?.name ?? ""
  const isLoading = loadingCat || loadingProd

  // Converter para formato do ProdutoCard
  const produtosFormatados = produtosFiltrados.map((p) => {
    const cat = categorias.find(c => c.id === p.category_id)
    return {
      id: p.id.toString(),
      nome: p.name,
      nomeExibicao: p.name,
      descricao: p.description || "",
      preco: Number(p.price),
      imagem: p.image_url || "/placeholder.svg",
      categoria: (cat?.slug || "outros") as CategoriaId,
      disponivel: p.is_available,
    }
  })

  return (
    <main className="relative min-h-dvh">
      {/* Fundo */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: "url(/pirate-tavern-bg.jpg)" }}
        aria-hidden
      />
      <div className="fixed inset-0 -z-10 bg-background/85" aria-hidden />

      {/* Banner de Fechado */}
      {horario && !horario.estaAberto && (
        <div className="bg-red-600 text-white py-3 px-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <Clock className="h-5 w-5" />
            <span className="font-bold">ESTAMOS FECHADOS</span>
          </div>
          <p className="text-sm mt-1">
            Horario: {horario.isFimDeSemana ? "Sex-Dom" : "Seg-Qui"} das 18:00 as {horario.horaFechamento}
          </p>
          <p className="text-sm">{horario.proximaAbertura}</p>
        </div>
      )}

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
          <div className="scrollbar-thin -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <div className="flex w-max min-w-full gap-2 pb-2">
              {categorias.map((cat) => {
                const ativo = categoriaAtiva === cat.id
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategoriaAtiva(cat.id)}
                    className={`whitespace-nowrap rounded-md border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                      ativo
                        ? "border-primary bg-primary text-primary-foreground shadow-[0_0_20px_oklch(0.78_0.16_75/0.5)]"
                        : "border-border/60 bg-card/40 text-foreground/70 hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    {cat.name}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Grid de produtos */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-border/60 bg-card/40 py-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Carregando cardapio...</p>
          </div>
        ) : (
          <>
            {busca.trim() && (
              <p className="mb-3 text-sm text-muted-foreground">
                {produtosFormatados.length} resultado
                {produtosFormatados.length === 1 ? "" : "s"} para &quot;{busca}&quot;
              </p>
            )}

            {!busca.trim() && (
              <h2 className="sr-only">Categoria: {categoriaLabel}</h2>
            )}

            {produtosFormatados.length === 0 ? (
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
                {produtosFormatados.map((p) => (
                  <ProdutoCard key={p.id} produto={p} />
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  )
}
