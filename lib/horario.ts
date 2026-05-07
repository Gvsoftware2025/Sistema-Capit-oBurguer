/**
 * Status da loja: Ter a Dom, a partir das 18h.
 * (Segunda fechado.)
 */
export function statusLoja(now: Date = new Date()): {
  aberto: boolean
  label: string
  sublabel: string
} {
  const dia = now.getDay() // 0 = Dom, 1 = Seg, ... 6 = Sab
  const hora = now.getHours()
  const aberto = dia !== 1 && hora >= 18 && hora < 23
  return {
    aberto,
    label: aberto ? "ABERTO" : "FECHADO",
    sublabel: "Ter a Dom · A partir das 18h",
  }
}
