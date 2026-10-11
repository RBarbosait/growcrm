"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { WaitOverlay } from "@/components/ui/wait-overlay"
import { supabase } from "@/lib/supabase"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://growcrm-api-production.up.railway.app"

type Club = { id: string; role?: string }
type Reservation = { id: string }
const QR_REQUEST_TIMEOUT_MS = 15_000
const SESSION_TIMEOUT_MS = 8_000

function withTimeout<T>(promise: Promise<T>, milliseconds: number, message: string): Promise<T> {
  let timeoutId: number | undefined
  const timeout = new Promise<T>((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error(message)), milliseconds)
  })
  return Promise.race([promise, timeout]).finally(() => {
    if (timeoutId !== undefined) window.clearTimeout(timeoutId)
  })
}

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}) {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), QR_REQUEST_TIMEOUT_MS)
  try {
    return await fetch(input, { ...init, signal: controller.signal })
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error("La API del club está tardando demasiado en responder. Revisá tu conexión y volvé a intentar.")
    }
    throw error
  } finally {
    window.clearTimeout(timeout)
  }
}

export default function ReservationQrEntryPage() {
  const [message, setMessage] = useState("")

  useEffect(() => {
    let active = true

    async function resolveQrDestination() {
      const reservationId = new URLSearchParams(window.location.search).get("reserva")?.trim()
      if (!reservationId) {
        setMessage("Este código QR no contiene un identificador de reserva válido.")
        return
      }

      try {
        const { data: { session }, error: sessionError } = await withTimeout(
          supabase.auth.getSession(),
          SESSION_TIMEOUT_MS,
          "Safari no pudo recuperar tu sesión. Volvé a intentar o iniciá sesión nuevamente."
        )
        if (sessionError) throw sessionError
        if (!session?.user?.email) {
          const next = `/qr-reserva?reserva=${encodeURIComponent(reservationId)}`
          window.location.replace(`/auth/login?next=${encodeURIComponent(next)}`)
          return
        }

        const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email.split("@")[0]
        const syncResponse = await fetchWithTimeout(`${API_URL}/user/sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: session.user.email, name }),
        })
        const syncResult = await syncResponse.json().catch(() => ({}))
        if (!syncResponse.ok) throw new Error(syncResult.error || "No se pudo verificar tu acceso.")

        const clubs: Club[] = Array.isArray(syncResult.clubs) ? syncResult.clubs : []
        if (!active) return
        if (clubs.length === 0) {
          window.location.replace("/dashboard/onboarding")
          return
        }

        const storedClubId = localStorage.getItem("growcrm_active_club_id")
        const storedClub = clubs.find((club) => club.id === storedClubId)
        const memberClubs = clubs.filter((club) => club.role === "MEMBER")
        const adminClubs = clubs.filter((club) => club.role !== "MEMBER")

        if (memberClubs.length > 0) {
          const memberClub = storedClub?.role === "MEMBER" ? storedClub : memberClubs[0]
          localStorage.setItem("growcrm_active_club_id", memberClub.id)
          window.location.replace("/dashboard/member")
          return
        }

        if (adminClubs.length === 0) {
          window.location.replace("/dashboard")
          return
        }

        // Si el administrador ya tiene un club seleccionado (o solo administra uno),
        // no hace falta pedir las reservas de todos los clubes antes de abrir el QR.
        const knownAdminClub = storedClub?.role !== "MEMBER"
          ? storedClub
          : adminClubs.length === 1
            ? adminClubs[0]
            : null
        if (knownAdminClub) {
          localStorage.setItem("growcrm_active_club_id", knownAdminClub.id)
          window.location.replace(`/dashboard/reservas?reserva=${encodeURIComponent(reservationId)}&qrResolved=1`)
          return
        }

        const clubsToSearch = storedClub?.role !== "MEMBER"
          ? [storedClub, ...adminClubs.filter((club) => club.id !== storedClub?.id)].filter((club): club is Club => Boolean(club))
          : adminClubs
        const reservationLists = await Promise.all(clubsToSearch.map(async (club) => {
          try {
            const response = await fetchWithTimeout(`${API_URL}/club/${club.id}/reservations`, {
              headers: { Authorization: `Bearer ${session.access_token}` },
            })
            if (!response.ok) return { club, reservations: [] as Reservation[], failed: true }
            const rows = await response.json().catch(() => [])
            return { club, reservations: Array.isArray(rows) ? rows as Reservation[] : [], failed: false }
          } catch (requestError) {
            return { club, reservations: [] as Reservation[], failed: true, error: requestError }
          }
        }))
        if (!active) return

        const matchingClub = reservationLists.find(({ reservations }) => reservations.some((reservation) => reservation.id === reservationId))?.club
        if (!matchingClub && reservationLists.every(({ failed }) => failed)) {
          const timedOut = reservationLists.find(({ error }) => error instanceof Error)?.error
          throw timedOut instanceof Error
            ? timedOut
            : new Error("No se pudieron consultar las reservas del club. Revisá tu conexión y volvé a intentar.")
        }
        const targetClub = matchingClub || (storedClub?.role !== "MEMBER" ? storedClub : null) || adminClubs[0]
        localStorage.setItem("growcrm_active_club_id", targetClub.id)
        window.location.replace(`/dashboard/reservas?reserva=${encodeURIComponent(reservationId)}&qrResolved=1`)
      } catch (error) {
        console.error("RESERVATION QR ROUTING ERROR:", error)
        if (active) setMessage(error instanceof Error ? error.message : "No se pudo abrir esta reserva.")
      }
    }

    void resolveQrDestination()
    return () => { active = false }
  }, [])

  if (message) {
    return <main className="flex min-h-screen items-center justify-center bg-[#f5faf8] px-5"><section className="w-full max-w-md rounded-3xl bg-white p-7 text-center shadow-lg"><h1 className="text-xl font-bold text-[#092f35]">No se pudo abrir la reserva</h1><p className="mt-2 text-sm text-zinc-600">{message}</p><div className="mt-5 flex flex-wrap justify-center gap-3"><button type="button" onClick={() => window.location.reload()} className="inline-flex rounded-xl bg-emerald-800 px-5 py-3 text-sm font-semibold text-white">Reintentar</button><Link href="/dashboard" className="inline-flex rounded-xl border border-zinc-200 px-5 py-3 text-sm font-semibold text-zinc-700">Ingresar a GrowCRM</Link></div></section></main>
  }

  return <main className="min-h-screen bg-[#f5faf8]"><WaitOverlay open label="Abriendo el QR de la reserva" messages={["Verificando tu sesión y tu rol…", "Buscando la reserva en tu club…"]} /></main>
}
