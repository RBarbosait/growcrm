"use client"

import { useEffect, useState } from "react"
import { LoaderCircle } from "lucide-react"

type WaitOverlayProps = {
  open: boolean
  messages: string[]
  label?: string
}

export function WaitOverlay({
  open,
  messages,
  label = "Operación en curso",
}: WaitOverlayProps) {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    if (!open || messages.length < 2) {
      setMessageIndex(0)
      return
    }

    const interval = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % messages.length)
    }, 2400)

    return () => window.clearInterval(interval)
  }, [open, messages])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#092f35]/35 p-5 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <section className="w-full max-w-sm rounded-3xl border border-white/70 bg-white p-7 shadow-2xl shadow-[#092f35]/20">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e6f5f0] text-[#007f63]">
          <LoaderCircle className="h-7 w-7 animate-spin" aria-hidden="true" />
        </div>

        <p key={messageIndex} className="wait-message mt-5 text-center text-base font-semibold text-[#092f35]">
          {messages[messageIndex] || "Estamos procesando tu solicitud..."}
        </p>

        <p className="mt-2 text-center text-sm text-zinc-500">
          Esto puede tardar unos instantes.
        </p>

        <div
          className="mt-6 h-2 overflow-hidden rounded-full bg-[#e6f5f0]"
          role="progressbar"
          aria-label="Operación en progreso"
          aria-valuetext="En curso"
        >
          <div className="wait-progress h-full w-2/5 rounded-full bg-[#007f63]" />
        </div>
      </section>
    </div>
  )
}
