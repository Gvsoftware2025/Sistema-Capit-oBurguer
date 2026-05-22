"use client"

import type { Pedido } from "@/lib/types"

interface PedidoPrintProps {
  pedido: Pedido
}

export function PedidoPrint({ pedido }: PedidoPrintProps) {
  return (
    <div className="print-content p-4 bg-white text-black font-mono text-sm" style={{ width: "80mm" }}>
      {/* Cabecalho */}
      <div className="text-center border-b-2 border-dashed border-black pb-2 mb-2">
        <h1 className="text-lg font-bold">CAPITAO BURGUER</h1>
        <p className="text-xs">Hamburguer e Porcoes</p>
      </div>

      {/* Numero do Pedido */}
      <div className="text-center py-2 border-b border-dashed border-black mb-2">
        <p className="text-2xl font-bold">#{pedido.numero}</p>
        <p className="text-xs uppercase font-bold">{pedido.status}</p>
      </div>

      {/* Data/Hora */}
      <div className="text-xs mb-2">
        <p>Data: {new Date(pedido.criadoEm).toLocaleDateString("pt-BR")}</p>
        <p>Hora: {new Date(pedido.criadoEm).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>
      </div>

      {/* Cliente */}
      <div className="border-t border-dashed border-black pt-2 mb-2">
        <p className="font-bold">CLIENTE: {pedido.cliente}</p>
        {pedido.telefone && <p>Tel: {pedido.telefone}</p>}
        <p className="uppercase font-bold">
          {pedido.tipo === "entrega" ? "ENTREGA" : pedido.tipo === "retirada" ? "RETIRADA" : `MESA ${pedido.mesa || ""}`}
        </p>
        {pedido.endereco && <p className="text-xs mt-1">{pedido.endereco}</p>}
      </div>

      {/* Itens */}
      <div className="border-t-2 border-dashed border-black pt-2 mb-2">
        <p className="font-bold text-center mb-2">--- ITENS ---</p>
        {pedido.itens.map((item, i) => (
          <div key={i} className="mb-2 pb-2 border-b border-dotted border-gray-400">
            <div className="flex justify-between">
              <span className="font-bold">{item.quantidade}x {item.nome}</span>
              <span>R$ {(item.preco * item.quantidade).toFixed(2)}</span>
            </div>
            
            {/* Acompanhamentos especiais - PRIMEIRO para destaque */}
            {item.acompanhamentos && (
              <p className="text-xs pl-2 font-bold" style={{ color: "#b45309" }}>{item.acompanhamentos}</p>
            )}

            {/* Variacao */}
            {item.variacao && (
              <p className="text-xs pl-2">Tam: {item.variacao}</p>
            )}

            {/* Maionese Gratis */}
            {item.maionese && (
              <p className="text-xs pl-2">Maionese: {item.maionese}</p>
            )}

            {/* Maioneses extras */}
            {item.extraMaioneses && item.extraMaioneses.length > 0 && (
              <div className="pl-2">
                {item.extraMaioneses.map((maionese: string, j: number) => (
                  <p key={j} className="text-xs">+ {maionese} (+R$ 2,00)</p>
                ))}
              </div>
            )}

            {/* Adicionais */}
            {item.adicionais && item.adicionais.length > 0 && (
              <div className="pl-2">
                {item.adicionais.map((add: any, j: number) => {
                  const nome = typeof add === "string" ? add : add.nome || "Adicional"
                  const qtd = typeof add === "object" ? (add.quantidade || 1) : 1
                  const preco = typeof add === "object" ? (add.preco || 0) : 0
                  return (
                    <p key={j} className="text-xs">
                      + {nome} {qtd > 1 ? `(${qtd}x)` : ""} {preco > 0 ? `R$ ${(preco * qtd).toFixed(2)}` : ""}
                    </p>
                  )
                })}
              </div>
            )}

            {/* Observacao do item */}
            {item.observacao && (
              <p className="text-xs pl-2 italic">OBS: {item.observacao}</p>
            )}
          </div>
        ))}
      </div>

      {/* Observacao geral */}
      {pedido.observacao && (
        <div className="border-t border-dashed border-black pt-2 mb-2">
          <p className="font-bold">OBSERVACAO:</p>
          <p className="text-xs">{pedido.observacao}</p>
        </div>
      )}

      {/* Total */}
      <div className="border-t-2 border-dashed border-black pt-2 text-center">
        <p className="text-xl font-bold">TOTAL: R$ {pedido.total.toFixed(2)}</p>
      </div>

      {/* Rodape */}
      <div className="text-center mt-4 pt-2 border-t border-dashed border-black text-xs">
        <p>Obrigado pela preferencia!</p>
        <p>Capitao Burguer</p>
      </div>
    </div>
  )
}

export function imprimirPedido(pedido: Pedido) {
  // Remove iframe anterior se existir
  const oldFrame = document.getElementById("print-frame")
  if (oldFrame) oldFrame.remove()

  // Cria iframe oculto para impressao
  const iframe = document.createElement("iframe")
  iframe.id = "print-frame"
  iframe.style.position = "fixed"
  iframe.style.right = "0"
  iframe.style.bottom = "0"
  iframe.style.width = "0"
  iframe.style.height = "0"
  iframe.style.border = "none"
  document.body.appendChild(iframe)

  const doc = iframe.contentWindow?.document
  if (!doc) {
    alert("Erro ao preparar impressao")
    return
  }

  const dataFormatada = new Date(pedido.criadoEm).toLocaleDateString("pt-BR")
  const horaFormatada = new Date(pedido.criadoEm).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  const tipoText = pedido.tipo === "entrega" ? "DELIVERY" : pedido.tipo === "retirada" ? "RETIRADA" : `MESA ${pedido.mesa || ""}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Pedido #${pedido.numero}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body { 
          font-family: 'JetBrains Mono', 'Courier New', monospace; 
          font-size: 11px; 
          width: 80mm; 
          padding: 4mm;
          background: white;
          color: #111;
          line-height: 1.4;
        }
        
        .header {
          text-align: center;
          padding-bottom: 8px;
          margin-bottom: 8px;
          border-bottom: 2px solid #111;
        }
        
        .logo {
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 1px;
          margin-bottom: 2px;
        }
        
        .subtitle {
          font-size: 9px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        
        .order-box {
          background: #111;
          color: white;
          text-align: center;
          padding: 10px 8px;
          margin: 8px 0;
          border-radius: 4px;
        }
        
        .order-number {
          font-size: 22px;
          font-weight: 700;
          letter-spacing: 1px;
        }
        
        .order-status {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-top: 4px;
          opacity: 0.9;
        }
        
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 3px 0;
          font-size: 10px;
        }
        
        .info-label {
          color: #666;
        }
        
        .section {
          margin: 10px 0;
          padding: 8px 0;
          border-top: 1px dashed #ccc;
        }
        
        .section-title {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #666;
          margin-bottom: 8px;
        }
        
        .customer-name {
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 4px;
        }
        
        .delivery-type {
          display: inline-block;
          background: #f0f0f0;
          padding: 3px 8px;
          border-radius: 3px;
          font-size: 10px;
          font-weight: 700;
          margin-top: 4px;
        }
        
        .items-section {
          margin: 10px 0;
          padding-top: 8px;
          border-top: 2px solid #111;
        }
        
        .item {
          padding: 8px 0;
          border-bottom: 1px dotted #ddd;
        }
        
        .item:last-child {
          border-bottom: none;
        }
        
        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        
        .item-name {
          font-weight: 700;
          font-size: 11px;
          flex: 1;
        }
        
        .item-qty {
          background: #111;
          color: white;
          padding: 1px 6px;
          border-radius: 3px;
          font-size: 10px;
          font-weight: 700;
          margin-right: 6px;
        }
        
        .item-price {
          font-weight: 700;
          font-size: 11px;
        }
        
        .item-detail {
          font-size: 9px;
          color: #555;
          padding-left: 8px;
          margin-top: 3px;
        }
        
        .item-special {
          font-size: 10px;
          font-weight: 700;
          color: #b45309;
          padding-left: 8px;
          margin-top: 4px;
          background: #fef3c7;
          padding: 4px 8px;
          border-radius: 3px;
          display: inline-block;
        }
        
        .item-obs {
          font-size: 9px;
          font-style: italic;
          color: #666;
          padding-left: 8px;
          margin-top: 3px;
        }
        
        .total-section {
          background: #111;
          color: white;
          text-align: center;
          padding: 12px 8px;
          margin: 10px 0;
          border-radius: 4px;
        }
        
        .total-label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 2px;
          opacity: 0.8;
        }
        
        .total-value {
          font-size: 24px;
          font-weight: 700;
          margin-top: 4px;
        }
        
        .footer {
          text-align: center;
          padding-top: 10px;
          border-top: 1px dashed #ccc;
          font-size: 9px;
          color: #666;
        }
        
        .footer-thanks {
          font-size: 10px;
          margin-bottom: 4px;
        }
        
        @media print {
          body { width: 80mm; margin: 0; padding: 3mm; }
          .order-box, .total-section { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">CAPITAO BURGUER</div>
        <div class="subtitle">Hamburguer Artesanal</div>
      </div>

      <div class="order-box">
        <div class="order-number">${pedido.numero}</div>
        <div class="order-status">${pedido.status.toUpperCase()}</div>
      </div>

      <div class="info-row">
        <span class="info-label">Data</span>
        <span>${dataFormatada}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Hora</span>
        <span>${horaFormatada}</span>
      </div>

      <div class="section">
        <div class="section-title">Cliente</div>
        <div class="customer-name">${pedido.cliente}</div>
        ${pedido.telefone ? `<div style="font-size:10px;color:#666;">${pedido.telefone}</div>` : ""}
        <div class="delivery-type">${tipoText}</div>
        ${pedido.endereco ? `<div style="font-size:9px;color:#666;margin-top:6px;">${pedido.endereco}</div>` : ""}
      </div>

      <div class="items-section">
        <div class="section-title">Itens do Pedido</div>
        ${pedido.itens.map((item) => `
          <div class="item">
            <div class="item-header">
              <div style="display:flex;align-items:center;">
                <span class="item-qty">${item.quantidade}x</span>
                <span class="item-name">${item.nome}</span>
              </div>
              <span class="item-price">R$ ${(item.preco * item.quantidade).toFixed(2)}</span>
            </div>
            ${item.acompanhamentos ? `<div class="item-special">${item.acompanhamentos}</div>` : ""}
            ${item.variacao ? `<div class="item-detail">Tamanho: ${item.variacao}</div>` : ""}
            ${item.maionese ? `<div class="item-detail">Maionese: ${item.maionese}</div>` : ""}
            ${item.extraMaioneses && item.extraMaioneses.length > 0 ? 
              item.extraMaioneses.map((m: string) => `<div class="item-detail">+ ${m} (+R$ 2,00)</div>`).join("") : ""}
            ${item.adicionais && item.adicionais.length > 0 ? 
              item.adicionais.map((add: any) => {
                const nome = typeof add === "string" ? add : add.nome || "Adicional"
                const qtd = typeof add === "object" ? (add.quantidade || 1) : 1
                const preco = typeof add === "object" ? (add.preco || 0) : 0
                return `<div class="item-detail">+ ${nome}${qtd > 1 ? " ("+qtd+"x)" : ""}${preco > 0 ? " - R$ "+(preco * qtd).toFixed(2) : ""}</div>`
              }).join("") : ""}
            ${item.observacao ? `<div class="item-obs">OBS: ${item.observacao}</div>` : ""}
          </div>
        `).join("")}
      </div>

      ${pedido.observacao ? `
        <div class="section">
          <div class="section-title">Observacao</div>
          <div style="font-size:10px;">${pedido.observacao}</div>
        </div>
      ` : ""}

      <div class="total-section">
        <div class="total-label">Total do Pedido</div>
        <div class="total-value">R$ ${pedido.total.toFixed(2)}</div>
      </div>

      <div class="footer">
        <div class="footer-thanks">Obrigado pela preferencia!</div>
        <div>capitaoburguer.com.br</div>
      </div>
    </body>
    </html>
  `

  doc.open()
  doc.write(html)
  doc.close()

  // Aguarda carregar e imprime UMA VEZ
  setTimeout(() => {
    iframe.contentWindow?.print()
  }, 300)
}
