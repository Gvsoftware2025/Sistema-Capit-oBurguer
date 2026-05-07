"use client"

// Sidebar do dashboard - sem status de impressora
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

export function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-card/90 backdrop-blur p-2.5 rounded-lg border border-border shadow-lg"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-56 bg-gradient-to-b from-sidebar via-sidebar to-sidebar/95 border-r border-sidebar-border flex flex-col transition-transform duration-300 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="p-6 flex justify-center">
          <div className="relative w-24 h-24 rounded-full overflow-hidden ring-2 ring-primary/30 shadow-xl shadow-primary/20">
            <Image
              src="/logo-capitao-burguer.jpeg"
              alt="Capitão Burguer"
              fill
              className="object-cover"
              priority
              loading="eager"
            />
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
            const isExactDashboard = item.href === "/dashboard" && pathname === "/dashboard"
            const active = isExactDashboard || (item.href !== "/dashboard" && isActive)
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200",
                  active
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/40"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", active && "drop-shadow-sm")} />
                <span className="text-sm">{item.label}</span>
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
