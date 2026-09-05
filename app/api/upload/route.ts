import { put } from "@vercel/blob"
import { NextResponse } from "next/server"

const TIPOS_PERMITIDOS = ["image/png", "image/jpeg", "image/webp"]
const TAMANHO_MAXIMO = 5 * 1024 * 1024 // 5MB

export async function POST(request: Request) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: "BLOB_READ_WRITE_TOKEN não configurado no servidor" },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 })
    }

    if (!TIPOS_PERMITIDOS.includes(file.type)) {
      return NextResponse.json(
        { error: "Formato inválido. Use PNG, JPEG ou WEBP." },
        { status: 400 }
      )
    }

    if (file.size > TAMANHO_MAXIMO) {
      return NextResponse.json(
        { error: "Arquivo muito grande. Máximo 5MB." },
        { status: 400 }
      )
    }

    const blob = await put(file.name, file, {
      access: "public",
      addRandomSuffix: true,
    })

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error("[API] Erro no upload:", error)
    return NextResponse.json({ error: "Erro ao fazer upload" }, { status: 500 })
  }
}
