// Tipos do banco de dados

export interface DbOrder {
  id: number
  order_number: number
  customer_name: string
  customer_address: string | null
  delivery_type: "entregar" | "retirar"
  payment_method: "dinheiro" | "cartao" | "pix"
  cash_amount: number | null
  subtotal: number
  delivery_fee: number
  total: number
  status: "pendente" | "preparando" | "pronto" | "entregue" | "cancelado"
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
