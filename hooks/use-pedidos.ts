"use client"

import useSWR from "swr"
import type { Pedido } from "@/lib/types"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Erro ao buscar pedidos")
  return res.json() as Promise<{ pedidos: Pedido[] }>
}

export function usePedidos(filtro?: "ativos" | "finalizados") {
  const url = filtro ? `/api/pedidos?filtro=${filtro}` : "/api/pedidos"
  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    refreshInterval: 2000,
    revalidateOnFocus: true,
  })
  return {
    pedidos: data?.pedidos ?? [],
    isLoading,
    error,
    mutate,
  }
}
