"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download, X } from "lucide-react"

// Link direto para o instalador .msi no GitHub Releases
const INSTALLER_URL = "https://github.com/Gvsoftware2025/Sistema-Capit-oBurguer/releases/latest/download/Capitao.Burguer_1.0.0_x64_en-US.msi"

export function PWAInstallButton() {
  const [showButton, setShowButton] = useState(false)
  const [isDesktopApp, setIsDesktopApp] = useState(false)

  useEffect(() => {
    // Detecta se esta rodando no Tauri (app desktop)
    const isTauri = 
      '__TAURI__' in window ||
      '__TAURI_INTERNALS__' in window ||
      '__TAURI_IPC__' in window ||
      navigator.userAgent.includes('Tauri') ||
      window.location.protocol === 'tauri:' ||
      // Tauri 2 injeta essas variaveis
      typeof (window as any).__TAURI_METADATA__ !== 'undefined'
    
    // Detecta se ja esta instalado como PWA
    const isStandalone = 
      window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: window-controls-overlay)").matches ||
      (window.navigator as any).standalone === true
    
    if (isTauri || isStandalone) {
      setIsDesktopApp(true)
      return
    }

    // Mostra o botao apos 2 segundos apenas no navegador web
    const timer = setTimeout(() => {
      setShowButton(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleDownload = () => {
    // Baixa o instalador diretamente
    window.open(INSTALLER_URL, '_blank')
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
        className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
      >
        <Download className="h-4 w-4 mr-1" />
        Baixar
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
