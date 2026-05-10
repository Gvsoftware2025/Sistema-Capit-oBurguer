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

function beep(ctx: AudioContext, freq: number, start: number, dur: number, gain = 0.5) {
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
  // Som de alerta mais forte - 3 beeps altos
  beep(ctx, 1000, 0, 0.2, 0.6)
  beep(ctx, 1200, 0.25, 0.2, 0.6)
  beep(ctx, 1000, 0.5, 0.2, 0.6)
  beep(ctx, 1400, 0.75, 0.4, 0.7)
}
