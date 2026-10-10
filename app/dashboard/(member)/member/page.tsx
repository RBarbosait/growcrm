"use client"

import { useEffect, useMemo, useState } from "react"
import type { FormEvent } from "react"
import { useRouter } from "next/navigation"
import { BadgeCheck, Building2, Gift, LogOut, Package, Search, Sparkles, Tag, X, ShoppingBag, Pencil } from "lucide-react"
import { WaitOverlay } from "@/components/ui/wait-overlay"
import ReservationQR from "@/components/dashboard/reservation-qr"
import { normalizeWhatsAppPhone } from "@/lib/phone"
import { supabase } from "@/lib/supabase"

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://growcrm-api-production.up.railway.app"

type ClubProduct = {
  id: string
  name: string
  category: string | null
  brand: string | null
  imageUrl: string | null
  salePrice: number | null
  stock: number
  minStock: number
  description: string | null
  attributes: Record<string, unknown> | null
}

type ClubBenefit = {
  id: string
  title: string
  description: string
  imageUrl: string | null
  linkUrl: string | null
}

type MemberReservation = {
  id: string
  quantity: number
  status: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED" | "CANCELLED"
  createdAt: string
  product: { id: string; name: string; category: string | null; imageUrl: string | null; salePrice: number | null }
}

type MemberDashboardData = {
  user: { name: string | null; email: string; phone: string | null }
  membership: { id: string; active: boolean }
  club: {
    id: string
    name: string
    description: string | null
    template: { name: string; slug: string }
  }
  products: ClubProduct[]
  benefits: ClubBenefit[]
  reservations: MemberReservation[]
}

const loadingMessages = [
  "Preparando tu espacio de socio...",
  "Cargando el catálogo de tu club...",
  "Reuniendo tus beneficios...",
]

