"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  PlusCircle,
  BarChart3,
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
    { icon: BarChart3, label: "Relatórios", href: "/dashboard/relatorios" },
  ]

  const fecharSidebar = () => setSidebarAberto(false)

  return (
    <>
      {/* Botao hamburguer mobile */}
      <button
        onClick={() => setSidebarAberto(!sidebarAberto)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2.5 rounded-xl bg-card/90 backdrop-blur-sm border border-border shadow-lg hover:bg-card transition-all duration-200"
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={fecharSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-56 bg-gradient-to-b from-sidebar via-sidebar to-sidebar/95 border-r border-sidebar-border/50 flex flex-col transition-transform duration-300 z-40 lg:translate-x-0 lg:relative lg:z-auto shadow-2xl",
          sidebarAberto ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex flex-col items-center py-8 border-b border-sidebar-border/30">
          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-primary shadow-xl shadow-primary/40 bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-capitao-burguer.jpeg"
              alt="Capitão Burguer"
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="mt-4 text-center font-bold text-lg tracking-wide">
            <span className="text-primary">CAPITÃO</span>
            <span className="text-foreground ml-2">BURGUER</span>
          </h2>
          <p className="text-[10px] text-muted-foreground tracking-widest mt-1">
            HAMBURGUER E PORÇÕES
          </p>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin py-6 px-3">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={fecharSidebar}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 text-sm font-semibold group",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  <Icon className={cn(
                    "h-5 w-5 flex-shrink-0 transition-transform duration-200",
                    !isActive && "group-hover:scale-110"
                  )} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border/30">
          <div className="flex items-center justify-center gap-2 text-xs text-green-500 font-medium">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span>Sistema Online</span>
          </div>
          <p className="text-[10px] text-muted-foreground/60 text-center mt-2">
            © 2024 Capitão Burguer
          </p>
        </div>
      </aside>
    </>
  )
}
