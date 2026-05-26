-- Tabela para historico de vendas (persiste mesmo apos apagar pedidos)
CREATE TABLE IF NOT EXISTS capitao_burguer.sales_history (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  order_number INTEGER NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  delivery_type VARCHAR(20) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  subtotal DECIMAL(10, 2) DEFAULT 0,
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  items_json TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indice para busca por data
CREATE INDEX IF NOT EXISTS idx_sales_history_created_at ON capitao_burguer.sales_history(created_at);

-- Indice para busca por mes/ano
CREATE INDEX IF NOT EXISTS idx_sales_history_month ON capitao_burguer.sales_history(DATE_TRUNC('month', created_at));
