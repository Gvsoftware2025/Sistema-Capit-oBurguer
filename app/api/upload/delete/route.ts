import { del } from "@vercel/blob"
import { NextResponse } from "next/server"

const BLOB_HOST = "public.blob.vercel-storage.com"

export async function DELETE(request: Request) {
  try {
    const { url } = await request.json()

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL não informada" }, { status: 400 })
    }

    // Só apaga imagens hospedadas no Vercel Blob
    if (!url.includes(BLOB_HOST)) {
      return NextResponse.json({ success: true, skipped: true })
    }

    await del(url)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API] Erro ao apagar imagem do Blob:", error)
    return NextResponse.json({ error: "Erro ao apagar imagem" }, { status: 500 })
  }
}
