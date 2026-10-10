"use client"

import { useEffect, useRef, useState } from "react"
import { X } from "lucide-react"
import { BrowserQRCodeReader } from "@zxing/browser"

type Props = { onScan: (value: string) => void; onClose: () => void }
export default function ReservationQRScanner({ onScan, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [manualValue, setManualValue] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    let stopScanning: (() => void) | undefined

    async function start() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("camera-unavailable")
        const reader = new BrowserQRCodeReader()
        const controls = await reader.decodeFromVideoDevice(undefined, videoRef.current!, (result) => {
          if (result && active) onScan(result.getText())
        })
        if (!active) controls.stop()
        else stopScanning = () => controls.stop()
      } catch {
        setError("No se pudo acceder a la cámara. Revisá los permisos o ingresá el código manualmente.")
      }
    }

    void start()
    return () => {
      active = false
      stopScanning?.()
    }
  }, [onScan])

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4" role="dialog" aria-modal="true" aria-labelledby="scanner-title">
    <div className="w-full max-w-lg rounded-3xl bg-white p-5 shadow-2xl sm:p-7">
      <div className="flex items-center justify-between"><h2 id="scanner-title" className="text-xl font-bold">Escanear reserva</h2><button type="button" aria-label="Cerrar" onClick={onClose} className="rounded-full p-2 hover:bg-zinc-100"><X className="h-5 w-5" /></button></div>
      <p className="mt-2 text-sm text-zinc-500">Apuntá la cámara al código QR del socio.</p>
      <video ref={videoRef} className="mt-4 aspect-video w-full rounded-2xl bg-zinc-950 object-cover" muted playsInline />
      {error && <p role="status" className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">{error}</p>}
      <form className="mt-4 flex gap-2" onSubmit={(event) => { event.preventDefault(); if (manualValue.trim()) onScan(manualValue.trim()) }}>
        <input value={manualValue} onChange={(event) => setManualValue(event.target.value)} placeholder="ID o enlace de reserva" className="min-w-0 flex-1 rounded-xl border border-zinc-200 px-3 py-2.5 text-sm" />
        <button className="rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white">Abrir</button>
      </form>
      <button type="button" onClick={onClose} className="mt-4 w-full rounded-xl border border-zinc-200 py-2.5 text-sm font-semibold text-zinc-600">Cancelar</button>
    </div>
  </div>
}
