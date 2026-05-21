// Parser para extrair pedidos de mensagens formatadas do WhatsApp
// Formato esperado:
// *Pedido:*
// > 1x Barca Mista - R$109.90
//    _Batata com: Catupiry, Kibe: Tradicional_

export interface ParsedItem {
  nome: string
  quantidade: number
  preco: number
  acompanhamentos?: string
}

export interface ParsedOrder {
  cliente: string
  telefone?: string
  endereco?: string
  tipo: "retirar" | "entregar"
  pagamento: string
  itens: ParsedItem[]
  total: number
}

export function parseWhatsAppOrder(message: string): ParsedOrder | null {
  try {
    // Extrair cliente
    const clienteMatch = message.match(/\*Cliente:\*\s*(.+)/i)
    const cliente = clienteMatch ? clienteMatch[1].trim() : ""

    // Extrair telefone (se existir)
    const telefoneMatch = message.match(/\*Telefone:\*\s*(.+)/i)
    const telefone = telefoneMatch ? telefoneMatch[1].trim() : undefined

    // Extrair endereco (se existir)
    const enderecoMatch = message.match(/\*Endereco:\*\s*(.+)/i) || message.match(/\*Entrega:\*\s*(.+)/i)
    const endereco = enderecoMatch ? enderecoMatch[1].trim() : undefined

    // Determinar tipo (retirada ou entrega)
    const isRetirada = message.toLowerCase().includes("retirada") || message.toLowerCase().includes("retirar")
    const tipo: "retirar" | "entregar" = isRetirada ? "retirar" : "entregar"

    // Extrair pagamento
    const pagamentoMatch = message.match(/\*Pagamento:\*\s*(.+)/i)
    const pagamento = pagamentoMatch ? pagamentoMatch[1].trim() : "dinheiro"

    // Extrair itens
    // Formato: > 1x Nome do Produto - R$99.90
    //          _Acompanhamentos: valor_
    const itens: ParsedItem[] = []
    
    // Regex para capturar itens
    const itemRegex = />\s*(\d+)x\s+(.+?)\s*-\s*R\$\s*([\d.,]+)/g
    const acompRegex = /_([^_]+)_/g
    
    let match
    const lines = message.split('\n')
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const itemMatch = line.match(/>\s*(\d+)x\s+(.+?)\s*-\s*R\$\s*([\d.,]+)/)
      
      if (itemMatch) {
        const quantidade = parseInt(itemMatch[1])
        const nome = itemMatch[2].trim()
        const preco = parseFloat(itemMatch[3].replace(',', '.'))
        
        // Verificar proxima linha para acompanhamentos
        let acompanhamentos: string | undefined
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1]
          const acompMatch = nextLine.match(/_([^_]+)_/)
          if (acompMatch) {
            acompanhamentos = acompMatch[1].trim()
          }
        }
        
        itens.push({
          nome,
          quantidade,
          preco,
          acompanhamentos
        })
      }
    }

    // Extrair total
    const totalMatch = message.match(/\*TOTAL:\s*R\$\s*([\d.,]+)\*/i)
    const total = totalMatch ? parseFloat(totalMatch[1].replace(',', '.')) : 
      itens.reduce((acc, item) => acc + (item.preco * item.quantidade), 0)

    return {
      cliente,
      telefone,
      endereco,
      tipo,
      pagamento,
      itens,
      total
    }
  } catch (error) {
    console.error("Erro ao parsear mensagem WhatsApp:", error)
    return null
  }
}
