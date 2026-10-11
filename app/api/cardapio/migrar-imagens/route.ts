import { NextResponse } from "next/server"
import { query, SCHEMA } from "@/lib/db"
import type { DbProduct } from "@/lib/db-types"

export const dynamic = "force-dynamic"

const BLOB_BASE = "https://tqvc0txhgin71c7p.public.blob.vercel-storage.com"

/**
 * Normaliza produtos cujo image_url ainda aponta para o caminho local /images/nome.jpg,
 * trocando o prefixo pela URL pública do Vercel Blob e mantendo o nome do arquivo
 * idêntico (respeitando maiúsculas/minúsculas). Idempotente: rodar de novo não altera
 * produtos já migrados.
 */
export async function POST() {
  try {
    const produtos = await query<DbProduct>(
      `SELECT id, name, image_url FROM ${SCHEMA}.products WHERE image_url LIKE '/images/%'`
    )

    const atualizados: { id: number; name: string; de: string; para: string }[] = []

    for (const p of produtos) {
      if (!p.image_url) continue
      const arquivo = p.image_url.replace(/^\/images\//, "")
      const novaUrl = `${BLOB_BASE}/${arquivo}`

      await query(`UPDATE ${SCHEMA}.products SET image_url = $1 WHERE id = $2`, [
        novaUrl,
        p.id,
      ])

      atualizados.push({ id: p.id, name: p.name, de: p.image_url, para: novaUrl })
    }

    return NextResponse.json({ total: atualizados.length, atualizados })
  } catch (error) {
    console.error("[API] Erro ao migrar imagens:", error)
    return NextResponse.json({ error: "Erro ao migrar imagens" }, { status: 500 })
  }
}
