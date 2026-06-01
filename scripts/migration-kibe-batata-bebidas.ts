/**
 * Script de migracao para:
 * 1. KIBE - Corrigir estrutura (variacoes e sabores como addons)
 * 2. BATATA FRITA - Adicionar acrescimos especificos
 * 3. BEBIDAS - Adicionar novos produtos (Budweiser 600ml e Imperio Ultra Long Neck)
 * 4. ORDER_ITEMS - Adicionar coluna notes para observacao do item
 */

import { query, SCHEMA } from "../lib/db"

async function runMigration() {
  console.log("=== Iniciando migracao ===")
  console.log("Schema:", SCHEMA)

  try {
    // ============================================
    // 0. ORDER_ITEMS - Adicionar coluna notes
    // ============================================
    console.log("\n--- 0. Verificando coluna notes em order_items ---")
    
    // Verificar se a coluna notes ja existe
    const [colExists] = await query<{ exists: boolean }>(
      `SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = $1 AND table_name = 'order_items' AND column_name = 'notes'
      ) as exists`,
      [SCHEMA.replace(/"/g, '')]
    )
    
    if (colExists?.exists) {
      console.log("Coluna 'notes' ja existe em order_items")
    } else {
      await query(`ALTER TABLE ${SCHEMA}.order_items ADD COLUMN IF NOT EXISTS notes TEXT`)
      console.log("Coluna 'notes' adicionada a tabela order_items")
    }

    // ============================================
    // 1. KIBE - Corrigir estrutura
    // ============================================
    console.log("\n--- 1. Corrigindo KIBE ---")
    
    // Buscar produto Kibe
    const [kibe] = await query<{ id: number; name: string }>(
      `SELECT id, name FROM ${SCHEMA}.products WHERE LOWER(name) LIKE '%kibe%' LIMIT 1`
    )
    
    if (!kibe) {
      console.log("Produto KIBE nao encontrado, pulando...")
    } else {
      console.log(`Encontrado KIBE com ID: ${kibe.id}`)
      
      // Deletar variacoes antigas do Kibe (Catupiry, Coalhada, Tradicional como tamanhos)
      const deleted = await query(
        `DELETE FROM ${SCHEMA}.product_variations WHERE product_id = $1 RETURNING id, name`,
        [kibe.id]
      )
      console.log(`Variacoes deletadas:`, deleted)
      
      // Criar novas variacoes de TAMANHO: Inteira R$45 e Meia R$30
      await query(
        `INSERT INTO ${SCHEMA}.product_variations (product_id, name, price, is_available) VALUES 
         ($1, 'Inteira', 45.00, true),
         ($1, 'Meia', 30.00, true)`,
        [kibe.id]
      )
      console.log("Novas variacoes de tamanho criadas: Inteira R$45, Meia R$30")
      
      // Criar addons de sabor (Tradicional, Catupiry, Coalhada) com preco R$0
      // Primeiro verificar se ja existem na tabela addons
      const sabores = ["Tradicional", "Catupiry", "Coalhada"]
      const addonIds: number[] = []
      
      for (const sabor of sabores) {
        // Verificar se addon ja existe
        let [existing] = await query<{ id: number }>(
          `SELECT id FROM ${SCHEMA}.addons WHERE LOWER(name) = LOWER($1) LIMIT 1`,
          [sabor]
        )
        
        if (!existing) {
          // Criar addon
          [existing] = await query<{ id: number }>(
            `INSERT INTO ${SCHEMA}.addons (name, price, max_quantity, is_available) 
             VALUES ($1, 0.00, 1, true) RETURNING id`,
            [sabor]
          )
          console.log(`Addon criado: ${sabor} (ID: ${existing.id})`)
        } else {
          console.log(`Addon ja existe: ${sabor} (ID: ${existing.id})`)
        }
        addonIds.push(existing.id)
      }
      
      // Remover associacoes antigas do Kibe
      await query(`DELETE FROM ${SCHEMA}.product_addons WHERE product_id = $1`, [kibe.id])
      
      // Associar addons ao Kibe
      for (const addonId of addonIds) {
        // Verificar se ja existe antes de inserir
        const [existingAssoc] = await query<{ product_id: number }>(
          `SELECT product_id FROM ${SCHEMA}.product_addons WHERE product_id = $1 AND addon_id = $2`,
          [kibe.id, addonId]
        )
        if (!existingAssoc) {
          await query(
            `INSERT INTO ${SCHEMA}.product_addons (product_id, addon_id) VALUES ($1, $2)`,
            [kibe.id, addonId]
          )
        }
      }
      console.log(`Sabores associados ao Kibe: ${sabores.join(", ")}`)
    }

    // ============================================
    // 2. BATATA FRITA - Adicionar acrescimos
    // ============================================
    console.log("\n--- 2. Adicionando acrescimos a BATATA FRITA ---")
    
    // Buscar produto Batata Frita
    const [batata] = await query<{ id: number; name: string }>(
      `SELECT id, name FROM ${SCHEMA}.products WHERE LOWER(name) LIKE '%batata%' LIMIT 1`
    )
    
    if (!batata) {
      console.log("Produto BATATA FRITA nao encontrado, pulando...")
    } else {
      console.log(`Encontrado BATATA FRITA com ID: ${batata.id}`)
      
      // Acrescimos especificos para batata: Catupiry R$6, Cheddar R$6, Bacon R$6, Queijo Mussarela R$8
      const acrescimosBatata = [
        { name: "Catupiry", price: 6.00 },
        { name: "Cheddar", price: 6.00 },
        { name: "Bacon", price: 6.00 },
        { name: "Queijo Mussarela", price: 8.00 },
      ]
      
      // Remover associacoes antigas
      await query(`DELETE FROM ${SCHEMA}.product_addons WHERE product_id = $1`, [batata.id])
      
      for (const acrescimo of acrescimosBatata) {
        // Verificar se addon ja existe
        let [existing] = await query<{ id: number; price: number }>(
          `SELECT id, price FROM ${SCHEMA}.addons WHERE LOWER(name) = LOWER($1) LIMIT 1`,
          [acrescimo.name]
        )
        
        if (!existing) {
          // Criar addon
          [existing] = await query<{ id: number; price: number }>(
            `INSERT INTO ${SCHEMA}.addons (name, price, max_quantity, is_available) 
             VALUES ($1, $2, 5, true) RETURNING id, price`,
            [acrescimo.name, acrescimo.price]
          )
          console.log(`Addon criado: ${acrescimo.name} - R$${acrescimo.price}`)
        } else {
          // Atualizar preco se diferente
          if (Number(existing.price) !== acrescimo.price) {
            await query(
              `UPDATE ${SCHEMA}.addons SET price = $1 WHERE id = $2`,
              [acrescimo.price, existing.id]
            )
            console.log(`Addon ${acrescimo.name} atualizado para R$${acrescimo.price}`)
          } else {
            console.log(`Addon ja existe: ${acrescimo.name} (ID: ${existing.id})`)
          }
        }
        
        // Associar ao produto Batata
        const [existingBatataAssoc] = await query<{ product_id: number }>(
          `SELECT product_id FROM ${SCHEMA}.product_addons WHERE product_id = $1 AND addon_id = $2`,
          [batata.id, existing.id]
        )
        if (!existingBatataAssoc) {
          await query(
            `INSERT INTO ${SCHEMA}.product_addons (product_id, addon_id) VALUES ($1, $2)`,
            [batata.id, existing.id]
          )
        }
      }
      console.log(`Acrescimos associados a Batata Frita`)
    }

    // ============================================
    // 3. BEBIDAS - Adicionar novos produtos
    // ============================================
    console.log("\n--- 3. Adicionando novas BEBIDAS ---")
    
    // Buscar categoria Bebidas
    const [catBebidas] = await query<{ id: number }>(
      `SELECT id FROM ${SCHEMA}.categories WHERE LOWER(name) LIKE '%bebida%' LIMIT 1`
    )
    
    if (!catBebidas) {
      console.log("Categoria BEBIDAS nao encontrada, pulando...")
    } else {
      console.log(`Categoria BEBIDAS encontrada com ID: ${catBebidas.id}`)
      
      // Novos produtos: Budweiser 600ml R$15 e Imperio Ultra Long Neck R$9
      const novasBebidas = [
        { name: "Budweiser 600ml", price: 15.00, description: "Cerveja Budweiser 600ml" },
        { name: "Imperio Ultra Long Neck", price: 9.00, description: "Cerveja Imperio Ultra Long Neck" },
      ]
      
      for (const bebida of novasBebidas) {
        // Verificar se ja existe
        const [existing] = await query<{ id: number }>(
          `SELECT id FROM ${SCHEMA}.products WHERE LOWER(name) = LOWER($1) LIMIT 1`,
          [bebida.name]
        )
        
        if (existing) {
          console.log(`Bebida ja existe: ${bebida.name}`)
        } else {
          await query(
            `INSERT INTO ${SCHEMA}.products (category_id, name, description, price, is_available) 
             VALUES ($1, $2, $3, $4, true)`,
            [catBebidas.id, bebida.name, bebida.description, bebida.price]
          )
          console.log(`Bebida criada: ${bebida.name} - R$${bebida.price}`)
        }
      }
    }

    console.log("\n=== Migracao concluida com sucesso! ===")
    
  } catch (error) {
    console.error("Erro na migracao:", error)
    throw error
  }
}

// Executar migracao
runMigration()
  .then(() => {
    console.log("\nMigracao finalizada.")
    process.exit(0)
  })
  .catch((error) => {
    console.error("\nFalha na migracao:", error)
    process.exit(1)
  })