export default function MemberDashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<MemberDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("Todas")
  const [selectedProduct, setSelectedProduct] = useState<ClubProduct | null>(null)
  const [reservationNotice, setReservationNotice] = useState("")
  const [reservationConfirmation, setReservationConfirmation] = useState<MemberReservation | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [profileName, setProfileName] = useState("")
  const [profilePhone, setProfilePhone] = useState("")
  const [profileError, setProfileError] = useState("")
  const [savingProfile, setSavingProfile] = useState(false)
  const [submittingReservation, setSubmittingReservation] = useState(false)
  const [reservationActionId, setReservationActionId] = useState<string | null>(null)
  const [reservationActionError, setReservationActionError] = useState("")

  useEffect(() => {
    async function loadMemberDashboard() {
      try {
        const { data: authData, error: authError } = await supabase.auth.getSession()
        const session = authData.session

        if (authError || !session) {
          router.replace("/auth/login")
          return
        }

        const clubId = localStorage.getItem("growcrm_active_club_id")
        if (!clubId) {
          router.replace("/dashboard")
          return
        }

        const response = await fetch(
          `${API_URL}/club/${clubId}/member-dashboard`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        )

        const result = await response.json().catch(() => ({}))
        if (!response.ok) {
          throw new Error(
            response.status === 403 || response.status === 401
              ? "Tu cuenta no tiene una membresía activa en este club."
              : result.error || "No se pudo cargar el espacio del socio."
          )
        }

        setData(result)
      } catch (loadError) {
        console.error("MEMBER DASHBOARD ERROR:", loadError)
        setError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudo cargar el espacio del socio."
        )
      } finally {
        setLoading(false)
      }
    }

    void loadMemberDashboard()
  }, [router])

  const categories = useMemo(
    () => [
      "Todas",
      ...Array.from(
        new Set(data?.products.map((product) => product.category).filter(Boolean) as string[])
      ),
    ],
    [data?.products]
  )

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase()
    return (data?.products || []).filter((product) => {
      const matchesCategory = category === "Todas" || product.category === category
      const matchesSearch =
        !term ||
        product.name.toLowerCase().includes(term) ||
        product.category?.toLowerCase().includes(term) ||
        product.brand?.toLowerCase().includes(term) ||
        product.description?.toLowerCase().includes(term)
      return matchesCategory && matchesSearch
    })
  }, [data?.products, category, search])

  async function handleLogout() {
    await supabase.auth.signOut()
    localStorage.removeItem("growcrm_active_club_id")
    router.replace("/auth/login")
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8f6f1]">
        <WaitOverlay open label="Cargando el espacio del socio" messages={loadingMessages} />
      </main>
    )
  }

  if (error || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f6f1] px-5">
        <section className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
            <Building2 className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-xl font-bold text-[#092f35]">No pudimos abrir tu club</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-500">{error || "No se encontraron los datos de tu membresía."}</p>
          <button
            type="button"
            onClick={() => router.replace("/dashboard")}
            className="mt-6 rounded-xl bg-[#006b55] px-5 py-3 text-sm font-semibold text-white hover:bg-[#005c49]"
          >
            Volver
          </button>
        </section>
      </main>
    )
  }

  const activeClubId = data.club.id

  async function saveMemberProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedPhone = normalizeWhatsAppPhone(profilePhone)
    if (!normalizedPhone) {
      setProfileError("Ingresá un número válido. Podés usar tu número local de Uruguay o incluir el código de país, por ejemplo +598 99 123 456.")
      return
    }
    setSavingProfile(true)
    setProfileError("")
    try {
      const { data: authData, error: authError } = await supabase.auth.getSession()
      const session = authData.session
      if (authError || !session) throw new Error("Tu sesión venció. Volvé a ingresar.")

      const response = await fetch(`${API_URL}/club/${activeClubId}/member-profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: profileName, phone: normalizedPhone }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || "No se pudieron guardar tus datos.")

      setData((current) => current ? { ...current, user: { ...current.user, name: result.user.name, phone: result.user.phone } } : current)
      setProfileOpen(false)
    } catch (saveError) {
      setProfileError(saveError instanceof Error ? saveError.message : "No se pudieron guardar tus datos.")
    } finally {
      setSavingProfile(false)
    }
  }

  async function createReservation(quantity: number) {
    if (!data || !selectedProduct || submittingReservation) return
    if (!normalizeWhatsAppPhone(data.user.phone || "")) {
      setProfileName(data.user.name || "")
      setProfilePhone(data.user.phone || "")
      setProfileError("Para recibir avisos sobre tu reserva, primero agregá un teléfono válido para WhatsApp.")
      setProfileOpen(true)
      setReservationNotice("Completá tu teléfono para continuar con la reserva.")
      return
    }
    setSubmittingReservation(true)
    setReservationNotice("")
    try {
      const { data: authData, error: authError } = await supabase.auth.getSession()
      const session = authData.session
      if (authError || !session) throw new Error("Tu sesión venció. Volvé a ingresar.")

      const response = await fetch(`${API_URL}/club/${activeClubId}/reservations`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ productId: selectedProduct.id, quantity }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || "No se pudo enviar la reserva.")

      const createdReservation = result.reservation as MemberReservation
      setReservationConfirmation(createdReservation)
      setData((current) => current ? {
        ...current,
        products: current.products.map((product) => product.id === selectedProduct.id ? { ...product, stock: result.stock } : product),
        reservations: [createdReservation, ...current.reservations],
      } : current)
      setSelectedProduct((current) => current ? { ...current, stock: result.stock } : current)
      setReservationNotice("¡Listo! Tu reserva quedó enviada al club.")
    } catch (reservationError) {
      setReservationNotice(reservationError instanceof Error ? reservationError.message : "No se pudo enviar la reserva.")
    } finally {
      setSubmittingReservation(false)
    }
  }

  async function cancelReservation(reservationId: string) {
    if (reservationActionId) return
    setReservationActionId(reservationId)
    setReservationActionError("")
    try {
      const { data: authData, error: authError } = await supabase.auth.getSession()
      const session = authData.session
      if (authError || !session) throw new Error("Tu sesión venció. Volvé a ingresar.")

      const response = await fetch(`${API_URL}/club/${activeClubId}/reservations/${reservationId}/cancel`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || "No se pudo cancelar la reserva.")

      setData((current) => current ? {
        ...current,
        reservations: current.reservations.map((reservation) => reservation.id === reservationId ? { ...reservation, status: "CANCELLED" } : reservation),
        products: current.products.map((product) => product.id === result.reservation.productId ? { ...product, stock: product.stock + result.reservation.quantity } : product),
      } : current)
    } catch (cancelError) {
      setReservationActionError(cancelError instanceof Error ? cancelError.message : "No se pudo cancelar la reserva.")
    } finally {
      setReservationActionId(null)
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f6f1] text-[#172c29]">
      <header className="sticky top-0 z-30 border-b border-emerald-950/5 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <a href="#inicio" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#006b55] text-white shadow-sm">
              <Building2 className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-bold leading-tight">{data.club.name}</span>
              <span className="block text-xs text-zinc-400">Comunidad del club</span>
            </span>
          </a>

          <nav className="hidden items-center gap-7 text-sm font-semibold text-zinc-500 md:flex">
            <a href="#catalogo" className="transition hover:text-[#007f63]">Catálogo</a>
            <a href="#mis-reservas" className="transition hover:text-[#007f63]">Mis reservas</a>
            <a href="#beneficios" className="transition hover:text-[#007f63]">Beneficios</a>
            <a href="#membresia" className="transition hover:text-[#007f63]">Mi membresía</a>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">{data.user.name || data.user.email}</p>
              <p className="text-xs text-zinc-400">Socio activo</p>
            </div>
            <button
              type="button"
              onClick={() => { setProfileName(data.user.name || ""); setProfilePhone(data.user.phone || ""); setProfileError(""); setProfileOpen(true) }}
              aria-label="Editar mis datos"
              title="Editar mis datos"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-800"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => void handleLogout()}
              aria-label="Cerrar sesión"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-800"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 pb-16 pt-7 sm:px-8 sm:pt-10">
        <section id="inicio" className="relative isolate mt-2 min-h-[300px] overflow-hidden rounded-[30px] bg-[#eee5d7] shadow-[0_18px_45px_-30px_rgba(26,45,35,.5)] sm:min-h-[320px]">
          <img src="/member-clubs-mural.png" alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover object-center" />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#f5eee3]/95 via-[#f5eee3]/70 to-transparent" />
          <div className="relative z-10 flex min-h-[300px] items-center px-6 py-9 sm:min-h-[320px] sm:px-11 sm:py-12">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-900/10 bg-white/75 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.14em] text-emerald-900 backdrop-blur-sm">
                <Sparkles className="h-4 w-4" />
                Bienvenido a {data.club.name}
              </div>
              <h1 className="mt-5 max-w-xl font-serif text-4xl font-semibold leading-[1.08] tracking-tight text-[#172c29] sm:text-6xl">
                Tu club, a tu manera.
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-6 text-[#4d5b55] sm:text-base sm:leading-7">
                Un espacio para descubrir y disfrutar todo lo que tu comunidad preparó para vos.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href="#catalogo" className="inline-flex items-center rounded-xl bg-[#174f43] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#103f35]">Explorar catálogo <span className="ml-2" aria-hidden="true">→</span></a>
                <a href="#beneficios" className="rounded-xl border border-[#174f43]/20 bg-white/70 px-5 py-3 text-sm font-semibold text-[#174f43] transition hover:bg-white">Ver beneficios</a>
              </div>
              <p className="mt-4 text-xs font-medium text-[#52635a]">Una selección de {data.club.name}</p>
            </div>
          </div>
        </section>

        <section id="membresia" className="scroll-mt-24 mt-4 grid gap-3 rounded-2xl border border-[#e9e3d8] bg-white px-5 py-4 shadow-sm sm:grid-cols-[1fr_1.5fr_auto] sm:items-center sm:px-7">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e9f2ec] text-[#26765f]"><BadgeCheck className="h-5 w-5" /></span>
            <div>
              <p className="text-sm font-bold text-[#213a34]">Membresía activa</p>
              <p className="text-xs text-zinc-500">Socio de {data.club.name}</p>
            </div>
          </div>
          {data.club.description ? (
            <p className="line-clamp-2 text-sm leading-6 text-zinc-600">{data.club.description}</p>
          ) : (
            <p className="text-sm text-zinc-500">Tu comunidad, tus beneficios.</p>
          )}
          <a href="#beneficios" className="text-sm font-semibold text-[#26765f] transition hover:text-[#174f43]">{data.benefits.length} {data.benefits.length === 1 ? "beneficio" : "beneficios"} <span aria-hidden="true">→</span></a>
        </section>

        <section id="catalogo" className="scroll-mt-24 pt-12">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold text-emerald-700">Descubrí lo que hay para vos</p>
              <h2 className="mt-1 text-3xl font-bold tracking-tight">Catálogo del club</h2>
              <p className="mt-2 text-sm text-zinc-500">Una selección preparada por tu comunidad.</p>
            </div>
            <label className="relative block w-full sm:max-w-sm">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar en el catálogo..."
                className="h-12 w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
            </label>
          </div>

          {categories.length > 1 && (
            <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${category === item ? "bg-[#006b55] text-white" : "border border-zinc-200 bg-white text-zinc-600 hover:border-emerald-300"}`}
                >
                  {item}
                </button>
              ))}
            </div>
          )}

          {filteredProducts.length ? (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <button key={product.id} type="button" onClick={() => { setSelectedProduct(product); setReservationNotice(""); setReservationConfirmation(null) }} className="group w-full overflow-hidden rounded-[28px] border border-zinc-200/80 bg-white text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-950/5 focus:outline-none focus:ring-4 focus:ring-emerald-100">
                  <div className="relative aspect-[1.55/1] overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-100">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-emerald-700/70"><Package className="h-12 w-12" /></div>
                    )}
                    {product.category && <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-emerald-800 shadow-sm backdrop-blur">{product.category}</span>}
                  </div>
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        {product.brand && <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{product.brand}</p>}
                        <h3 className="mt-1 text-xl font-bold tracking-tight">{product.name}</h3>
                      </div>
                      <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${product.stock > 0 ? "bg-emerald-500" : "bg-amber-400"}`} title={product.stock > 0 ? "Disponible" : "Consultar disponibilidad"} />
                    </div>
                    {product.description && <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-500">{product.description}</p>}
                    <div className="mt-5 flex items-end justify-between border-t border-zinc-100 pt-4">
                      <div>
                        <p className="text-xs text-zinc-400">Precio para socios</p>
                        <p className="mt-1 text-lg font-bold text-[#006b55]">
                          {product.salePrice == null ? "Consultar" : formatPrice(product.salePrice)}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
                        <Tag className="h-3.5 w-3.5" />
                        {product.stock > 0 ? "Disponible" : "Consultar"}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-dashed border-emerald-200 bg-white px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><Package className="h-7 w-7" /></div>
              <h3 className="mt-4 text-lg font-bold">{data.products.length ? "No encontramos resultados" : "El catálogo se está preparando"}</h3>
              <p className="mt-2 text-sm text-zinc-500">{data.products.length ? "Probá con otra búsqueda o categoría." : "Pronto vas a encontrar acá las opciones de tu club."}</p>
            </div>
          )}
        </section>

        <section id="mis-reservas" className="scroll-mt-24 pt-12">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-emerald-700">Seguimiento</p>
              <h2 className="mt-1 text-3xl font-bold tracking-tight">Mis reservas</h2>
              <p className="mt-2 text-sm text-zinc-500">Consultá el estado de tus solicitudes al club.</p>
            </div>
            <span className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-zinc-600 shadow-sm">{data.reservations.length} {data.reservations.length === 1 ? "solicitud" : "solicitudes"}</span>
          </div>
          {reservationActionError && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{reservationActionError}</p>}
          {data.reservations.length ? (
            <div className="mt-5 grid gap-3">
              {data.reservations.map((reservation) => (
                <article key={reservation.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#e9e3d8] bg-white p-4 shadow-sm sm:px-5">
                  <div className="flex min-w-0 items-center gap-4">
                    {reservation.product.imageUrl ? <img src={reservation.product.imageUrl} alt="" className="h-14 w-14 rounded-xl object-cover" /> : <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800"><Package className="h-6 w-6" /></span>}
                    <div className="min-w-0">
                      <p className="truncate font-bold text-[#213a34]">{reservation.product.name}</p>
                      <p className="mt-1 text-sm text-zinc-500">{formatQuantity(reservation.quantity)} {reservation.product.category?.toLowerCase().includes("flor") ? "g" : reservation.quantity === 1 ? "unidad" : "unidades"} · {new Date(reservation.createdAt).toLocaleDateString("es-UY")}</p>
                    </div>
                  </div>
                  <ReservationQR reservationId={reservation.id} size={112} />
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${reservationStatusClass(reservation.status)}`}>{reservationStatusLabel(reservation.status)}</span>
                    {reservation.status === "PENDING" && <button type="button" disabled={reservationActionId === reservation.id} onClick={() => void cancelReservation(reservation.id)} className="text-sm font-semibold text-zinc-500 underline-offset-4 hover:text-red-700 hover:underline disabled:opacity-50">{reservationActionId === reservation.id ? "Cancelando…" : "Cancelar"}</button>}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-3xl border border-dashed border-emerald-200 bg-white px-6 py-10 text-center text-sm text-zinc-500">Todavía no enviaste reservas. Cuando hagas una, vas a poder seguirla desde acá.</div>
          )}
        </section>

        <section id="beneficios" className="scroll-mt-24 pt-14">
          <div className="overflow-hidden rounded-[30px] bg-[#eeeae1] p-7 sm:p-10">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800"><Gift className="h-4 w-4" /> Un poquito más por ser parte</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight">Beneficios para vos</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-600">Descubrí las experiencias y ventajas que tu club preparó para sus socios.</p>
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800/60">Exclusivo para miembros</span>
            </div>

            {data.benefits.length ? (
              <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {data.benefits.map((benefit) => (
                  <article key={benefit.id} className="overflow-hidden rounded-3xl border border-white bg-white shadow-sm">
                    {benefit.imageUrl && <img src={benefit.imageUrl} alt={benefit.title} className="h-44 w-full object-cover" />}
                    <div className="p-6">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Sparkles className="h-5 w-5" /></div>
                      <h3 className="mt-4 text-lg font-bold">{benefit.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-zinc-500">{benefit.description}</p>
                      {benefit.linkUrl && <a href={benefit.linkUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex text-sm font-bold text-emerald-800 hover:text-emerald-950">Conocer más <span aria-hidden="true" className="ml-1">↗</span></a>}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-7 rounded-3xl border border-white/80 bg-white/70 px-6 py-10 text-center">
                <Gift className="mx-auto h-8 w-8 text-emerald-700/70" />
                <p className="mt-3 font-semibold">Muy pronto, novedades para socios</p>
                <p className="mt-1 text-sm text-zinc-500">El club todavía no publicó beneficios. Volvé a visitarnos pronto.</p>
              </div>
            )}
          </div>
        </section>

        <footer className="mt-12 border-t border-emerald-950/10 pt-6 text-center text-xs text-zinc-400">
          {data.club.name} · Tu comunidad en GrowCRM
        </footer>
      </div>

      {profileOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="member-profile-title">
          <button type="button" aria-label="Cerrar edición de perfil" onClick={() => setProfileOpen(false)} className="absolute inset-0 bg-[#062f2a]/55 backdrop-blur-sm" />
          <form onSubmit={saveMemberProfile} className="relative z-10 w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-700">Mi cuenta</p>
                <h2 id="member-profile-title" className="mt-1 text-2xl font-bold text-[#092f35]">Mis datos</h2>
              </div>
              <button type="button" onClick={() => setProfileOpen(false)} aria-label="Cerrar" className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100"><X className="h-5 w-5" /></button>
            </div>
            <label className="mt-6 block text-sm font-semibold text-zinc-700">Nombre
              <input required maxLength={100} value={profileName} onChange={(event) => setProfileName(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-zinc-200 px-4 font-normal outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" />
            </label>
            <label className="mt-4 block text-sm font-semibold text-zinc-700">Email
              <input readOnly value={data.user.email} className="mt-2 h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 font-normal text-zinc-500" />
              <span className="mt-1 block text-xs font-normal text-zinc-400">Para cambiar el email, contactá al administrador del club.</span>
            </label>
            <label className="mt-4 block text-sm font-semibold text-zinc-700">Teléfono
              <input type="tel" autoComplete="tel" inputMode="tel" required maxLength={40} placeholder="099 123 456 o +598 99 123 456" value={profilePhone} onChange={(event) => setProfilePhone(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-zinc-200 px-4 font-normal outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" />
              <span className="mt-1 block text-xs font-normal text-zinc-400">Lo usamos para avisarte por WhatsApp sobre tus reservas. Aceptamos números locales de Uruguay o con código de país.</span>
            </label>
            {profileError && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{profileError}</p>}
            <button type="submit" disabled={savingProfile} className="mt-6 w-full rounded-xl bg-[#006b55] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#005742] disabled:opacity-60">{savingProfile ? "Guardando…" : "Guardar cambios"}</button>
          </form>
        </div>
      )}

      {selectedProduct && (
        <MemberProductModal
          product={selectedProduct}
          notice={reservationNotice}
          submitting={submittingReservation}
          confirmation={reservationConfirmation}
          onReserve={createReservation}
          onClose={() => { setSelectedProduct(null); setReservationNotice(""); setReservationConfirmation(null) }}
        />
      )}
    </main>
  )
}

function MemberProductModal({
  product,
  notice,
  submitting,
  confirmation,
  onReserve,
  onClose,
}: {
  product: ClubProduct
  notice: string
  submitting: boolean
  confirmation: MemberReservation | null
  onReserve: (quantity: number) => void
  onClose: () => void
}) {
  const [packageCount, setPackageCount] = useState(1)
  const stock = Math.max(0, product.stock || 0)
  const threshold = Math.max(1, product.minStock || 5)
  const stockUnit = typeof product.attributes?.stockUnit === "string" && product.attributes.stockUnit.trim()
    ? product.attributes.stockUnit.trim()
    : "unidad"
  const unitLabels: Record<string, { singular: string; plural: string; short: string }> = {
    g: { singular: "gramo", plural: "gramos", short: "g" },
    kg: { singular: "kilogramo", plural: "kilogramos", short: "kg" },
    ml: { singular: "mililitro", plural: "mililitros", short: "ml" },
    l: { singular: "litro", plural: "litros", short: "l" },
    unidad: { singular: "unidad", plural: "unidades", short: "unid." },
  }
  const unit = unitLabels[stockUnit] || { singular: stockUnit, plural: stockUnit, short: stockUnit }
  const stockPercent = stock === 0 ? 0 : stock < threshold ? 28 : stock < threshold * 2 ? 62 : 100
  const stockLabel = stock === 0 ? "Sin disponibilidad" : stock < threshold ? "Pocas unidades" : "Disponible para socios"
  const isFlower = product.category?.toLowerCase().includes("flor")
  const configuredWeights = Array.isArray(product.attributes?.["pesos-disponibles"])
    ? (product.attributes["pesos-disponibles"] as unknown[]).filter((weight): weight is number => typeof weight === "number" && Number.isFinite(weight) && weight > 0).sort((a, b) => a - b)
    : []
  const weightOptions = isFlower && configuredWeights.length ? configuredWeights : [1]
  const [packageWeight, setPackageWeight] = useState(weightOptions[0])
  const selectedWeight = weightOptions.includes(packageWeight) ? packageWeight : weightOptions[0]
  const quantity = Number((packageCount * selectedWeight).toFixed(2))
  const maxPackages = Math.floor((stock + 1e-9) / selectedWeight)

  useEffect(() => {
    if (!weightOptions.includes(packageWeight)) {
      setPackageWeight(weightOptions[0])
      setPackageCount(1)
    }
  }, [packageWeight, weightOptions])

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose()
    }
    document.addEventListener("keydown", closeOnEscape)
    return () => document.removeEventListener("keydown", closeOnEscape)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6" role="dialog" aria-modal="true" aria-label={`Detalle de ${product.name}`}>
      <button type="button" aria-label="Cerrar detalle" onClick={onClose} className="absolute inset-0 bg-[#062f2a]/55 backdrop-blur-sm" />
      <section className="relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-[30px] bg-white shadow-2xl shadow-emerald-950/30">
        <div className="relative h-52 shrink-0 overflow-hidden bg-gradient-to-br from-emerald-100 via-teal-50 to-emerald-200 sm:h-64">
          {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-emerald-700/60"><Package className="h-16 w-16" /></div>}
          <div className="absolute inset-0 bg-gradient-to-t from-[#062f2a]/65 via-transparent to-black/10" />
          {product.category && <span className="absolute bottom-5 left-6 rounded-full border border-white/30 bg-white/90 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-emerald-900 shadow-sm">{product.category}</span>}
          <button type="button" aria-label="Cerrar" onClick={onClose} className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-zinc-700 shadow-sm transition hover:bg-white"><X className="h-5 w-5" /></button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                {product.brand && <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">{product.brand}</p>}
                <h2 className="mt-1 text-3xl font-bold tracking-tight text-[#092f35] sm:text-4xl">{product.name}</h2>
              </div>
              <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-right">
                <p className="text-xs font-medium text-emerald-800/65">Precio para socios</p>
                <p className="mt-0.5 text-2xl font-extrabold text-[#006b55]">{product.salePrice == null ? "Consultar" : formatPrice(product.salePrice)}</p>
              </div>
            </div>

            {product.description && <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-600">{product.description}</p>}

            <div className="mt-7 rounded-2xl border border-zinc-100 bg-zinc-50/80 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-[#092f35]">Disponibilidad</p>
                  <p className={`mt-1 text-sm font-medium ${stock === 0 ? "text-zinc-500" : stock < threshold ? "text-amber-700" : "text-emerald-700"}`}>{stockLabel}</p>
                </div>
                <span className="text-xs font-semibold text-zinc-500">{formatQuantity(stock)} {unit.short}</span>
              </div>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-zinc-200">
                <div className={`h-full rounded-full transition-all ${stock === 0 ? "bg-zinc-300" : stock < threshold ? "bg-amber-400" : "bg-emerald-500"}`} style={{ width: `${stockPercent}%` }} />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-2xl border border-zinc-100 px-5 py-4">
              <div>
                  <p className="text-sm font-bold text-[#092f35]">Cantidad a solicitar</p>
                  <p className="mt-1 text-xs text-zinc-500">Stock disponible: {formatQuantity(stock)} {stock === 1 ? unit.singular : unit.plural}</p>
                  {product.minStock > 0 && <p className="mt-1 text-xs text-zinc-400">Nivel mínimo de stock: {formatQuantity(product.minStock)} {product.minStock === 1 ? unit.singular : unit.plural}</p>}
                  {isFlower && <p className="mt-1 text-xs text-zinc-500">Se vende en múltiplos de {formatQuantity(selectedWeight)} g</p>}
              </div>
              <div className="flex items-center gap-3">
                <button type="button" aria-label={`Restar ${formatQuantity(selectedWeight)} ${unit.short}`} disabled={packageCount <= 1} onClick={() => setPackageCount((current) => Math.max(1, current - 1))} className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-lg font-semibold disabled:opacity-40">−</button>
                <span className="min-w-10 text-center font-bold">{quantity} <span className="text-xs font-medium text-zinc-500">{unit.short}</span></span>
                <button type="button" aria-label={`Sumar ${formatQuantity(selectedWeight)} ${unit.short}`} disabled={packageCount >= maxPackages} onClick={() => setPackageCount((current) => Math.min(maxPackages, current + 1))} className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-lg font-semibold disabled:opacity-40">+</button>
              </div>
            </div>
            {isFlower && weightOptions.length > 1 && <div className="mt-4"><p className="mb-2 text-sm font-semibold text-[#092f35]">Peso por paquete</p><div className="flex flex-wrap gap-2">{weightOptions.map((weight) => <button key={weight} type="button" onClick={() => { setPackageWeight(weight); setPackageCount(1) }} className={`rounded-full border px-4 py-2 text-sm font-semibold ${selectedWeight === weight ? "border-emerald-700 bg-emerald-50 text-emerald-800" : "border-zinc-200 text-zinc-600"}`}>{formatQuantity(weight)} g</button>)}</div></div>}

            {isFlower && product.attributes && (
              <div className="mt-8 rounded-[26px] bg-[#f5faf8] p-5 sm:p-7">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Perfil del producto</p>
                  <h3 className="mt-1 text-xl font-bold text-[#092f35]">Conocé sus características</h3>
                </div>
                <div className="mt-5 flex justify-center">
                  <MemberProductPentagram attributes={product.attributes} />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 border-t border-zinc-100 bg-white px-6 py-4 sm:px-8">
          {notice && <div role="status" className="mb-3 rounded-xl bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-800"><p>{notice}</p>{confirmation && <div className="mt-3 flex flex-col items-center gap-2"><ReservationQR reservationId={confirmation.id} size={144} /><span className="text-xs text-emerald-900">Presentá este código al club</span></div>}</div>}
          {!confirmation && <>
            <button type="button" onClick={() => onReserve(quantity)} disabled={maxPackages === 0 || submitting} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#006b55] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/10 transition hover:bg-[#005742] disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:shadow-none">
              <ShoppingBag className="h-4 w-4" />
              {submitting ? "Enviando solicitud…" : "Realizar compra / reserva"}
            </button>
            <p className="mt-2 text-center text-xs text-zinc-400">El club confirmará tu solicitud. El pago se coordina directamente con el club.</p>
          </>}
        </div>
      </section>
    </div>
  )
}

function MemberProductPentagram({ attributes }: { attributes: Record<string, unknown> }) {
  const axes = [
    { key: "potencia", label: "Potencia", angle: -90 },
    { key: "euforia", label: "Euforia", angle: -18 },
    { key: "energia", label: "Energía", angle: 54 },
    { key: "relajacion", label: "Relajación", angle: 126 },
    { key: "sociabilidad", label: "Sociabilidad", angle: 198 },
  ]
  const size = 280
  const center = size / 2
  const radius = 78
  const point = (angle: number, distance: number) => {
    const radians = (angle * Math.PI) / 180
    return { x: center + Math.cos(radians) * distance, y: center + Math.sin(radians) * distance }
  }
  const polygon = (distance: number) => axes.map((axis) => {
    const p = point(axis.angle, distance)
    return `${p.x},${p.y}`
  }).join(" ")
  const profile = axes.map((axis) => {
    const value = Math.max(0, Math.min(5, Number(attributes[axis.key]) || 0))
    const p = point(axis.angle, (value / 5) * radius)
    return `${p.x},${p.y}`
  }).join(" ")

  return (
    <div className="w-full max-w-sm">
      <svg viewBox={`0 0 ${size} ${size}`} className="h-auto w-full overflow-visible" role="img" aria-label="Pentágono con perfil del producto">
        {[1, 2, 3, 4, 5].map((level) => <polygon key={level} points={polygon((radius / 5) * level)} fill="none" stroke="#dce8e3" strokeWidth="1.2" />)}
        {axes.map((axis) => { const p = point(axis.angle, radius); return <line key={axis.key} x1={center} y1={center} x2={p.x} y2={p.y} stroke="#dce8e3" strokeWidth="1.2" /> })}
        <polygon points={profile} fill="rgba(5,150,105,.18)" stroke="#059669" strokeWidth="3" strokeLinejoin="round" />
        {axes.map((axis) => {
          const value = Math.max(0, Math.min(5, Number(attributes[axis.key]) || 0))
          const p = point(axis.angle, (value / 5) * radius)
          const label = point(axis.angle, radius + 29)
          const anchor = label.x < center - 10 ? "end" : label.x > center + 10 ? "start" : "middle"
          return <g key={axis.key}><circle cx={p.x} cy={p.y} r="4" fill="white" stroke="#059669" strokeWidth="2.5" /><text x={label.x} y={label.y} textAnchor={anchor} dominantBaseline="middle" className="fill-zinc-600 text-[11px] font-semibold">{axis.label}</text></g>
        })}
      </svg>
    </div>
  )
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "UYU",
    maximumFractionDigits: 0,
  }).format(value)
}

function formatQuantity(value: number) {
  return new Intl.NumberFormat("es-UY", { maximumFractionDigits: 2 }).format(value)
}

function reservationStatusLabel(status: MemberReservation["status"]) {
  return {
    PENDING: "Pendiente",
    APPROVED: "Aprobada",
    REJECTED: "Rechazada",
    COMPLETED: "Entregada",
    CANCELLED: "Cancelada",
  }[status]
}

function reservationStatusClass(status: MemberReservation["status"]) {
  if (status === "APPROVED" || status === "COMPLETED") return "bg-emerald-50 text-emerald-800"
  if (status === "REJECTED" || status === "CANCELLED") return "bg-zinc-100 text-zinc-600"
  return "bg-amber-50 text-amber-800"
}
