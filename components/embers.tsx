"use client"

import { useEffect, useState } from "react"

type Ember = {
  id: number
  left: number
  delay: number
  duration: number
  size: number
  hue: number
}

export function Embers({ count = 30 }: { count?: number }) {
  const [embers, setEmbers] = useState<Ember[]>([])

  useEffect(() => {
    const arr: Ember[] = Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 6 + Math.random() * 6,
      size: 1 + Math.random() * 2.5,
      hue: 25 + Math.random() * 35, // laranja → amarelo
    }))
    setEmbers(arr)
  }, [count])

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {embers.map((e) => (
        <span
          key={e.id}
          className="absolute bottom-0 rounded-full"
          style={{
            left: `${e.left}%`,
            width: `${e.size}px`,
            height: `${e.size}px`,
            background: `oklch(0.82 0.2 ${e.hue})`,
            boxShadow: `0 0 ${e.size * 4}px oklch(0.7 0.22 ${e.hue})`,
            animation: `ember-rise ${e.duration}s linear ${e.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}
