import { NextResponse } from 'next/server'

export async function GET() {
  const manifest = {
    name: "Capitão Burguer",
    short_name: "Capitão Burguer",
    description: "Sistema de gestão de pedidos Capitão Burguer",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0c0a09",
    theme_color: "#0c0a09",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ]
  }

  return new NextResponse(JSON.stringify(manifest, null, 2), {
    headers: {
      'Content-Type': 'application/manifest+json',
    },
  })
}
