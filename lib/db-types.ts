// Tipos do banco de dados

export interface DbOrder {
  id: number
  order_number: number
  customer_name: string
  customer_phone: string | null
  customer_address: string | null
  delivery_type: "entregar" | "retirar"
  payment_method: "dinheiro" | "cartao_credito" | "cartao_debito" | "pix"
  change_for: number | null
  subtotal: number
  delivery_fee: number
  total: number
  status: "pendente" | "preparando" | "pronto" | "entregue" | "cancelado"
  notes: string | null
  created_at: Date
  updated_at: Date
  items?: DbOrderItem[]
}

export interface DbOrderItem {
  id: number
  order_id: number
  product_name: string
  quantity: number
  variation_name: string | null
  maionese: string | null
  extra_maioneses: string[] | null
  addons: string[] | null
  acompanhamentos: string | null  // Para guardar opcoes especiais como "Batata com: Catupiry, Kibe: Tradicional"
  item_total: number
}

export interface DbCategory {
  id: number
  name: string
  description: string | null
  display_order: number
  is_active: boolean
  created_at: Date
}

export interface DbProduct {
  id: number
  category_id: number
  category_name?: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  display_order: number
  is_available: boolean
  created_at: Date
}

export interface DbProductVariation {
  id: number
  product_id: number
  product_name?: string
  name: string
  price: number
  is_available: boolean
}

export interface DbMaionese {
  id: number
  name: string
  price: number
  display_order: number
  is_available: boolean
}

export interface DbAddon {
  id: number
  name: string
  price: number
  max_quantity: number
  display_order: number
  is_available: boolean
}

// Opcoes especiais de produtos (como Batata com Catupiry/Cheddar, Kibe Tradicional/Catupiry)
export interface DbProductOption {
  id: number
  product_id: number
  option_group: string  // Ex: "BATATA COM", "KIBE"
  option_name: string   // Ex: "Catupiry", "Cheddar", "Tradicional", "Coalhada"
  display_order: number
  is_available: boolean
}

// Historico de vendas (persiste mesmo depois de apagar pedidos)
export interface DbSalesHistory {
  id: number
  order_id: number
  order_number: number
  customer_name: string
  delivery_type: "entregar" | "retirar"
  payment_method: string
  subtotal: number
  delivery_fee: number
  total: number
  items_json: string  // JSON string dos itens
  created_at: Date
}
