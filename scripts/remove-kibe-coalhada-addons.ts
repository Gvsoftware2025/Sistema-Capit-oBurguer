/**
 * Script para REMOVER os addons de Kibe e Coalhada
 * Esses addons sao especificos do Kibe e nao devem aparecer em outros produtos
 */

import { query } from "../lib/db"

const SCHEMA = "capitao_burguer"

async function removeKibeCoalhadaAddons() {
  console.log("=== Removendo addons de Kibe e Coalhada ===")

  try {
    // 1. Remover associacoes dos addons de Kibe e Coalhada com produtos
    const result1 = await query(
      `DELETE FROM ${SCHEMA}.product_addons 
       WHERE addon_id IN (
         SELECT id FROM ${SCHEMA}.addons 
         WHERE LOWER(name) LIKE '%kibe%' 
            OR LOWER(name) LIKE '%coalhada%'
       )`
    )
    console.log("Associacoes removidas")

    // 2. Remover os addons de Kibe e Coalhada
    const result2 = await query(
      `DELETE FROM ${SCHEMA}.addons 
       WHERE LOWER(name) LIKE '%kibe%' 
          OR LOWER(name) LIKE '%coalhada%'`
    )
    console.log("Addons de Kibe e Coalhada removidos")

    // 3. Listar addons restantes para confirmar
    const addons = await query<{ name: string; price: number }>(
      `SELECT name, price FROM ${SCHEMA}.addons ORDER BY name`
    )
    console.log("\nAddons restantes:")
    addons.forEach((a) => console.log(`  - ${a.name}: R$ ${a.price}`))

    console.log("\n=== Concluido! ===")
  } catch (error) {
    console.error("Erro:", error)
    throw error
  }
}

removeKibeCoalhadaAddons()
