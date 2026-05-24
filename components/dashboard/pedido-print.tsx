"use client"

import type { Pedido } from "@/lib/types"

interface PedidoPrintProps {
  pedido: Pedido
}

export function PedidoPrint({ pedido }: PedidoPrintProps) {
  return (
    <div className="print-content p-2 bg-white text-black font-mono text-xs" style={{ width: "58mm" }}>
      <div className="text-center border-b border-black pb-1 mb-1">
        <h1 className="text-sm font-bold">CAPITAO BURGUER</h1>
      </div>
      <div className="text-center py-1 mb-1">
        <p className="text-lg font-bold">#{pedido.numero}</p>
      </div>
      <div className="text-xs mb-1">
        <p><strong>CLIENTE:</strong> {pedido.cliente}</p>
        <p><strong>{pedido.tipo === "entrega" ? "ENTREGA" : "RETIRADA"}</strong></p>
        {pedido.endereco && <p>{pedido.endereco}</p>}
      </div>
      <div className="border-t border-black pt-1 mb-1">
        {pedido.itens.map((item, i) => (
          <div key={i} className="mb-1">
            <p><strong>{item.quantidade}x {item.nome}</strong> R${(item.preco * item.quantidade).toFixed(2)}</p>
            {item.acompanhamentos && <p className="pl-1 text-xs">{item.acompanhamentos}</p>}
          </div>
        ))}
      </div>
      <div className="border-t border-black pt-1 text-center">
        <p className="text-base font-bold">TOTAL: R$ {pedido.total.toFixed(2)}</p>
      </div>
    </div>
  )
}

export function imprimirPedido(pedido: Pedido) {
  const oldFrame = document.getElementById("print-frame")
  if (oldFrame) oldFrame.remove()

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
  const tipoText = pedido.tipo === "entrega" ? "DELIVERY" : pedido.tipo === "retirada" ? "RETIRADA" : "BALCAO"

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Pedido #${pedido.numero}</title>
      <style>
        @page {
          size: 58mm auto;
          margin: 0;
        }
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body { 
          font-family: 'Courier New', Courier, monospace; 
          font-size: 12px; 
          width: 58mm; 
          padding: 2mm;
          background: white;
          color: #000;
          line-height: 1.3;
          font-weight: bold;
        }
        
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .line { border-top: 1px dashed #000; margin: 4px 0; }
        .line-double { border-top: 2px solid #000; margin: 4px 0; }
        
        .header {
          text-align: center;
          padding-bottom: 4px;
          border-bottom: 2px solid #000;
        }
        
        .logo {
          font-size: 14px;
          font-weight: bold;
          letter-spacing: 0;
        }
        
        .order-number {
          text-align: center;
          padding: 6px 0;
          margin: 4px 0;
          background: #000;
          color: #fff;
          font-size: 18px;
          font-weight: bold;
        }
        
        .info {
          font-size: 11px;
          padding: 2px 0;
        }
        
        .customer {
          padding: 4px 0;
          border-top: 1px dashed #000;
          border-bottom: 1px dashed #000;
          margin: 4px 0;
        }
        
        .customer-name {
          font-size: 14px;
          font-weight: bold;
        }
        
        .delivery-type {
          font-size: 12px;
          font-weight: bold;
          background: #000;
          color: #fff;
          display: inline-block;
          padding: 2px 6px;
          margin-top: 2px;
        }
        
        .address {
          font-size: 10px;
          margin-top: 2px;
        }
        
        .items-title {
          text-align: center;
          font-size: 11px;
          font-weight: bold;
          padding: 4px 0;
          border-bottom: 1px dashed #000;
        }
        
        .item {
          padding: 4px 0;
          border-bottom: 1px dotted #ccc;
        }
        
        .item-row {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          font-weight: bold;
        }
        
        .item-detail {
          font-size: 10px;
          padding-left: 8px;
          font-weight: normal;
        }
        
        .item-special {
          font-size: 11px;
          font-weight: bold;
          padding-left: 4px;
          margin-top: 2px;
        }
        
        .total {
          text-align: center;
          padding: 6px 0;
          margin-top: 4px;
          background: #000;
          color: #fff;
        }
        
        .total-label {
          font-size: 10px;
        }
        
        .total-value {
          font-size: 20px;
          font-weight: bold;
        }
        
        .footer {
          text-align: center;
          padding-top: 4px;
          font-size: 9px;
          border-top: 1px dashed #000;
          margin-top: 4px;
        }
        
        @media print {
          body { 
            width: 58mm; 
            margin: 0; 
            padding: 2mm;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .order-number, .delivery-type, .total {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">CAPITAO BURGUER</div>
      </div>

      <div class="order-number">#${pedido.numero}</div>

      <div class="info">${dataFormatada} - ${horaFormatada}</div>

      <div class="customer">
        <div class="customer-name">${pedido.cliente}</div>
        ${pedido.telefone ? `<div class="info">${pedido.telefone}</div>` : ""}
        <span class="delivery-type">${tipoText}</span>
        ${pedido.endereco ? `<div class="address">${pedido.endereco}</div>` : ""}
      </div>

      <div class="items-title">ITENS</div>
      
      ${pedido.itens.map((item) => `
        <div class="item">
          <div class="item-row">
            <span>${item.quantidade}x ${item.nome}</span>
            <span>R$${(item.preco * item.quantidade).toFixed(2)}</span>
          </div>
          ${item.acompanhamentos ? `<div class="item-special">* ${item.acompanhamentos}</div>` : ""}
          ${item.maionese ? `<div class="item-detail">Maionese: ${item.maionese}</div>` : ""}
          ${item.extraMaioneses && item.extraMaioneses.length > 0 ? 
            item.extraMaioneses.map((m: string) => `<div class="item-detail">+ ${m}</div>`).join("") : ""}
          ${item.adicionais && item.adicionais.length > 0 ? 
            item.adicionais.map((add: any) => {
              const nome = typeof add === "string" ? add : add.nome || "Adicional"
              const qtd = typeof add === "object" ? (add.quantidade || 1) : 1
              return `<div class="item-detail">+ ${nome}${qtd > 1 ? " ("+qtd+"x)" : ""}</div>`
            }).join("") : ""}
          ${item.observacao ? `<div class="item-detail">OBS: ${item.observacao}</div>` : ""}
        </div>
      `).join("")}

      ${pedido.observacao ? `
        <div class="item">
          <div class="item-detail"><strong>OBS:</strong> ${pedido.observacao}</div>
        </div>
      ` : ""}

      <div class="total">
        <div class="total-label">TOTAL</div>
        <div class="total-value">R$ ${pedido.total.toFixed(2)}</div>
      </div>

      <div class="footer">
        Obrigado!<br>
        Capitao Burguer
      </div>
    </body>
    </html>
  `

  doc.open()
  doc.write(html)
  doc.close()

  setTimeout(() => {
    iframe.contentWindow?.print()
  }, 300)
}
