"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { CategoriasTab } from "@/components/cardapio-gestao/categorias-tab"
import { ProdutosTab } from "@/components/cardapio-gestao/produtos-tab"
import { VariacoesTab } from "@/components/cardapio-gestao/variacoes-tab"
import { MaionesesTab } from "@/components/cardapio-gestao/maioneses-tab"
import { AdicionaisTab } from "@/components/cardapio-gestao/adicionais-tab"
import { 
  Layers, 
  Package, 
  Ruler, 
  Droplet, 
  PlusCircle 
} from "lucide-react"

const tabs = [
  { id: "categorias", label: "Categorias", icon: Layers },
  { id: "produtos", label: "Produtos", icon: Package },
  { id: "variacoes", label: "Variações", icon: Ruler },
  { id: "maioneses", label: "Maioneses", icon: Droplet },
  { id: "adicionais", label: "Adicionais", icon: PlusCircle },
]

export default function CardapioPage() {
  const [tabAtiva, setTabAtiva] = useState("categorias")

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <header className="px-3 sm:px-6 py-3 sm:py-4 border-b border-border/40 bg-card/50 backdrop-blur-sm">
        <h1 className="text-lg sm:text-2xl font-bold text-foreground">
          Gestão do Cardápio
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
          Categorias, produtos, variações e mais
        </p>
      </header>

      {/* Tabs - scroll horizontal no mobile */}
      <div className="px-3 sm:px-6 py-3 border-b border-border/30 bg-card/30">
        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none -mx-1 px-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = tabAtiva === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setTabAtiva(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                    : "bg-card border border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.slice(0, 4)}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Conteúdo da tab */}
      <div className="flex-1 overflow-auto p-3 sm:p-6">
        {tabAtiva === "categorias" && <CategoriasTab />}
        {tabAtiva === "produtos" && <ProdutosTab />}
        {tabAtiva === "variacoes" && <VariacoesTab />}
        {tabAtiva === "maioneses" && <MaionesesTab />}
        {tabAtiva === "adicionais" && <AdicionaisTab />}
      </div>
    </div>
  )
}
