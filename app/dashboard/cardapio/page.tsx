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
      <header className="px-6 py-4 border-b border-border/40 bg-card/50 backdrop-blur-sm">
        <h1 className="text-2xl font-bold text-foreground">
          Gestão do Cardápio
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie categorias, produtos, variações, maioneses e adicionais
        </p>
      </header>

      {/* Tabs */}
      <div className="px-6 py-4 border-b border-border/30 bg-card/30">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = tabAtiva === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setTabAtiva(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                    : "bg-card border border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Conteúdo da tab */}
      <div className="flex-1 overflow-auto p-6">
        {tabAtiva === "categorias" && <CategoriasTab />}
        {tabAtiva === "produtos" && <ProdutosTab />}
        {tabAtiva === "variacoes" && <VariacoesTab />}
        {tabAtiva === "maioneses" && <MaionesesTab />}
        {tabAtiva === "adicionais" && <AdicionaisTab />}
      </div>
    </div>
  )
}
