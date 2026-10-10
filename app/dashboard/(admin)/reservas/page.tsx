"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, CalendarDays, Check, Clock3, Package, ScanLine, X } from "lucide-react"
import { WaitOverlay } from "@/components/ui/wait-overlay"
import ReservationQRScanner from "@/components/dashboard/reservation-qr-scanner"
import { normalizeWhatsAppPhone } from "@/lib/phone"
import { supabase } from "@/lib/supabase"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://growcrm-api-production.up.railway.app"

type ReservationStatus = "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED" | "CANCELLED"

type Reservation = {
  id: string
  quantity: number
  status: ReservationStatus
  createdAt: string
  user: { name: string | null; email: string; phone: string | null }
  product: { id: string; name: string; category: string | null; imageUrl: string | null; salePrice: number | null }
}

const filters: { id: "ALL" | ReservationStatus; label: string }[] = [
  { id: "ALL", label: "Todas" },
  { id: "PENDING", label: "Pendientes" },
  { id: "APPROVED", label: "Aprobadas" },
  { id: "COMPLETED", label: "Entregadas" },
  { id: "REJECTED", label: "Rechazadas" },
  { id: "CANCELLED", label: "Canceladas" },
]

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("PENDING")
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [whatsAppFollowUp, setWhatsAppFollowUp] = useState<{ phone: string; message: string; note: string } | null>(null)
  const [messageCopied, setMessageCopied] = useState(false)

  useEffect(() => {
    void loadReservations()
  }, [])

  async function getAuthContext() {
    const { data: authData, error: authError } = await supabase.auth.getSession()
    const session = authData.session
    if (authError || !session) {
      window.location.href = "/auth/login"
      throw new Error("Tu sesión venció. Volvé a ingresar.")
    }
    const clubId = localStorage.getItem("growcrm_active_club_id")
    if (!clubId) {
      window.location.href = "/dashboard"
      throw new Error("No hay un club seleccionado.")
    }
    return { session, clubId }
  }

  async function loadReservations() {
    setLoading(true)
    setError("")
    try {
      const { session, clubId } = await getAuthContext()
      const response = await fetch(`${API_URL}/club/${clubId}/reservations`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const result = await response.json().catch(() => [])
      if (!response.ok) throw new Error(result.error || "No se pudieron cargar las reservas.")
      const items: Reservation[] = Array.isArray(result) ? result : []
      setReservations(items)
      const requestedId = new URLSearchParams(window.location.search).get("reserva")
      if (requestedId) {
        const requested = items.find((reservation) => reservation.id === requestedId)
        if (requested) setSelectedReservation(requested)
        else setError("No encontramos esa reserva en este club.")
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar las reservas.")
    } finally {
      setLoading(false)
    }
  }

  const handleScan = useCallback((rawValue: string) => {
    let reservationId = rawValue.trim()
    try {
      const parsed = new URL(reservationId)
      reservationId = parsed.searchParams.get("reserva") || reservationId
    } catch { /* Raw reservation IDs are also accepted. */ }
    const reservation = reservations.find((item) => item.id === reservationId)
    setScannerOpen(false)
    if (!reservation) {
      setError("No encontramos esa reserva en este club. Verificá que el código sea correcto.")
      return
    }
    setError("")
    setSelectedReservation(reservation)
    window.history.replaceState(null, "", `/dashboard/reservas?reserva=${encodeURIComponent(reservation.id)}`)
    if (reservation.status === "PENDING" || reservation.status === "APPROVED") {
      void updateReservation(reservation.id, "COMPLETED")
    } else if (reservation.status === "COMPLETED") {
      setError("Esta reserva ya figura como entregada.")
    } else {
      setError(`Esta reserva está ${reservationStatusLabel(reservation.status).toLowerCase()} y no se puede marcar como entregada.`)
    }
  }, [reservations])

  async function updateReservation(reservationId: string, status: "APPROVED" | "REJECTED" | "COMPLETED") {
    if (processingId) return
    const currentReservation = reservations.find((item) => item.id === reservationId) || selectedReservation
    setProcessingId(reservationId)
    setError("")
    setWhatsAppFollowUp(null)
    setMessageCopied(false)
    try {
      const { session, clubId } = await getAuthContext()
      const response = await fetch(`${API_URL}/club/${clubId}/reservations/${reservationId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || "No se pudo actualizar la reserva.")
      setReservations((current) => current.map((reservation) => reservation.id === reservationId ? result : reservation))
      setSelectedReservation((current) => current?.id === reservationId ? result : current)
      if (status === "APPROVED" && currentReservation) {
        const name = result.user?.name || currentReservation.user.name || ""
        const message = `Hola${name ? ` ${name}` : ""}, tu pedido de ${result.product.name} (${result.quantity} ${result.quantity === 1 ? "unidad" : "unidades"}) fue aprobado y está listo para retirar. Presentá el QR de tu reserva al retirarlo.`
        const rawPhone = result.user?.phone || currentReservation.user.phone || ""
        const phone = normalizeWhatsAppPhone(rawPhone) || ""
        const note = phone
          ? "La reserva ya está aprobada. Tocá “Abrir WhatsApp” para preparar el aviso. Si no se abre, puede que WhatsApp no esté instalado o que WhatsApp Web no tenga una sesión iniciada."
          : "La reserva quedó aprobada, pero el teléfono del socio no tiene un código de país válido para abrir WhatsApp. Podés copiar el mensaje y avisarle por otro medio."
        setWhatsAppFollowUp({ phone, message, note })
      }
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "No se pudo actualizar la reserva.")
    } finally {
      setProcessingId(null)
    }
  }

  const visibleReservations = useMemo(
    () => filter === "ALL" ? reservations : reservations.filter((reservation) => reservation.status === filter),
    [reservations, filter]
  )
  const pendingCount = reservations.filter((reservation) => reservation.status === "PENDING").length

  return (
    <main className="min-h-screen bg-[#f8faf9] text-[#123238]">
      <WaitOverlay open={loading || Boolean(processingId)} label={processingId ? "Actualizando reserva" : "Cargando reservas"} messages={processingId ? ["Actualizando el estado…", "Ajustando el stock del catálogo…"] : ["Buscando solicitudes de socios…", "Preparando la bandeja del club…"]} />
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/dashboard/admin" className="inline-flex items-center gap-3 text-sm font-semibold text-zinc-600 hover:text-emerald-800"><ArrowLeft className="h-4 w-4" /> Volver al catálogo</Link>
          <span className="hidden text-sm font-medium text-zinc-500 sm:block">Administración del club</span>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-11">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-emerald-700">Gestión del club</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Reservas</h1>
            <p className="mt-2 text-zinc-500">Revisá las solicitudes de los socios y coordiná la entrega.</p>
          </div>
          <span className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-800">{pendingCount} pendientes</span>
        </div>

        <button type="button" onClick={() => setScannerOpen(true)} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-900"><ScanLine className="h-4 w-4" /> Escanear QR de reserva</button>

        {error && <p role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-800">{error}</p>}

        {whatsAppFollowUp && <section role="status" className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950 sm:p-5"><h2 className="font-bold">Pedido aprobado y listo para retirar</h2><p className="mt-1 text-sm">{whatsAppFollowUp.note}</p><blockquote className="mt-3 rounded-xl bg-white/80 p-3 text-sm">{whatsAppFollowUp.message}</blockquote><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => { void navigator.clipboard.writeText(whatsAppFollowUp.message).then(() => setMessageCopied(true)).catch(() => setError("No se pudo copiar automáticamente. Seleccioná el mensaje para copiarlo.")) }} className="rounded-xl border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold">{messageCopied ? "Mensaje copiado" : "Copiar mensaje"}</button>{whatsAppFollowUp.phone && <a href={`https://wa.me/${whatsAppFollowUp.phone}?text=${encodeURIComponent(whatsAppFollowUp.message)}`} target="_blank" rel="noreferrer" className="rounded-xl bg-emerald-800 px-4 py-2 text-sm font-semibold text-white">Abrir WhatsApp</a>}<button type="button" onClick={() => setWhatsAppFollowUp(null)} className="rounded-xl px-3 py-2 text-sm font-semibold text-emerald-900">Cerrar</button></div></section>}

        <div className="mt-7 flex gap-2 overflow-x-auto pb-2">
          {filters.map((item) => {
            const count = item.id === "ALL" ? reservations.length : reservations.filter((reservation) => reservation.status === item.id).length
            return <button key={item.id} type="button" onClick={() => setFilter(item.id)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${filter === item.id ? "bg-emerald-900 text-white" : "border border-zinc-200 bg-white text-zinc-600 hover:border-emerald-300"}`}>{item.label} <span className={`ml-1 rounded-full px-2 py-0.5 text-xs ${filter === item.id ? "bg-white/15" : "bg-zinc-100"}`}>{count}</span></button>
          })}
        </div>

        {visibleReservations.length ? (
          <div className="mt-4 grid gap-4">
            {visibleReservations.map((reservation) => (
              <article key={reservation.id} className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-4">
                    {reservation.product.imageUrl ? <img src={reservation.product.imageUrl} alt="" className="h-16 w-16 rounded-2xl object-cover" /> : <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800"><Package className="h-7 w-7" /></div>}
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-bold">{reservation.product.name}</h2>
                      <p className="mt-1 text-sm text-zinc-500">{reservation.product.category || "Producto"} · {reservation.quantity} {reservation.quantity === 1 ? "unidad" : "unidades"}</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${reservationStatusClass(reservation.status)}`}>{reservationStatusLabel(reservation.status)}</span>
                </div>
                <div className="mt-5 grid gap-4 border-t border-zinc-100 pt-4 sm:grid-cols-[1fr_auto] sm:items-end">
                  <div className="grid gap-1 text-sm text-zinc-600">
                    <p><span className="font-semibold text-zinc-800">Socio:</span> {reservation.user.name || reservation.user.email} · {reservation.user.email}</p>
                    {reservation.user.phone && <p><span className="font-semibold text-zinc-800">Teléfono:</span> {reservation.user.phone}</p>}
                    <p className="inline-flex items-center gap-1.5 text-xs text-zinc-400"><CalendarDays className="h-3.5 w-3.5" /> {new Date(reservation.createdAt).toLocaleString("es-UY")}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {reservation.status === "PENDING" && <>
                      <button type="button" disabled={Boolean(processingId)} onClick={() => void updateReservation(reservation.id, "REJECTED")} className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 disabled:opacity-50"><X className="h-4 w-4" /> Rechazar</button>
                      <button type="button" disabled={Boolean(processingId)} onClick={() => void updateReservation(reservation.id, "APPROVED")} className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900 disabled:opacity-50"><Check className="h-4 w-4" /> Aprobar</button>
                    </>}
                    {reservation.status === "APPROVED" && <button type="button" disabled={Boolean(processingId)} onClick={() => void updateReservation(reservation.id, "COMPLETED")} className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900 disabled:opacity-50"><Check className="h-4 w-4" /> Marcar entregada</button>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-3xl border border-dashed border-emerald-200 bg-white px-6 py-16 text-center">
            <Clock3 className="mx-auto h-9 w-9 text-emerald-700/70" />
            <h2 className="mt-4 text-lg font-bold">{filter === "PENDING" ? "No hay solicitudes pendientes" : "No hay reservas en esta vista"}</h2>
            <p className="mt-2 text-sm text-zinc-500">Cuando un socio envíe una reserva, va a aparecer acá.</p>
          </div>
        )}
      </div>
      {scannerOpen && <ReservationQRScanner onScan={handleScan} onClose={() => setScannerOpen(false)} />}
      {selectedReservation && <div className="fixed inset-0 z-40 flex items-center justify-center bg-zinc-950/50 p-4" role="dialog" aria-modal="true" aria-labelledby="reservation-detail-title"><article className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold text-emerald-700">Detalle de reserva</p><h2 id="reservation-detail-title" className="mt-1 text-2xl font-bold">{selectedReservation.product.name}</h2></div><button type="button" aria-label="Cerrar detalle" onClick={() => { setSelectedReservation(null); window.history.replaceState(null, "", "/dashboard/reservas") }} className="rounded-full p-2 hover:bg-zinc-100"><X className="h-5 w-5" /></button></div><p className="mt-2 text-sm text-zinc-500">{selectedReservation.product.category || "Producto"} · {selectedReservation.quantity} {selectedReservation.quantity === 1 ? "unidad" : "unidades"}</p><div className="mt-5 rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-700"><p><strong>Socio:</strong> {selectedReservation.user.name || selectedReservation.user.email}</p><p className="mt-1"><strong>Email:</strong> {selectedReservation.user.email}</p>{selectedReservation.user.phone && <p className="mt-1"><strong>Teléfono:</strong> {selectedReservation.user.phone}</p>}<p className="mt-1"><strong>Estado:</strong> {reservationStatusLabel(selectedReservation.status)}</p><p className="mt-1 text-xs text-zinc-400">{new Date(selectedReservation.createdAt).toLocaleString("es-UY")}</p></div><div className="mt-5 flex flex-wrap justify-end gap-2">{selectedReservation.status === "PENDING" && <><button type="button" disabled={Boolean(processingId)} onClick={() => void updateReservation(selectedReservation.id, "REJECTED")} className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold">Rechazar</button><button type="button" disabled={Boolean(processingId)} onClick={() => void updateReservation(selectedReservation.id, "APPROVED")} className="rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white">Aprobar</button></>}{selectedReservation.status === "APPROVED" && <button type="button" disabled={Boolean(processingId)} onClick={() => void updateReservation(selectedReservation.id, "COMPLETED")} className="rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white">Marcar entregada</button>}</div></article></div>}
    </main>
  )
}

function reservationStatusLabel(status: ReservationStatus) {
  return { PENDING: "Pendiente", APPROVED: "Aprobada", REJECTED: "Rechazada", COMPLETED: "Entregada", CANCELLED: "Cancelada" }[status]
}

function reservationStatusClass(status: ReservationStatus) {
  if (status === "APPROVED" || status === "COMPLETED") return "bg-emerald-50 text-emerald-800"
  if (status === "REJECTED" || status === "CANCELLED") return "bg-zinc-100 text-zinc-600"
  return "bg-amber-50 text-amber-800"
}
