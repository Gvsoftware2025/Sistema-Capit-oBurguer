"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download, X } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

declare global {
  interface Window {
    deferredInstallPrompt: BeforeInstallPromptEvent | null
  }
}

export function PWAInstallButton() {
  const [canInstall, setCanInstall] = useState(false)
  const [showButton, setShowButton] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Verificar se já está instalado (standalone mode)
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches
    if (isStandalone) {
      setIsInstalled(true)
      return
    }

    // Verificar se o evento já foi capturado pelo script no head
    if (window.deferredInstallPrompt) {
      setCanInstall(true)
      setShowButton(true)
      return
    }

    // Escutar evento customizado do script no head
    const handleReady = () => {
      if (window.deferredInstallPrompt) {
        setCanInstall(true)
        setShowButton(true)
      }
    }

    window.addEventListener("pwainstallready", handleReady)

    // Mostrar botão após 2 segundos mesmo sem o evento
    const timer = setTimeout(() => {
      if (window.deferredInstallPrompt) {
        setCanInstall(true)
      }
      setShowButton(true)
    }, 2000)

    return () => {
      window.removeEventListener("pwainstallready", handleReady)
      clearTimeout(timer)
    }
  }, [])

  const handleInstall = async () => {
    const prompt = window.deferredInstallPrompt
    
    if (prompt && canInstall) {
      try {
        await prompt.prompt()
        const { outcome } = await prompt.userChoice
        
        if (outcome === "accepted") {
          setShowButton(false)
          setIsInstalled(true)
        }
        
        window.deferredInstallPrompt = null
        setCanInstall(false)
      } catch {
        showManualInstructions()
      }
    } else {
      showManualInstructions()
    }
  }

  const showManualInstructions = () => {
    alert(
      "Para instalar:\n\n" +
      "1. Clique nos 3 pontinhos (⋮) no canto superior direito do navegador\n" +
      "2. Clique em 'Instalar Capitão Burguer'\n\n" +
      "Se não aparecer, atualize a página e tente novamente."
    )
  }

  const handleDismiss = () => {
    setShowButton(false)
  }

  if (isInstalled || !showButton) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-card border-2 border-primary rounded-lg p-3 shadow-lg shadow-primary/20 animate-in slide-in-from-bottom-4">
      <div className="flex-1 mr-2">
        <p className="text-sm font-bold text-foreground">Instalar App</p>
        <p className="text-xs text-muted-foreground">Acesso rápido na área de trabalho</p>
      </div>
      <Button
        onClick={handleInstall}
        size="sm"
        className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
      >
        <Download className="h-4 w-4 mr-1" />
        Instalar
      </Button>
      <button
        onClick={handleDismiss}
        className="p-1 hover:bg-muted rounded"
        title="Fechar"
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </button>
    </div>
  )
}
