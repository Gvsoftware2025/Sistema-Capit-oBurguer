import { query, SCHEMA } from "../lib/db"

async function createSalesHistoryTable() {
  console.log("Criando tabela sales_history...")
  
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS ${SCHEMA}.sales_history (
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
      )
    `)
    console.log("Tabela criada com sucesso!")

    // Criar indices
    await query(`
      CREATE INDEX IF NOT EXISTS idx_sales_history_created_at 
      ON ${SCHEMA}.sales_history(created_at)
    `)
    console.log("Indice de data criado!")

    await query(`
      CREATE INDEX IF NOT EXISTS idx_sales_history_month 
      ON ${SCHEMA}.sales_history(DATE_TRUNC('month', created_at))
    `)
    console.log("Indice de mes criado!")

    console.log("Setup concluido!")
  } catch (error) {
    console.error("Erro ao criar tabela:", error)
    process.exit(1)
  }
}

createSalesHistoryTable()
