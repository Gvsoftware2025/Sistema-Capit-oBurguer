"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download, X, Loader2 } from "lucide-react"

export function PWAInstallButton() {
  const [showButton, setShowButton] = useState(false)
  const [isDesktopApp, setIsDesktopApp] = useState(false)
  const [installerUrl, setInstallerUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Detecta se esta rodando no Tauri (app desktop)
    // Verifica parametro na URL ou localStorage
    const urlParams = new URLSearchParams(window.location.search)
    const isTauriParam = urlParams.get('app') === 'desktop'
    
    // Se veio com parametro, salva no localStorage para futuras navegacoes
    if (isTauriParam) {
      localStorage.setItem('is-desktop-app', 'true')
    }
    
    const isDesktopFromStorage = localStorage.getItem('is-desktop-app') === 'true'
    
    // Outras deteccoes do Tauri
    const isTauriWindow = 
      '__TAURI__' in window ||
      '__TAURI_INTERNALS__' in window ||
      '__TAURI_IPC__' in window ||
      typeof (window as any).__TAURI_METADATA__ !== 'undefined'
    
    // Detecta se ja esta instalado como PWA
    const isStandalone = 
      window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: window-controls-overlay)").matches ||
      (window.navigator as any).standalone === true
    
    if (isTauriParam || isDesktopFromStorage || isTauriWindow || isStandalone) {
      setIsDesktopApp(true)
      return
    }

    // Busca a URL do instalador no Blob
    fetch('/api/installer')
      .then(res => res.json())
      .then(data => {
        if (data.available && data.url) {
          setInstallerUrl(data.url)
        }
      })
      .catch(() => {})

    // Mostra o botao apos 2 segundos apenas no navegador web
    const timer = setTimeout(() => {
      setShowButton(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleDownload = () => {
    if (installerUrl) {
      setIsLoading(true)
      // Cria um link temporario para forcar download
      const link = document.createElement('a')
      link.href = installerUrl
      link.download = 'CapitaoBurguer-Setup.exe'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setTimeout(() => setIsLoading(false), 2000)
    } else {
      alert('Instalador nao disponivel ainda. Entre em contato com o suporte.')
    }
  }

  const handleDismiss = () => {
    setShowButton(false)
    sessionStorage.setItem('install-dismissed', 'true')
  }

  // Nao mostra se: esta no app desktop, ja dispensou, ou ainda nao carregou
  if (isDesktopApp || !showButton) return null

  // Verifica se ja foi dispensado nesta sessao
  if (typeof window !== 'undefined' && sessionStorage.getItem('install-dismissed')) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-card border-2 border-primary rounded-lg p-3 shadow-lg shadow-primary/20 animate-in slide-in-from-bottom-4">
      <div className="flex-1 mr-2">
        <p className="text-sm font-bold text-foreground">Instalar App Desktop</p>
        <p className="text-xs text-muted-foreground">Baixar instalador para Windows</p>
      </div>
      <Button
        onClick={handleDownload}
        size="sm"
        disabled={isLoading}
        className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
        ) : (
          <Download className="h-4 w-4 mr-1" />
        )}
        {isLoading ? 'Baixando...' : 'Baixar'}
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
