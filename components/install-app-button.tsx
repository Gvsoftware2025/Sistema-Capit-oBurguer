"use client"

import { useState, useEffect } from "react"
import { Download, X } from "lucide-react"

declare global {
  interface Window {
    pwaInstallPrompt: any
    __TAURI__: any
  }
}

export function InstallAppButton() {
  const [showButton, setShowButton] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Se esta rodando no Tauri (app desktop), nao mostra o botao
    if (typeof window !== 'undefined' && window.__TAURI__) {
      setIsInstalled(true)
      return
    }

    // Verifica se ja esta instalado (modo standalone/PWA)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Verifica se ja foi dispensado nesta sessao
    if (sessionStorage.getItem('pwa-dismissed')) {
      setDismissed(true)
      return
    }

    // Mostra o botao apos 2 segundos
    const timer = setTimeout(() => {
      setShowButton(true)
    }, 2000)

    // Escuta o evento de instalacao PWA
    const handler = (e: Event) => {
      e.preventDefault()
      window.pwaInstallPrompt = e
    }
    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = () => {
    // Abre a pagina de download do instalador
    window.open('https://github.com/Gvsoftware2025/Sistema-Capit-oBurguer/releases', '_blank')
  }

  const handleDismiss = () => {
    setShowButton(false)
    setDismissed(true)
    sessionStorage.setItem('pwa-dismissed', 'true')
  }

  if (isInstalled || !showButton || dismissed) return null

  return (
    <div className="fixed bottom-6 right-6 z-[9999] animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-3 bg-yellow-600 text-black rounded-xl px-4 py-3 shadow-2xl">
        <Download className="h-5 w-5" />
        <div>
          <p className="font-bold text-sm">Instalar App Desktop</p>
          <p className="text-xs opacity-80">Baixar instalador .exe</p>
        </div>
        <button
          onClick={handleInstall}
          className="bg-black text-white font-bold px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Baixar
        </button>
        <button onClick={handleDismiss} className="p-1 hover:bg-yellow-700 rounded">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
