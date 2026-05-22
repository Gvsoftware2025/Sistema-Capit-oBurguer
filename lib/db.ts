import { Pool } from "pg"

const pool = new Pool({
  host: "168.231.93.220",
  port: 5432,
  database: "gvsoftware",
  user: "gvuser",
  password: "153045",
  ssl: false,
  max: 3,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
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
