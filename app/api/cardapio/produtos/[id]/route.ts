import { NextResponse } from "next/server"
import { del } from "@vercel/blob"
import { query, SCHEMA } from "@/lib/db"
import type { DbProduct } from "@/lib/db-types"

export const dynamic = "force-dynamic"

const BLOB_HOST = "public.blob.vercel-storage.com"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, subcategory, price, category_id, image_url, is_available } = body

    // Busca a imagem atual para decidir se é preciso apagar do Blob
    const [atual] = await query<DbProduct>(
      `SELECT image_url FROM ${SCHEMA}.products WHERE id = $1`,
      [id]
    )

    const [produto] = await query<DbProduct>(
      `UPDATE ${SCHEMA}.products 
       SET name = $1, description = $2, price = $3, category_id = $4, image_url = $5, is_available = $6, subcategory = $7
       WHERE id = $8
       RETURNING *`,
      [name, description || null, price, category_id, image_url || null, is_available ?? true, subcategory || null, id]
    )

    if (!produto) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
    }

    // Se a imagem mudou e a antiga estava no Blob, apaga o arquivo antigo
    const imagemAntiga = atual?.image_url
    if (
      imagemAntiga &&
      imagemAntiga !== (image_url || null) &&
      imagemAntiga.includes(BLOB_HOST)
    ) {
      try {
        await del(imagemAntiga)
      } catch (err) {
        console.error("[API] Falha ao apagar imagem antiga do Blob:", err)
      }
    }

    return NextResponse.json({ produto })
  } catch (error) {
    console.error("[API] Erro ao atualizar produto:", error)
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Recupera a imagem para apagar do Blob junto com o produto
    const [produto] = await query<DbProduct>(
      `SELECT image_url FROM ${SCHEMA}.products WHERE id = $1`,
      [id]
    )

    await query(`DELETE FROM ${SCHEMA}.products WHERE id = $1`, [id])

    if (produto?.image_url && produto.image_url.includes(BLOB_HOST)) {
      try {
        await del(produto.image_url)
      } catch (err) {
        console.error("[API] Falha ao apagar imagem do Blob:", err)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API] Erro ao excluir produto:", error)
    return NextResponse.json({ error: "Erro ao excluir" }, { status: 500 })
  }
}
