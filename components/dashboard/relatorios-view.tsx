"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Flame,
  Calendar,
  BarChart3,
  Clock,
  CreditCard,
  Truck,
  Store,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

type Periodo = "hoje" | "semana" | "mes" | "ano" | "custom"

const CORES = ["#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4"]

export function RelatoriosView() {
  const [periodo, setPeriodo] = useState<Periodo>("hoje")
  const [dataInicio, setDataInicio] = useState("")
  const [dataFim, setDataFim] = useState("")
  const [showPeriodoMenu, setShowPeriodoMenu] = useState(false)

  // Construir URL com parametros
  const url = periodo === "custom" && dataInicio && dataFim
    ? `/api/relatorios?periodo=custom&dataInicio=${dataInicio}&dataFim=${dataFim}`
    : `/api/relatorios?periodo=${periodo}`

  const { data, isLoading } = useSWR(url, fetcher, { refreshInterval: 30000 })

  const metricas = data?.metricas || {
    faturamentoTotal: 0,
    totalPedidos: 0,
    ticketMedio: 0,
    pedidosEntrega: 0,
    pedidosRetirada: 0,
  }

  const topProdutos = data?.topProdutos || []
  const graficoVendas = data?.graficoVendas || []
  const graficoHoras = data?.graficoHoras || []
  const porPagamento = data?.porPagamento || {}

  const periodoLabels: Record<Periodo, string> = {
    hoje: "Hoje",
    semana: "Ultima Semana",
    mes: "Este Mes",
    ano: "Este Ano",
    custom: "Personalizado",
  }

  // Dados para grafico de pizza (tipo de entrega)
  const dadosEntrega = [
    { name: "Retirada", value: metricas.pedidosRetirada, cor: "#f59e0b" },
    { name: "Entrega", value: metricas.pedidosEntrega, cor: "#10b981" },
  ].filter(d => d.value > 0)

  // Dados para grafico de forma de pagamento
  const dadosPagamento = Object.entries(porPagamento).map(([key, value], i) => ({
    name: key === "dinheiro" ? "Dinheiro" : 
          key === "pix" ? "PIX" : 
          key === "cartao_credito" ? "Credito" : 
          key === "cartao_debito" ? "Debito" : key,
    value: value as number,
    cor: CORES[i % CORES.length]
  }))

  return (
    <div className="flex flex-col h-full overflow-auto bg-background">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-border bg-card/50 sticky top-0 z-10 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-primary flex items-center gap-2">
              <BarChart3 className="h-7 w-7" />
              Relatorios
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Acompanhe suas vendas em tempo real
            </p>
          </div>

          {/* Seletor de Periodo */}
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setShowPeriodoMenu(!showPeriodoMenu)}
              className="min-w-[180px] justify-between"
            >
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {periodoLabels[periodo]}
              </span>
              <ChevronDown className={cn("h-4 w-4 transition-transform", showPeriodoMenu && "rotate-180")} />
            </Button>

            {showPeriodoMenu && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-xl shadow-xl z-50 p-2 animate-in fade-in slide-in-from-top-2">
                {(["hoje", "semana", "mes", "ano"] as Periodo[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setPeriodo(p)
                      setShowPeriodoMenu(false)
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg transition-colors",
                      periodo === p ? "bg-primary/10 text-primary" : "hover:bg-muted"
                    )}
                  >
                    {periodoLabels[p]}
                  </button>
                ))}
                <div className="border-t border-border my-2" />
                <div className="px-3 py-2 space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">Periodo Personalizado</p>
                  <input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm bg-background border border-border rounded-lg"
                  />
                  <input
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm bg-background border border-border rounded-lg"
                  />
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      if (dataInicio && dataFim) {
                        setPeriodo("custom")
                        setShowPeriodoMenu(false)
                      }
                    }}
                    disabled={!dataInicio || !dataFim}
                  >
                    Aplicar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 lg:p-6 space-y-6">
        {/* KPIs Animados */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 lg:p-6 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-green-500/10">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-green-500/20">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <span className="text-xs lg:text-sm text-muted-foreground">Faturamento</span>
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-green-500 tabular-nums">
              R$ {metricas.faturamentoTotal.toFixed(2)}
            </p>
          </div>

          <div className="p-4 lg:p-6 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-primary/20">
                <ShoppingBag className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs lg:text-sm text-muted-foreground">Pedidos</span>
            </div>
            <p className="text-2xl lg:text-3xl font-bold tabular-nums">
              {metricas.totalPedidos}
            </p>
          </div>

          <div className="p-4 lg:p-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/10">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-blue-500/20">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <span className="text-xs lg:text-sm text-muted-foreground">Ticket Medio</span>
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-blue-500 tabular-nums">
              R$ {metricas.ticketMedio.toFixed(2)}
            </p>
          </div>

          <div className="p-4 lg:p-6 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/30 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-500/10">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-amber-500/20">
                <Users className="h-5 w-5 text-amber-500" />
              </div>
              <span className="text-xs lg:text-sm text-muted-foreground">Clientes</span>
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-amber-500 tabular-nums">
              {metricas.totalPedidos}
            </p>
          </div>
        </div>

        {/* Grafico de Vendas por Dia */}
        {graficoVendas.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-4 lg:p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">Vendas por Dia</h2>
            </div>
            <div className="h-[250px] lg:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={graficoVendas}>
                  <defs>
                    <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis 
                    dataKey="data" 
                    stroke="#888"
                    tickFormatter={(v) => {
                      const d = new Date(v)
                      return `${d.getDate()}/${d.getMonth() + 1}`
                    }}
                  />
                  <YAxis stroke="#888" tickFormatter={(v) => `R$${v}`} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid #333',
                      borderRadius: '12px'
                    }}
                    formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Total']}
                    labelFormatter={(label) => {
                      const d = new Date(label)
                      return d.toLocaleDateString('pt-BR')
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorVendas)" 
                    animationDuration={1000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Grafico de Vendas por Hora */}
        {graficoHoras.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-4 lg:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">Vendas por Hora</h2>
            </div>
            <div className="h-[200px] lg:h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={graficoHoras}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="hora" stroke="#888" />
                  <YAxis stroke="#888" tickFormatter={(v) => `R$${v}`} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid #333',
                      borderRadius: '12px'
                    }}
                    formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Total']}
                  />
                  <Bar 
                    dataKey="total" 
                    fill="#f59e0b" 
                    radius={[8, 8, 0, 0]}
                    animationDuration={1000}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Grid de Graficos de Pizza */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tipo de Entrega */}
          <div className="rounded-2xl border border-border bg-card p-4 lg:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Truck className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">Tipo de Entrega</h2>
            </div>
            {dadosEntrega.length > 0 ? (
              <div className="flex items-center justify-center gap-8">
                <div className="h-[180px] w-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dadosEntrega}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        animationDuration={1000}
                      >
                        {dadosEntrega.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.cor} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {dadosEntrega.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.cor }} />
                      <span className="text-sm">{item.name}</span>
                      <span className="font-bold ml-auto">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[180px] text-muted-foreground">
                Nenhum dado disponivel
              </div>
            )}
          </div>

          {/* Forma de Pagamento */}
          <div className="rounded-2xl border border-border bg-card p-4 lg:p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">Forma de Pagamento</h2>
            </div>
            {dadosPagamento.length > 0 ? (
              <div className="flex items-center justify-center gap-8">
                <div className="h-[180px] w-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dadosPagamento}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        animationDuration={1000}
                      >
                        {dadosPagamento.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.cor} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {dadosPagamento.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.cor }} />
                      <span className="text-sm">{item.name}</span>
                      <span className="font-bold ml-auto">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[180px] text-muted-foreground">
                Nenhum dado disponivel
              </div>
            )}
          </div>
        </div>

        {/* Produtos Mais Vendidos */}
        <div className="rounded-2xl border border-border bg-card p-4 lg:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">Produtos Mais Vendidos</h2>
          </div>
          {topProdutos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <ShoppingBag className="h-12 w-12 mb-3 opacity-50" />
              <p>Nenhum produto vendido ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topProdutos.map((produto: any, index: number) => (
                <div
                  key={produto.nome}
                  className="flex items-center justify-between p-3 lg:p-4 rounded-xl bg-background/50 hover:bg-background transition-colors"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-3 lg:gap-4">
                    <span className={cn(
                      "w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-sm lg:text-base font-bold",
                      index === 0 ? "bg-amber-500/20 text-amber-500" :
                      index === 1 ? "bg-gray-400/20 text-gray-400" :
                      index === 2 ? "bg-orange-600/20 text-orange-600" :
                      "bg-muted text-muted-foreground"
                    )}>
                      {index + 1}
                    </span>
                    <div>
                      <span className="font-medium text-sm lg:text-base">{produto.nome}</span>
                      <p className="text-xs text-muted-foreground lg:hidden">
                        {produto.quantidade}x vendido
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary text-sm lg:text-base">R$ {produto.total.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground hidden lg:block">{produto.quantidade}x vendido</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
