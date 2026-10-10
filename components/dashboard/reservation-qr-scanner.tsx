"use client"

import { useEffect, useRef, useState } from "react"
import { X } from "lucide-react"

type Props = { onScan: (value: string) => void; onClose: () => void }
type Detector = { detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue: string }>> }
type DetectorConstructor = new (options?: { formats: string[] }) => Detector

export default function ReservationQRScanner({ onScan, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [manualValue, setManualValue] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    let stream: MediaStream | undefined
    let active = true
    let timer: number | undefined

    async function start() {
      const DetectorAPI = (window as Window & { BarcodeDetector?: DetectorConstructor }).BarcodeDetector
      if (!DetectorAPI) {
        setError("Este navegador no admite escaneo de QR. Podés pegar o escribir el código de reserva abajo.")
        return
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        if (!active || !videoRef.current) return
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        const detector = new DetectorAPI({ formats: ["qr_code"] })
        const scan = async () => {
          if (!active || !videoRef.current) return
          try {
            const codes = await detector.detect(videoRef.current)
            if (codes[0]?.rawValue) {
              onScan(codes[0].rawValue)
              return
            }
          } catch { /* Camera frames can be temporarily unavailable. */ }
          timer = window.setTimeout(scan, 250)
        }
        void scan()
      } catch {
        setError("No se pudo acceder a la cámara. Revisá los permisos o ingresá el código manualmente.")
      }
    }

    void start()
    return () => {
      active = false
      if (timer !== undefined) window.clearTimeout(timer)
      stream?.getTracks().forEach((track) => track.stop())
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
