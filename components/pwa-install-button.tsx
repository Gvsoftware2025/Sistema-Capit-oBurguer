"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download, X } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showButton, setShowButton] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Verificar se já está instalado
    if (window.matchMedia("(display-mode: standalone)").matches) {
      return
    }

    // Verificar se foi dispensado antes
    const wasDismissed = localStorage.getItem("pwa-install-dismissed")
    if (wasDismissed) {
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowButton(true)
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setShowButton(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowButton(false)
    setDismissed(true)
    localStorage.setItem("pwa-install-dismissed", "true")
  }

  if (!showButton || dismissed) return null

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
