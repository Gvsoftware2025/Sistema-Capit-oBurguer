import { neon } from "@neondatabase/serverless"
import { Pool } from "pg"

const connectionString = `postgresql://${process.env.DB_USER || "gvuser"}:${process.env.DB_PASSWORD || "153045"}@${process.env.DB_HOST || "168.231.93.220"}:${process.env.DB_PORT || "5432"}/${process.env.DB_NAME || "gvsoftware"}?sslmode=disable`

// Usar Neon para queries (melhor para serverless)
const sql = neon(connectionString)

// Pool como fallback
const pool = new Pool({
  host: process.env.DB_HOST || "168.231.93.220",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "gvsoftware",
  user: process.env.DB_USER || "gvuser",
  password: process.env.DB_PASSWORD || "153045",
  ssl: false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})

export const SCHEMA = "capitao_burguer"

export async function query<T>(text: string, params?: unknown[]): Promise<T[]> {
  try {
    // Tentar com Neon primeiro
    const result = await sql(text, params as any[])
    return result as T[]
  } catch (error) {
    // Fallback para Pool
    const client = await pool.connect()
    try {
      const result = await client.query(text, params)
      return result.rows as T[]
    } finally {
      client.release()
    }
  }
}

export async function queryOne<T>(text: string, params?: unknown[]): Promise<T | null> {
  const rows = await query<T>(text, params)
  return rows[0] || null
}

export default pool
