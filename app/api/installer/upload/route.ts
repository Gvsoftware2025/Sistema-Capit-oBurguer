import { put } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    // Verifica se e um arquivo executavel
    if (!file.name.endsWith('.exe') && !file.name.endsWith('.msi')) {
      return NextResponse.json({ error: 'Apenas arquivos .exe ou .msi sao permitidos' }, { status: 400 })
    }

    // Faz upload para o Blob com nome fixo para facilitar o download
    const blob = await put('instalador/CapitaoBurguer-Setup.exe', file, {
      access: 'public',
      addRandomSuffix: false,
    })

    return NextResponse.json({ 
      success: true,
      url: blob.url,
      filename: file.name,
      size: file.size
    })
  } catch (error) {
    console.error('Erro no upload:', error)
    return NextResponse.json({ error: 'Falha no upload' }, { status: 500 })
  }
}
