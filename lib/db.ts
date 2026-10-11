import { Pool } from "pg"

// Usa DATABASE_URL quando configurada; caso contrário, usa as variáveis separadas da VPS.
const connectionString = process.env.DATABASE_URL

const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false,
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 30000,
    })
  : new Pool({
      host: process.env.DB_HOST || "191.252.219.152",
      port: parseInt(process.env.DB_PORT || "5432"),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false,
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 30000,
    })

export const SCHEMA = "capitao_burguer"

export async function query<T>(text: string, params?: unknown[]): Promise<T[]> {
  const client = await pool.connect()
  try {
    const result = await client.query(text, params)
    return result.rows as T[]
  } finally {
    client.release()
  }
}

export async function queryOne<T>(text: string, params?: unknown[]): Promise<T | null> {
  const rows = await query<T>(text, params)
  return rows[0] || null
}

export default pool
