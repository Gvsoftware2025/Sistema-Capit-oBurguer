// Horários de funcionamento do Capitão Burguer
// Segunda a Quinta: 18:00 - 22:30
// Sexta a Domingo: 18:00 - 23:00

export function getHorarioFuncionamento() {
  const now = new Date()
  // Ajustar para fuso horário de Brasília (UTC-3)
  const brasiliaOffset = -3 * 60
  const localOffset = now.getTimezoneOffset()
  const brasilia = new Date(now.getTime() + (localOffset + brasiliaOffset) * 60 * 1000)
  
  const diaSemana = brasilia.getDay() // 0 = domingo, 1 = segunda, ..., 6 = sábado
  const hora = brasilia.getHours()
  const minutos = brasilia.getMinutes()
  const horaAtual = hora + minutos / 60 // Ex: 18:30 = 18.5

  // Sexta (5), Sábado (6), Domingo (0)
  const isFimDeSemana = diaSemana === 0 || diaSemana === 5 || diaSemana === 6
  
  const horaAbertura = 18 // 18:00
  const horaFechamento = isFimDeSemana ? 23 : 22.5 // 23:00 ou 22:30

  const estaAberto = horaAtual >= horaAbertura && horaAtual < horaFechamento

  return {
    estaAberto,
    horaAbertura: "18:00",
    horaFechamento: isFimDeSemana ? "23:00" : "22:30",
    diaSemana,
    isFimDeSemana,
    proximaAbertura: !estaAberto ? getProximaAbertura(brasilia) : null
  }
}

function getProximaAbertura(now: Date): string {
  const hora = now.getHours()
  
  if (hora < 18) {
    return "Abre hoje às 18:00"
  } else {
    return "Abre amanhã às 18:00"
  }
}

// Verifica se deve limpar os pedidos
// Segunda a Quinta: limpar às 23:00
// Sexta a Domingo: limpar às 23:30
export function deveLimparPedidos(): boolean {
  const now = new Date()
  const brasiliaOffset = -3 * 60
  const localOffset = now.getTimezoneOffset()
  const brasilia = new Date(now.getTime() + (localOffset + brasiliaOffset) * 60 * 1000)
  
  const diaSemana = brasilia.getDay()
  const hora = brasilia.getHours()
  const minutos = brasilia.getMinutes()

  // Sexta (5), Sábado (6), Domingo (0)
  const isFimDeSemana = diaSemana === 0 || diaSemana === 5 || diaSemana === 6

  if (isFimDeSemana) {
    // Limpar às 23:30
    return hora === 23 && minutos >= 30 && minutos < 35
  } else {
    // Limpar às 23:00
    return hora === 23 && minutos >= 0 && minutos < 5
  }
}
