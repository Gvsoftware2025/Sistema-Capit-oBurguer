import type { Metadata, Viewport } from "next"
import { Inter, Cinzel } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Capitão Burguer — Sistema de Gestão",
  description:
    "Sistema de gestão de pedidos Capitão Burguer. Dashboard, pedidos em tempo real.",
}

export const viewport: Viewport = {
  themeColor: "#1a0f08",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`dark bg-background ${inter.variable} ${cinzel.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="font-sans antialiased min-h-screen bg-background text-foreground">
        {children}
        <Toaster theme="dark" richColors position="top-center" />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
