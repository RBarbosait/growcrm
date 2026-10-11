"use client"

import { useEffect, useState } from "react"
import { getReservationQrImageUrl } from "@/lib/reservation-qr"

type Props = { reservationId: string; size?: number }

/** The QR contains only a reservation ID; personal details stay behind admin authentication. */
export default function ReservationQR({ reservationId, size = 176 }: Props) {
  const [qrUrl, setQrUrl] = useState("")
  useEffect(() => {
    setQrUrl(getReservationQrImageUrl(window.location.origin, reservationId, size))
  }, [reservationId, size])

  return qrUrl ? <img src={qrUrl} width={size} height={size} alt="Código QR de la reserva" className="rounded-xl" /> : <div aria-hidden="true" className="rounded-xl bg-zinc-100" style={{ width: size, height: size }} />
}
