"use client"

import { useEffect, useState } from "react"

type Props = { reservationId: string; size?: number }

/** The QR contains only a reservation ID; personal details stay behind admin authentication. */
export default function ReservationQR({ reservationId, size = 176 }: Props) {
  const [qrUrl, setQrUrl] = useState("")
  useEffect(() => {
    const url = new URL("/dashboard/reservas", window.location.origin)
    url.searchParams.set("reserva", reservationId)
    setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url.toString())}`)
  }, [reservationId, size])

  return qrUrl ? <img src={qrUrl} width={size} height={size} alt="Código QR de la reserva" className="rounded-xl" /> : <div aria-hidden="true" className="rounded-xl bg-zinc-100" style={{ width: size, height: size }} />
}
