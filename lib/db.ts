import { Pool } from "pg"

const pool = new Pool({
  host: process.env.DB_HOST || "168.231.93.220",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "gvsoftware",
  user: process.env.DB_USER || "gvuser",
  password: process.env.DB_PASSWORD || "153045",
  ssl: false,
  max: 5,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
  allowExitOnIdle: true,
})

// Tratar erros de conexão
pool.on('error', (err) => {
  console.error('[DB] Erro no pool:', err.message)
})

export const SCHEMA = "capitao_burguer"

export async function query<T>(text: string, params?: unknown[]): Promise<T[]> {
  let client
  try {
    client = await pool.connect()
    const result = await client.query(text, params)
    return result.rows as T[]
  } catch (error) {
    console.error('[DB] Erro na query:', error)
    throw error
  } finally {
    if (client) client.release(true)
  }
}

export async function queryOne<T>(text: string, params?: unknown[]): Promise<T | null> {
  const rows = await query<T>(text, params)
  return rows[0] || null
}

export default pool
