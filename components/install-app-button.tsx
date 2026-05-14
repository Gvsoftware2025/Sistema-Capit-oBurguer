"use client"

import { useState, useEffect } from "react"
import { Download, X } from "lucide-react"

declare global {
  interface Window {
    pwaInstallPrompt: any
  }
}

export function InstallAppButton() {
  const [canInstall, setCanInstall] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Verifica se ja esta instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Verifica se o prompt esta disponivel
    const checkPrompt = () => {
      if (window.pwaInstallPrompt) {
        setCanInstall(true)
      }
    }

    // Checa imediatamente
    checkPrompt()

    // Checa a cada segundo por 10 segundos
    const interval = setInterval(checkPrompt, 1000)
    setTimeout(() => clearInterval(interval), 10000)

    // Escuta o evento caso chegue depois
    const handler = (e: Event) => {
      e.preventDefault()
      window.pwaInstallPrompt = e
      setCanInstall(true)
    }
    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      clearInterval(interval)
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!window.pwaInstallPrompt) {
      return
    }

    // Chama o prompt nativo do navegador
    window.pwaInstallPrompt.prompt()

    const result = await window.pwaInstallPrompt.userChoice

    if (result.outcome === 'accepted') {
      setIsInstalled(true)
      setCanInstall(false)
    }

    window.pwaInstallPrompt = null
  }

  const handleDismiss = () => {
    setCanInstall(false)
  }

  if (isInstalled || !canInstall) return null

  return (
    <div className="fixed bottom-6 right-6 z-[9999] animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-3 bg-yellow-600 text-black rounded-xl px-4 py-3 shadow-2xl">
        <Download className="h-5 w-5" />
        <div>
          <p className="font-bold text-sm">Instalar App</p>
          <p className="text-xs opacity-80">Acesso rapido</p>
        </div>
        <button
          onClick={handleInstall}
          className="bg-black text-white font-bold px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Instalar
        </button>
        <button onClick={handleDismiss} className="p-1 hover:bg-yellow-700 rounded">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
