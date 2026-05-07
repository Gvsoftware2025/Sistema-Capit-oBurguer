"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { Produto } from "@/lib/types"

export type CarrinhoItem = {
  produtoId: string
  nome: string
  preco: number
  quantidade: number
  imagem: string
  observacao?: string
}

type CarrinhoContext = {
  itens: CarrinhoItem[]
  total: number
  totalItens: number
  adicionar: (produto: Produto, quantidade?: number) => void
  remover: (produtoId: string) => void
  alterarQuantidade: (produtoId: string, quantidade: number) => void
  limpar: () => void
}

const Ctx = createContext<CarrinhoContext | null>(null)

const STORAGE_KEY = "capitao-burguer-carrinho"

export function CarrinhoProvider({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<CarrinhoItem[]>([])
  const [hidratado, setHidratado] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setItens(JSON.parse(raw))
    } catch {}
    setHidratado(true)
  }, [])

  useEffect(() => {
    if (!hidratado) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(itens))
    } catch {}
  }, [itens, hidratado])

  const adicionar = useCallback((produto: Produto, quantidade = 1) => {
    setItens((prev) => {
      const existe = prev.find((i) => i.produtoId === produto.id)
      if (existe) {
        return prev.map((i) =>
          i.produtoId === produto.id
            ? { ...i, quantidade: i.quantidade + quantidade }
            : i,
        )
      }
      return [
        ...prev,
        {
          produtoId: produto.id,
          nome: produto.nome,
          preco: produto.preco,
          quantidade,
          imagem: produto.imagem,
        },
      ]
    })
  }, [])

  const remover = useCallback((produtoId: string) => {
    setItens((prev) => prev.filter((i) => i.produtoId !== produtoId))
  }, [])

  const alterarQuantidade = useCallback(
    (produtoId: string, quantidade: number) => {
      setItens((prev) =>
        quantidade <= 0
          ? prev.filter((i) => i.produtoId !== produtoId)
          : prev.map((i) =>
              i.produtoId === produtoId ? { ...i, quantidade } : i,
            ),
      )
    },
    [],
  )

  const limpar = useCallback(() => setItens([]), [])

  const total = useMemo(
    () => itens.reduce((acc, i) => acc + i.preco * i.quantidade, 0),
    [itens],
  )
  const totalItens = useMemo(
    () => itens.reduce((acc, i) => acc + i.quantidade, 0),
    [itens],
  )

  return (
    <Ctx.Provider
      value={{ itens, total, totalItens, adicionar, remover, alterarQuantidade, limpar }}
    >
      {children}
    </Ctx.Provider>
  )
}

export function useCarrinho() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useCarrinho deve ser usado dentro de CarrinhoProvider")
  return ctx
}
