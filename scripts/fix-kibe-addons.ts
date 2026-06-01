/**
 * Script para CORRIGIR os addons do Kibe
 * Remove associações antigas e cria addons de SABOR com preço R$0
 */

import { query, SCHEMA } from "../lib/db"

async function fixKibeAddons() {
  console.log("=== Corrigindo addons do Kibe ===")
  console.log("Schema:", SCHEMA)

  try {
    // 1. Buscar o produto Kibe
    const [kibe] = await query<{ id: number; name: string }>(
      `SELECT id, name FROM ${SCHEMA}.products WHERE LOWER(name) LIKE '%kibe%' LIMIT 1`
    )

    if (!kibe) {
      console.error("ERRO: Produto Kibe não encontrado!")
      return
    }
    console.log(`Kibe encontrado: ID ${kibe.id} - ${kibe.name}`)

    // 2. REMOVER TODAS as associações de addons do Kibe
    await query(`DELETE FROM ${SCHEMA}.product_addons WHERE product_id = $1`, [kibe.id])
    console.log("Todas as associações de addons do Kibe foram removidas")

    // 3. Criar addons NOVOS específicos para sabores do Kibe (preço R$0)
    const saboresKibe = ["Kibe - Tradicional", "Kibe - Catupiry", "Kibe - Coalhada"]
    
    for (const sabor of saboresKibe) {
      // Verificar se já existe
      let [existing] = await query<{ id: number }>(
        `SELECT id FROM ${SCHEMA}.addons WHERE name = $1`,
        [sabor]
      )

      if (!existing) {
        // Criar addon com preço 0
        const [newAddon] = await query<{ id: number }>(
          `INSERT INTO ${SCHEMA}.addons (name, price, max_quantity, is_available) 
           VALUES ($1, 0.00, 1, true) RETURNING id`,
          [sabor]
        )
        existing = newAddon
        console.log(`Addon criado: "${sabor}" - R$0.00 (ID: ${existing.id})`)
      } else {
        // Garantir preço 0
        await query(`UPDATE ${SCHEMA}.addons SET price = 0.00 WHERE id = $1`, [existing.id])
        console.log(`Addon existente atualizado: "${sabor}" - R$0.00 (ID: ${existing.id})`)
      }

      // Associar ao Kibe
      const [assocExists] = await query<{ product_id: number }>(
        `SELECT product_id FROM ${SCHEMA}.product_addons WHERE product_id = $1 AND addon_id = $2`,
        [kibe.id, existing.id]
      )

      if (!assocExists) {
        await query(
          `INSERT INTO ${SCHEMA}.product_addons (product_id, addon_id) VALUES ($1, $2)`,
          [kibe.id, existing.id]
        )
        console.log(`Addon "${sabor}" associado ao Kibe`)
      }
    }

    console.log("\n=== Kibe corrigido com sucesso! ===")
    console.log("Sabores disponíveis: Tradicional, Catupiry, Coalhada (todos R$0)")

  } catch (error) {
    console.error("Erro durante a correção:", error)
    throw error
  }
}

fixKibeAddons()
  .then(() => {
    console.log("\nScript finalizado!")
    process.exit(0)
  })
  .catch((err) => {
    console.error("Falha:", err)
    process.exit(1)
  })
