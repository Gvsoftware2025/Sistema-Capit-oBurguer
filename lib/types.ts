export type CategoriaId =
  | "burgueres"
  | "super-burgueres"
  | "pastel"
  | "porcoes"
  | "combos"
  | "espetos"
  | "jantinha"
  | "bebidas"

export type Produto = {
  id: string
  nome: string
  nomeExibicao: string
  descricao: string
  preco: number
  categoria: CategoriaId
  imagem: string
}

export type ItemPedido = {
  produtoId: string
  nome: string
  preco: number
  quantidade: number
  observacao?: string
}

export type TipoPedido = "retirada" | "entrega" | "balcao"
export type StatusPedido = "novo" | "preparando" | "finalizado"
export type OrigemPedido = "cliente" | "funcionario"

export type Pedido = {
  id: string
  numero: number
  cliente: string
  telefone?: string
  endereco?: string
  tipo: TipoPedido
  origem: OrigemPedido
  itens: ItemPedido[]
  observacao?: string
  total: number
  status: StatusPedido
  criadoEm: string // ISO
  finalizadoEm?: string
}
