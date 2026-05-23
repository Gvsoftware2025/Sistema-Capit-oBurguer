"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Minus, User, Check, ArrowLeft, ArrowRight, Package, ShoppingBag, X, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type Categoria = {
  id: number
  name: string
  display_order: number
}

type Produto = {
  id: number
  name: string
  description: string | null
  price: string
  category_id: number
  category_name: string
  is_available: boolean
}

type Maionese = {
  id: number
  name: string
  price: string
  is_available: boolean
}

type Adicional = {
  id: number
  name: string
  price: string
  max_quantity: number
  is_available: boolean
}

type ItemCarrinho = {
  id: string // unique id for cart
  produtoId: number
  nome: string
  preco: number
  quantidade: number
  maionese?: string
  extraMaioneses?: string[]
  adicionais?: { nome: string; preco: number; quantidade: number }[]
  acompanhamentos?: string  // Opcoes especiais como "Batata com: Catupiry, Kibe: Tradicional"
  observacao?: string
}

type ProductOption = {
  id: number
  product_id: number
  option_group: string
  option_name: string
  is_available: boolean
}

type Etapa = "cliente" | "cardapio" | "resumo"

export function NovoPedidoView() {
  const router = useRouter()
  const [etapa, setEtapa] = useState<Etapa>("cliente")
  const [nomeCliente, setNomeCliente] = useState("")
  const [observacaoGeral, setObservacaoGeral] = useState("")
  const [itens, setItens] = useState<ItemCarrinho[]>([])
  const [busca, setBusca] = useState("")
  const [categoriaAtiva, setCategoriaAtiva] = useState<number | null>(null)
  const [enviando, setEnviando] = useState(false)

  // Dados do banco
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [maioneses, setMaioneses] = useState<Maionese[]>([])
  const [adicionais, setAdicionais] = useState<Adicional[]>([])
  const [carregando, setCarregando] = useState(true)

  // Modal de personalizacao
  const [modalAberto, setModalAberto] = useState(false)
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null)
  const [maioneseSelecionada, setMaioneseSelecionada] = useState<string>("")
  const [extraMaioneses, setExtraMaioneses] = useState<string[]>([])
  const [adicionaisSelecionados, setAdicionaisSelecionados] = useState<{ [key: string]: number }>({})
  const [observacaoItem, setObservacaoItem] = useState("")
  const [quantidadeItem, setQuantidadeItem] = useState(1)
  
  // Opcoes especiais de produtos (Batata com, Kibe, etc)
  const [productOptions, setProductOptions] = useState<ProductOption[]>([])
  const [selectedOptions, setSelectedOptions] = useState<{ [group: string]: string }>({})
  const [loadingOptions, setLoadingOptions] = useState(false)

  // Carregar dados do banco
  useEffect(() => {
    async function carregarDados() {
      try {
        const [catRes, prodRes, maioRes, addRes] = await Promise.all([
          fetch("/api/cardapio/categorias"),
          fetch("/api/cardapio/produtos"),
          fetch("/api/cardapio/maioneses"),
          fetch("/api/cardapio/adicionais"),
        ])

        const [catData, prodData, maioData, addData] = await Promise.all([
          catRes.json(),
          prodRes.json(),
          maioRes.json(),
          addRes.json(),
        ])

        setCategorias(catData.categorias || [])
        setProdutos((prodData.produtos || []).filter((p: Produto) => p.is_available))
        setMaioneses((maioData.maioneses || []).filter((m: Maionese) => m.is_available))
        setAdicionais((addData.adicionais || []).filter((a: Adicional) => a.is_available))

        if (catData.categorias?.length > 0) {
          setCategoriaAtiva(catData.categorias[0].id)
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        toast.error("Erro ao carregar cardapio")
      } finally {
        setCarregando(false)
      }
    }
    carregarDados()
  }, [])

  const produtosFiltrados = produtos.filter((p) => {
    const matchCategoria = categoriaAtiva === null || p.category_id === categoriaAtiva
    const matchBusca = busca === "" || p.name.toLowerCase().includes(busca.toLowerCase())
    return matchCategoria && matchBusca
  })

  const abrirModalPersonalizacao = async (produto: Produto) => {
    setProdutoSelecionado(produto)
    setMaioneseSelecionada("")
    setExtraMaioneses([])
    setAdicionaisSelecionados({})
    setObservacaoItem("")
    setQuantidadeItem(1)
    setSelectedOptions({})
    setProductOptions([])
    setModalAberto(true)
    
    // Carregar opcoes especiais do produto
    setLoadingOptions(true)
    try {
      const res = await fetch(`/api/cardapio/product-options?product_id=${produto.id}`)
      const data = await res.json()
      if (data.options && data.options.length > 0) {
        setProductOptions(data.options)
      }
    } catch (error) {
      console.error("Erro ao carregar opcoes:", error)
    } finally {
      setLoadingOptions(false)
    }
  }

  const adicionarAoCarrinho = () => {
    if (!produtoSelecionado) return

    const adicionaisArr = Object.entries(adicionaisSelecionados)
      .filter(([, qty]) => qty > 0)
      .map(([nome, quantidade]) => {
        const add = adicionais.find((a) => a.name === nome)
        return { nome, quantidade, preco: add ? Number(add.price) : 0 }
      })

    // Montar string de acompanhamentos especiais
    let acompanhamentosStr = ""
    if (Object.keys(selectedOptions).length > 0) {
      acompanhamentosStr = Object.entries(selectedOptions)
        .map(([group, option]) => `${group}: ${option}`)
        .join(", ")
    }

    const novoItem: ItemCarrinho = {
      id: `${produtoSelecionado.id}-${Date.now()}`,
      produtoId: produtoSelecionado.id,
      nome: produtoSelecionado.name,
      preco: Number(produtoSelecionado.price),
      quantidade: quantidadeItem,
      maionese: maioneseSelecionada || undefined,
      extraMaioneses: extraMaioneses.length > 0 ? extraMaioneses : undefined,
      adicionais: adicionaisArr.length > 0 ? adicionaisArr : undefined,
      acompanhamentos: acompanhamentosStr || undefined,
      observacao: observacaoItem || undefined,
    }

    setItens((prev) => [...prev, novoItem])
    setModalAberto(false)
    toast.success(`${produtoSelecionado.name} adicionado!`)
  }

  const removerDoCarrinho = (itemId: string) => {
    setItens((prev) => prev.filter((i) => i.id !== itemId))
  }

  const calcularTotalItem = (item: ItemCarrinho) => {
    let total = item.preco * item.quantidade
    if (item.extraMaioneses) {
      total += item.extraMaioneses.length * 2 * item.quantidade // R$2 cada maionese extra
    }
    if (item.adicionais) {
      item.adicionais.forEach((add) => {
        total += add.preco * add.quantidade * item.quantidade
      })
    }
    return total
  }

  const total = itens.reduce((acc, item) => acc + calcularTotalItem(item), 0)
  const totalItens = itens.reduce((acc, item) => acc + item.quantidade, 0)

  const irParaCardapio = () => {
    if (!nomeCliente.trim()) {
      toast.error("Informe o nome do cliente")
      return
    }
    setEtapa("cardapio")
  }

  const finalizarPedido = () => {
    if (itens.length === 0) {
      toast.error("Adicione pelo menos um item")
      return
    }
    setEtapa("resumo")
  }

  const enviarPedido = async () => {
    if (enviando) return // Previne duplo clique
    setEnviando(true)
    try {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente: nomeCliente,
          tipo: "balcao",
          observacao: observacaoGeral,
          itens: itens.map((item) => ({
            nome: item.nome,
            preco: item.preco,
            quantidade: item.quantidade,
            maionese: item.maionese,
            extraMaioneses: item.extraMaioneses,
            adicionais: item.adicionais,
            acompanhamentos: item.acompanhamentos,
            observacao: item.observacao,
          })),
        }),
      })
      if (res.ok) {
        toast.success("Pedido enviado com sucesso!")
        // Limpa o estado antes de redirecionar para evitar reenvio
        setItens([])
        setNomeCliente("")
        router.push("/dashboard")
      } else {
        toast.error("Erro ao enviar pedido")
        setEnviando(false)
      }
    } catch {
      toast.error("Erro ao enviar pedido")
      setEnviando(false)
    }
  }

  // ETAPA 1: Nome do Cliente
  if (etapa === "cliente") {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-4 sm:p-6">
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto mb-3">
              <User className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-primary">Novo Pedido</h1>
            <p className="text-sm text-muted-foreground">Digite o nome do cliente</p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <Input
              placeholder="Nome do cliente..."
              value={nomeCliente}
              onChange={(e) => setNomeCliente(e.target.value)}
              className="h-12 sm:h-14 text-base sm:text-lg text-center bg-card border-2 border-border focus:border-primary"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && irParaCardapio()}
            />

            <Button
              onClick={irParaCardapio}
              disabled={!nomeCliente.trim()}
              className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30"
            >
              Continuar
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>

            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard")}
              className="w-full h-10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ETAPA 3: Resumo
  if (etapa === "resumo") {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-3 sm:p-4 overflow-auto">
        <div className="w-full max-w-lg bg-card border-2 border-primary/30 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-primary/10 border-b border-primary/20 px-4 sm:px-6 py-4 flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <Package className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-serif font-bold text-primary truncate">Resumo do Pedido</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">Confirme antes de enviar</p>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <span className="text-muted-foreground">Cliente</span>
              <span className="font-bold text-lg">{nomeCliente}</span>
            </div>

            <div className="py-3 border-b border-border">
              <span className="text-muted-foreground block mb-3">Itens ({totalItens})</span>
              <div className="space-y-3 max-h-64 overflow-auto">
                {itens.map((item) => (
                  <div key={item.id} className="bg-background/50 px-3 py-2 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span>
                        <span className="font-bold text-primary">{item.quantidade}x</span>{" "}
                        {item.nome}
                      </span>
                      <span className="font-semibold">R$ {calcularTotalItem(item).toFixed(2)}</span>
                    </div>
                    {item.maionese && (
                      <p className="text-xs text-green-500 mt-1">Maionese: {item.maionese}</p>
                    )}
                    {item.extraMaioneses && item.extraMaioneses.length > 0 && (
                      <p className="text-xs text-blue-400 mt-1">
                        Maioneses extras: {item.extraMaioneses.join(", ")}
                      </p>
                    )}
                    {item.adicionais && item.adicionais.length > 0 && (
                      <p className="text-xs text-amber-500 mt-1">
                        Adicionais: {item.adicionais.map((a) => `${a.quantidade}x ${a.nome}`).join(", ")}
                      </p>
                    )}
                    {item.acompanhamentos && (
                      <p className="text-xs text-purple-400 mt-1 font-semibold">
                        {item.acompanhamentos}
                      </p>
                    )}
                    {item.observacao && (
                      <p className="text-xs text-muted-foreground mt-1 italic">OBS: {item.observacao}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {observacaoGeral && (
              <div className="py-3 border-b border-border">
                <span className="text-muted-foreground block mb-1">Observacao Geral</span>
                <p className="italic text-foreground/80">{observacaoGeral}</p>
              </div>
            )}

            <div className="flex items-center justify-between py-4 bg-primary/10 rounded-xl px-4 mt-4">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-3xl font-bold text-primary">R$ {total.toFixed(2)}</span>
            </div>
          </div>

          <div className="px-4 sm:px-6 pb-4 sm:pb-6 flex gap-2 sm:gap-3">
            <Button variant="outline" className="flex-1 h-10 sm:h-12 text-sm" onClick={() => setEtapa("cardapio")}>
              <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
              Voltar
            </Button>
            <Button
              className="flex-1 h-10 sm:h-12 bg-green-600 hover:bg-green-700 text-white font-bold text-sm shadow-lg shadow-green-500/20"
              onClick={enviarPedido}
              disabled={enviando}
            >
              <Check className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              {enviando ? "Enviando..." : "Enviar"}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ETAPA 2: Cardapio
  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center flex-1">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Carregando cardapio...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header do Cardapio */}
      <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-border bg-card/80 shrink-0">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <button
            onClick={() => setEtapa("cliente")}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Voltar</span>
          </button>
          <div className="text-right">
            <p className="text-[10px] sm:text-xs text-muted-foreground">Cliente</p>
            <p className="font-bold text-sm sm:text-base text-primary truncate max-w-[120px] sm:max-w-none">{nomeCliente}</p>
          </div>
        </div>

        {/* Busca */}
        <div className="relative mb-2 sm:mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produto..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10 h-9 sm:h-10 bg-background/50 text-sm"
          />
        </div>

        {/* Categorias */}
        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none -mx-1 px-1 pb-1">
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoriaAtiva(cat.id)}
              className={cn(
                "px-2.5 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-medium transition-all whitespace-nowrap shrink-0",
                categoriaAtiva === cat.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                  : "bg-card border border-border hover:border-primary/50"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Produtos */}
      <div className="flex-1 overflow-auto p-2 sm:p-3 space-y-1.5 sm:space-y-2">
        {produtosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <ShoppingBag className="h-10 w-10 mb-2 opacity-50" />
            <p className="text-sm">Nenhum produto encontrado</p>
          </div>
        ) : (
          produtosFiltrados.map((produto) => (
            <button
              key={produto.id}
              onClick={() => abrirModalPersonalizacao(produto)}
              className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border bg-card border-border hover:border-primary/50 transition-all text-left"
            >
              <div className="flex-1 min-w-0 mr-2 sm:mr-3">
                <h3 className="font-bold text-xs sm:text-sm truncate">{produto.name}</h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{produto.description}</p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <span className="font-bold text-xs sm:text-sm text-primary">R$ {Number(produto.price).toFixed(2)}</span>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary flex items-center justify-center shadow-md shadow-primary/30">
                  <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-foreground" />
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Carrinho resumido */}
      {itens.length > 0 && (
        <div className="border-t-2 border-primary/30 bg-card p-3 sm:p-4 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-muted-foreground">{totalItens} {totalItens === 1 ? "item" : "itens"}</p>
              <p className="text-xl sm:text-2xl font-bold text-primary">R$ {total.toFixed(2)}</p>
            </div>
            <Button
              onClick={finalizarPedido}
              className="h-11 sm:h-14 px-5 sm:px-8 text-sm sm:text-lg font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/30 shrink-0"
            >
              <Check className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              Finalizar
            </Button>
          </div>
        </div>
      )}

      {/* Modal de Personalizacao */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-primary">
              {produtoSelecionado?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Opcoes Especiais do Produto (Batata com, Kibe, etc) */}
            {loadingOptions ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="ml-2 text-sm text-muted-foreground">Carregando opcoes...</span>
              </div>
            ) : productOptions.length > 0 && (
              <>
                {/* Agrupar opcoes por grupo */}
                {Array.from(new Set(productOptions.map(o => o.option_group))).map(group => {
                  const groupOptions = productOptions.filter(o => o.option_group === group)
                  return (
                    <div key={group}>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        {group}: <span className="text-red-500">* Obrigatorio</span>
                      </label>
                      <div className="space-y-2">
                        {groupOptions.map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => setSelectedOptions({ ...selectedOptions, [group]: opt.option_name })}
                            className={cn(
                              "w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all",
                              selectedOptions[group] === opt.option_name
                                ? "border-primary bg-primary/10 shadow-md"
                                : "border-border hover:border-primary/50"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                                selectedOptions[group] === opt.option_name
                                  ? "border-primary bg-primary"
                                  : "border-muted-foreground"
                              )}>
                                {selectedOptions[group] === opt.option_name && (
                                  <Check className="h-3 w-3 text-primary-foreground" />
                                )}
                              </div>
                              <span className="font-medium">{opt.option_name}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </>
            )}

            {/* Quantidade */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Quantidade</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantidadeItem(Math.max(1, quantidadeItem - 1))}
                  className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-card"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-xl font-bold w-8 text-center">{quantidadeItem}</span>
                <button
                  onClick={() => setQuantidadeItem(quantidadeItem + 1)}
                  className="w-10 h-10 rounded-full bg-primary flex items-center justify-center"
                >
                  <Plus className="h-4 w-4 text-primary-foreground" />
                </button>
              </div>
            </div>

            {/* Maionese Gratis */}
            {maioneses.length > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Escolha sua Maionese <span className="text-green-500">(Gratis)</span>
                </label>
                <div className="space-y-2">
                  {maioneses.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMaioneseSelecionada(maioneseSelecionada === m.name ? "" : m.name)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all",
                        maioneseSelecionada === m.name
                          ? "border-green-500 bg-green-500/10"
                          : "border-border hover:border-green-500/50"
                      )}
                    >
                      <span>{m.name}</span>
                      <span className="text-green-500 text-sm">Gratis</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Maioneses Extras */}
            {maioneses.length > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Maioneses Extras <span className="text-blue-400">(+R$ 2,00 cada)</span>
                </label>
                <div className="space-y-2">
                  {maioneses.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        if (extraMaioneses.includes(m.name)) {
                          setExtraMaioneses(extraMaioneses.filter((x) => x !== m.name))
                        } else {
                          setExtraMaioneses([...extraMaioneses, m.name])
                        }
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all",
                        extraMaioneses.includes(m.name)
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-border hover:border-blue-500/50"
                      )}
                    >
                      <span>{m.name}</span>
                      <span className="text-blue-400 text-sm">+R$ 2,00</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Adicionais */}
            {adicionais.length > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Adicionais <span className="text-amber-500">(Opcional)</span>
                </label>
                <div className="space-y-2">
                  {adicionais.map((add) => {
                    const qty = adicionaisSelecionados[add.name] || 0
                    return (
                      <div
                        key={add.id}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 rounded-lg border transition-all",
                          qty > 0 ? "border-amber-500 bg-amber-500/10" : "border-border"
                        )}
                      >
                        <div>
                          <span className="font-medium">{add.name}</span>
                          <span className="text-amber-500 text-sm ml-2">+R$ {Number(add.price).toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {qty > 0 && (
                            <button
                              onClick={() => setAdicionaisSelecionados({
                                ...adicionaisSelecionados,
                                [add.name]: qty - 1,
                              })}
                              className="w-7 h-7 rounded-full border border-border flex items-center justify-center"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                          )}
                          <span className="w-5 text-center font-bold">{qty}</span>
                          <button
                            onClick={() => setAdicionaisSelecionados({
                              ...adicionaisSelecionados,
                              [add.name]: Math.min(qty + 1, add.max_quantity),
                            })}
                            className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center"
                          >
                            <Plus className="h-3 w-3 text-black" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Observacao do Item */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Observacao</label>
              <Textarea
                placeholder="Ex: sem cebola, bem passado..."
                value={observacaoItem}
                onChange={(e) => setObservacaoItem(e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>

            {/* Botao Adicionar */}
            <Button
              onClick={adicionarAoCarrinho}
              className="w-full h-12 bg-primary hover:bg-primary/90 font-bold"
            >
              Adicionar R$ {((Number(produtoSelecionado?.price || 0) + extraMaioneses.length * 2 + Object.entries(adicionaisSelecionados).reduce((acc, [nome, qty]) => {
                const add = adicionais.find((a) => a.name === nome)
                return acc + (add ? Number(add.price) * qty : 0)
              }, 0)) * quantidadeItem).toFixed(2)}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
