"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download, X } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

export function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showButton, setShowButton] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Verificar se é iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(isIOSDevice)

    // Verificar se já está instalado (standalone mode)
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches
    if (isStandalone) {
      setIsInstalled(true)
      return
    }

    // Verificar se foi dispensado antes
    const wasDismissed = localStorage.getItem("pwa-install-dismissed")
    if (wasDismissed) {
      setDismissed(true)
      return
    }

    // Mostrar botão para iOS com instruções manuais
    if (isIOSDevice) {
      setShowButton(true)
      return
    }

    // Para outros navegadores, escutar o evento
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowButton(true)
    }

    window.addEventListener("beforeinstallprompt", handler)

    // Se após 2 segundos não disparou, mostrar botão com instruções
    const timer = setTimeout(() => {
      if (!deferredPrompt) {
        setShowButton(true)
      }
    }, 2000)

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
      clearTimeout(timer)
    }
  }, [deferredPrompt])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === "accepted") {
        setShowButton(false)
        setIsInstalled(true)
      }
      setDeferredPrompt(null)
    } else {
      // Mostrar instruções manuais
      if (isIOS) {
        alert("Para instalar no iOS:\n\n1. Toque no botão Compartilhar (quadrado com seta)\n2. Role para baixo e toque em 'Adicionar à Tela Inicial'\n3. Toque em 'Adicionar'")
      } else {
        alert("Para instalar:\n\n1. Clique nos 3 pontinhos do navegador (⋮)\n2. Clique em 'Instalar Capitão Burguer' ou 'Instalar app'\n\nSe não aparecer essa opção, tente usar o Google Chrome.")
      }
    }
  }

  const handleDismiss = () => {
    setShowButton(false)
    setDismissed(true)
    localStorage.setItem("pwa-install-dismissed", "true")
  }

  if (isInstalled || dismissed || !showButton) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-card border-2 border-primary rounded-lg p-3 shadow-lg shadow-primary/20 animate-in slide-in-from-bottom-4">
      <div className="flex-1">
        <p className="text-sm font-bold text-foreground">Instalar App</p>
        <p className="text-xs text-muted-foreground">Acesse mais rápido</p>
      </div>
      <Button
        onClick={handleInstall}
        size="sm"
        className="bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        <Download className="h-4 w-4 mr-1" />
        Instalar
      </Button>
      <button
        onClick={handleDismiss}
        className="p-1 hover:bg-muted rounded"
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </button>
    </div>
  )
}
