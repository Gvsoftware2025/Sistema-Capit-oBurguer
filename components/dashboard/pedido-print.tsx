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
  // Cria uma janela de impressao
  const printWindow = window.open("", "_blank", "width=300,height=600")
  if (!printWindow) {
    alert("Permita popups para imprimir")
    return
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Pedido #${pedido.numero}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Courier New', monospace; 
          font-size: 12px; 
          width: 80mm; 
          padding: 5mm;
          background: white;
          color: black;
        }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .border-dash { border-bottom: 1px dashed #000; padding-bottom: 5px; margin-bottom: 5px; }
        .border-dot { border-bottom: 1px dotted #999; padding-bottom: 3px; margin-bottom: 3px; }
        .flex { display: flex; justify-content: space-between; }
        .pl { padding-left: 10px; }
        .small { font-size: 10px; }
        .big { font-size: 18px; }
        .mt { margin-top: 10px; }
        @media print {
          body { width: 80mm; margin: 0; }
        }
      </style>
    </head>
    <body>
      <div class="center border-dash">
        <h1>CAPITAO BURGUER</h1>
        <p class="small">Hamburguer e Porcoes</p>
      </div>

      <div class="center border-dash">
        <p class="big bold">#${pedido.numero}</p>
        <p class="bold">${pedido.status.toUpperCase()}</p>
      </div>

      <div class="border-dash small">
        <p>Data: ${new Date(pedido.criadoEm).toLocaleDateString("pt-BR")}</p>
        <p>Hora: ${new Date(pedido.criadoEm).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>
      </div>

      <div class="border-dash">
        <p class="bold">CLIENTE: ${pedido.cliente}</p>
        ${pedido.telefone ? `<p>Tel: ${pedido.telefone}</p>` : ""}
        <p class="bold">${pedido.tipo === "entrega" ? "ENTREGA" : pedido.tipo === "retirada" ? "RETIRADA" : `MESA ${pedido.mesa || ""}`}</p>
        ${pedido.endereco ? `<p class="small">${pedido.endereco}</p>` : ""}
      </div>

      <div class="border-dash">
        <p class="center bold">--- ITENS ---</p>
        ${pedido.itens.map((item) => `
          <div class="border-dot">
            <div class="flex bold">
              <span>${item.quantidade}x ${item.nome}</span>
              <span>R$ ${(item.preco * item.quantidade).toFixed(2)}</span>
            </div>
            ${item.variacao ? `<p class="small pl">Tam: ${item.variacao}</p>` : ""}
            ${item.maionese ? `<p class="small pl">Maionese: ${item.maionese}</p>` : ""}
            ${item.extraMaioneses && item.extraMaioneses.length > 0 ? 
              item.extraMaioneses.map((m: string) => `<p class="small pl">+ ${m} (+R$ 2,00)</p>`).join("") : ""}
            ${item.adicionais && item.adicionais.length > 0 ? 
              item.adicionais.map((add: any) => {
                const nome = typeof add === "string" ? add : add.nome || "Adicional"
                const qtd = typeof add === "object" ? (add.quantidade || 1) : 1
                const preco = typeof add === "object" ? (add.preco || 0) : 0
                return `<p class="small pl">+ ${nome} ${qtd > 1 ? "("+qtd+"x)" : ""} ${preco > 0 ? "R$ "+(preco * qtd).toFixed(2) : ""}</p>`
              }).join("") : ""}
            ${item.observacao ? `<p class="small pl">OBS: ${item.observacao}</p>` : ""}
          </div>
        `).join("")}
      </div>

      ${pedido.observacao ? `
        <div class="border-dash">
          <p class="bold">OBSERVACAO:</p>
          <p class="small">${pedido.observacao}</p>
        </div>
      ` : ""}

      <div class="center border-dash">
        <p class="big bold">TOTAL: R$ ${pedido.total.toFixed(2)}</p>
      </div>

      <div class="center mt small">
        <p>Obrigado pela preferencia!</p>
        <p>Capitao Burguer</p>
      </div>

      <script>
        window.onload = function() {
          window.print();
          setTimeout(function() { window.close(); }, 500);
        }
      </script>
    </body>
    </html>
  `

  printWindow.document.write(html)
  printWindow.document.close()
}
