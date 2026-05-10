"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download, X } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

// Variavel global para capturar o evento antes do React montar
let deferredPromptGlobal: BeforeInstallPromptEvent | null = null

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault()
    deferredPromptGlobal = e as BeforeInstallPromptEvent
  })
}

export function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showButton, setShowButton] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Verificar se já está instalado
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches
    if (isStandalone) {
      setIsInstalled(true)
      return
    }

    // Pegar o evento global se já foi capturado
    if (deferredPromptGlobal) {
      setDeferredPrompt(deferredPromptGlobal)
      setShowButton(true)
      return
    }

    // Escutar novos eventos
    const handler = (e: Event) => {
      e.preventDefault()
      const evt = e as BeforeInstallPromptEvent
      deferredPromptGlobal = evt
      setDeferredPrompt(evt)
      setShowButton(true)
    }

    window.addEventListener("beforeinstallprompt", handler)

    // Mostrar botão após 1 segundo de qualquer forma
    const timer = setTimeout(() => {
      setShowButton(true)
    }, 1000)

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
      clearTimeout(timer)
    }
  }, [])

  const handleInstall = async () => {
    const prompt = deferredPrompt || deferredPromptGlobal
    
    if (prompt) {
      try {
        await prompt.prompt()
        const { outcome } = await prompt.userChoice
        if (outcome === "accepted") {
          setShowButton(false)
          setIsInstalled(true)
          localStorage.setItem("pwa-installed", "true")
        }
      } catch (err) {
        // Prompt já foi usado, mostrar instruções
        showManualInstructions()
      }
      deferredPromptGlobal = null
      setDeferredPrompt(null)
    } else {
      showManualInstructions()
    }
  }

  const showManualInstructions = () => {
    const isChrome = navigator.userAgent.includes("Chrome")
    const isEdge = navigator.userAgent.includes("Edg")
    
    if (isChrome || isEdge) {
      alert(
        "Para instalar:\n\n" +
        "1. Clique nos 3 pontinhos (⋮) no canto superior direito\n" +
        "2. Clique em 'Instalar Capitão Burguer'\n\n" +
        "Se não aparecer, atualize a página e tente novamente."
      )
    } else {
      alert(
        "Para instalar, use o Google Chrome ou Microsoft Edge.\n\n" +
        "1. Abra este site no Chrome ou Edge\n" +
        "2. Clique nos 3 pontinhos (⋮)\n" +
        "3. Clique em 'Instalar app'"
      )
    }
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
