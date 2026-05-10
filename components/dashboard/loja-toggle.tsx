"use client"

import { useState, useEffect } from "react"
import { Store, DoorOpen, DoorClosed, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface LojaStatus {
  isOpen: boolean
  updatedAt: string | null
}

export function LojaToggle() {
  const [status, setStatus] = useState<LojaStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/loja/status")
      const data = await res.json()
      setStatus(data)
    } catch {
      console.error("Erro ao buscar status da loja")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const toggleStatus = async (newStatus: boolean) => {
    setUpdating(true)
    try {
      const res = await fetch("/api/loja/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOpen: newStatus }),
      })
      const data = await res.json()
      setStatus(data)
      toast.success(newStatus ? "Loja aberta!" : "Loja fechada!")
    } catch {
      toast.error("Erro ao atualizar status")
    } finally {
      setUpdating(false)
      setShowConfirm(false)
    }
  }

  const handleToggle = () => {
    if (status?.isOpen) {
      // Se está aberta, mostrar confirmação antes de fechar
      setShowConfirm(true)
    } else {
      // Se está fechada, abrir diretamente
      toggleStatus(true)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return ""
    const date = new Date(dateStr)
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-3">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const isOpen = status?.isOpen ?? false

  return (
    <>
      <button
        onClick={handleToggle}
        disabled={updating}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-300",
          isOpen
            ? "bg-green-500/15 border-green-500/50 hover:bg-green-500/25 shadow-lg shadow-green-500/20"
            : "bg-red-500/15 border-red-500/50 hover:bg-red-500/25 shadow-lg shadow-red-500/20"
        )}
      >
        {/* Icone */}
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
            isOpen ? "bg-green-500 text-white" : "bg-red-500 text-white"
          )}
        >
          {updating ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : isOpen ? (
            <DoorOpen className="h-5 w-5" />
          ) : (
            <DoorClosed className="h-5 w-5" />
          )}
        </div>

        {/* Texto */}
        <div className="flex-1 text-left min-w-0">
          <p
            className={cn(
              "font-bold text-sm",
              isOpen ? "text-green-400" : "text-red-400"
            )}
          >
            {isOpen ? "LOJA ABERTA" : "LOJA FECHADA"}
          </p>
          {status?.updatedAt && (
            <p className="text-[10px] text-muted-foreground truncate">
              Atualizado: {formatDate(status.updatedAt)}
            </p>
          )}
        </div>

        {/* Indicador */}
        <div
          className={cn(
            "w-3 h-3 rounded-full shrink-0 animate-pulse",
            isOpen ? "bg-green-400" : "bg-red-400"
          )}
        />
      </button>

      {/* Dialog de confirmação para fechar */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-400">
              <Store className="h-5 w-5" />
              Fechar a loja?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Os clientes não poderão fazer pedidos enquanto a loja estiver fechada.
              Tem certeza que deseja fechar agora?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => toggleStatus(false)}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={updating}
            >
              {updating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <DoorClosed className="h-4 w-4 mr-2" />
              )}
              Sim, fechar loja
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
