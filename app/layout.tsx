import type { Metadata, Viewport } from "next"
import { Inter, Cinzel } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/sonner"
import { InstallAppButton } from "@/components/install-app-button"
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
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
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
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.pwaInstallPrompt = null;
              window.addEventListener('beforeinstallprompt', function(e) {
                e.preventDefault();
                window.pwaInstallPrompt = e;
              });
              if ('serviceWorker' in navigator && window.location.hostname.includes('vercel.app')) {
                navigator.serviceWorker.register('/sw.js');
              }
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased min-h-screen bg-background text-foreground">
        {children}
        <InstallAppButton />
        <Toaster theme="dark" richColors position="top-center" />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
