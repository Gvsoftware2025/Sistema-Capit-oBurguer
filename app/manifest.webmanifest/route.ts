import { NextResponse } from "next/server"

export async function GET() {
  const manifest = {
    name: "Capitão Burguer",
    short_name: "Capitão Burguer",
    description: "Sistema de gestão de pedidos",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#0c0a09",
    theme_color: "#ca8a04",
    orientation: "portrait-primary",
    categories: ["business", "food"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    prefer_related_applications: false,
  }

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
    },
  })
}
