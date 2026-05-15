import { list } from '@vercel/blob'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { blobs } = await list({
      prefix: 'instalador/',
    })

    const installer = blobs.find(b => b.pathname.includes('CapitaoBurguer'))

    if (!installer) {
      return NextResponse.json({ 
        available: false,
        url: null 
      })
    }

    return NextResponse.json({ 
      available: true,
      url: installer.url,
      size: installer.size,
      uploadedAt: installer.uploadedAt
    })
  } catch (error) {
    console.error('Erro ao buscar instalador:', error)
    return NextResponse.json({ 
      available: false,
      url: null 
    })
  }
}
