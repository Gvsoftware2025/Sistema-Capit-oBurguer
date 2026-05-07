"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  PlusCircle,
  BookOpen,
  History,
  Users,
  BarChart3,
  Settings,
  Printer,
  Wifi,
  Menu,
  X,
} from "lucide-react"
import { useState } from "react"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: PlusCircle, label: "Novo Pedido", href: "/dashboard/novo-pedido" },
  { icon: BookOpen, label: "Cardápio", href: "/dashboard/cardapio" },
  { icon: History, label: "Histórico", href: "/dashboard/historico" },
  { icon: Users, label: "Clientes", href: "/dashboard/clientes" },
  { icon: BarChart3, label: "Relatórios", href: "/dashboard/relatorios" },
  { icon: Settings, label: "Configurações", href: "/dashboard/configuracoes" },
]

interface SidebarProps {
  impressoraConectada?: boolean
  conexaoOnline?: boolean
}

export function Sidebar({ impressoraConectada = true, conexaoOnline = true }: SidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-background/80 backdrop-blur p-2 rounded-lg border border-border"
      >
        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="p-4 flex justify-center border-b border-sidebar-border">
          <div className="relative w-28 h-28">
            <Image
              src="/logo-capitao-burguer.jpeg"
              alt="Capitão Burguer"
              fill
              className="object-contain rounded-full"
            />
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Status */}
        <div className="p-4 border-t border-sidebar-border space-y-2">
          <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-sidebar-accent/50">
            <Printer className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Impressora</p>
              <p className={cn("text-sm font-medium", impressoraConectada ? "text-green-500" : "text-red-500")}>
                {impressoraConectada ? "Conectada" : "Desconectada"}
              </p>
            </div>
            <span className={cn("h-2 w-2 rounded-full", impressoraConectada ? "bg-green-500" : "bg-red-500")} />
          </div>

          <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-sidebar-accent/50">
            <Wifi className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Conexão</p>
              <p className={cn("text-sm font-medium", conexaoOnline ? "text-green-500" : "text-red-500")}>
                {conexaoOnline ? "Online" : "Offline"}
              </p>
            </div>
            <span className={cn("h-2 w-2 rounded-full animate-pulse", conexaoOnline ? "bg-green-500" : "bg-red-500")} />
          </div>
        </div>
      </aside>
    </>
  )
}
