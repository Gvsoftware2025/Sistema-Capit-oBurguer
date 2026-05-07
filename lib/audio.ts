/**
 * Gera um som de notificação (alerta de cozinha) usando Web Audio API.
 * Não precisa de arquivo .mp3 e funciona offline.
 */
let ctxRef: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null
  if (ctxRef) return ctxRef
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  if (!AC) return null
  ctxRef = new AC()
  return ctxRef
}

export async function unlockAudio() {
  const ctx = getCtx()
  if (!ctx) return
  if (ctx.state === "suspended") {
    try {
      await ctx.resume()
    } catch {}
  }
}

function beep(ctx: AudioContext, freq: number, start: number, dur: number, gain = 0.25) {
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = "square"
  osc.frequency.value = freq
  osc.connect(g)
  g.connect(ctx.destination)

  const t0 = ctx.currentTime + start
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)

  osc.start(t0)
  osc.stop(t0 + dur + 0.05)
}

export function playOrderSound() {
  const ctx = getCtx()
  if (!ctx) return
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {})
  }
  // Padrão: dois sinos curtos + um longo (alerta de cozinha)
  beep(ctx, 880, 0, 0.15)
  beep(ctx, 1175, 0.18, 0.15)
  beep(ctx, 1480, 0.36, 0.4, 0.3)
}
