"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  PlusCircle,
  BookOpen,
  History,
  Users,
  BarChart3,
  Settings,
  Menu,
  X,
} from "lucide-react"
import { useState } from "react"

export function Sidebar() {
  const pathname = usePathname()
  const [sidebarAberto, setSidebarAberto] = useState(false)

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: PlusCircle, label: "Novo Pedido", href: "/dashboard/novo-pedido" },
    { icon: BookOpen, label: "Cardápio", href: "/dashboard/cardapio" },
    { icon: History, label: "Histórico", href: "/dashboard/historico" },
    { icon: Users, label: "Clientes", href: "/dashboard/clientes" },
    { icon: BarChart3, label: "Relatórios", href: "/dashboard/relatorios" },
    { icon: Settings, label: "Configurações", href: "/dashboard/configuracoes" },
  ]

  const fecharSidebar = () => setSidebarAberto(false)

  return (
    <>
      {/* Botão hamburguer mobile */}
      <button
        onClick={() => setSidebarAberto(!sidebarAberto)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-card border border-border hover:bg-card/80 transition-colors"
      >
        {sidebarAberto ? (
          <X className="h-5 w-5 text-foreground" />
        ) : (
          <Menu className="h-5 w-5 text-foreground" />
        )}
      </button>

      {/* Overlay mobile */}
      {sidebarAberto && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={fecharSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-48 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 z-40 lg:translate-x-0 lg:relative lg:z-auto",
          sidebarAberto ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="relative h-32 w-full flex-shrink-0 overflow-hidden border-b border-sidebar-border/50">
          <Image
            src="/logo-capitao-burguer.jpeg"
            alt="Capitão Burguer"
            fill
            className="object-cover"
            priority
            loading="eager"
          />
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin space-y-2 p-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={fecharSidebar}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium",
                  isActive
                    ? "bg-sidebar-accent text-primary shadow-md shadow-primary/20"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Versão */}
        <div className="p-4 border-t border-sidebar-border/50">
          <p className="text-[10px] text-muted-foreground text-center tracking-wider">
            Capitão Burguer © 2024
          </p>
        </div>
      </aside>
    </>
  )
}
