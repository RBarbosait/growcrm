"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Search, ShoppingCart } from "lucide-react"
import { supabase } from "@/lib/supabase"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://growcrm-api-production.up.railway.app"
type Reservation = {
  id: string
  quantity: number
  status: string
  createdAt: string
  user: { name: string | null; email: string }
  product: { name: string; category: string | null; salePrice: number | null; attributes?: Record<string, unknown> | null }
}
type Club = { id: string; role?: string }

const money = (value: number) => `$${value.toLocaleString("es-UY", { maximumFractionDigits: 2 })}`

function getUnitLabel(sale: Reservation) {
  const raw = typeof sale.product.attributes?.stockUnit === "string" ? sale.product.attributes.stockUnit.trim() : "unidad"
  const labels: Record<string, string> = { g: "g", kg: "kg", ml: "ml", l: "l", unidad: Number(sale.quantity) === 1 ? "unidad" : "unidades", unidades: "unidades", "gramos (g)": "g", "kilogramos (kg)": "kg", "mililitros (ml)": "ml", "litros (l)": "l" }
  return labels[raw.toLocaleLowerCase("es")] || raw
}

export default function SalesPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => { void loadSales() }, [])

  async function loadSales() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user?.email) {
        window.location.href = "/auth/login?next=%2Fdashboard%2Fventas"
        return
      }
      const sync = await fetch(`${API_URL}/user/sync`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: session.user.email, name: session.user.user_metadata?.full_name || session.user.email.split("@")[0] }) })
      const user = await sync.json().catch(() => ({}))
      if (!sync.ok) throw new Error(user.error || "No se pudo verificar el acceso al club.")
      const clubs: Club[] = Array.isArray(user.clubs) ? user.clubs : []
      const savedId = localStorage.getItem("growcrm_active_club_id")
      const club = clubs.find((item) => item.id === savedId) || (clubs.length === 1 ? clubs[0] : null)
      if (club?.role === "MEMBER") {
        window.location.replace("/dashboard/member")
        return
      }
      if (!club) throw new Error("Seleccioná un club desde el panel de administración para ver sus ventas.")
      localStorage.setItem("growcrm_active_club_id", club.id)
      const response = await fetch(`${API_URL}/club/${club.id}/reservations`, { headers: { Authorization: `Bearer ${session.access_token}` } })
      const result = await response.json().catch(() => [])
      if (!response.ok) throw new Error(result.error || "No se pudieron cargar las ventas.")
      setReservations((Array.isArray(result) ? result : []).filter((item: Reservation) => item.status === "COMPLETED"))
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar las ventas.")
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("es")
    if (!normalized) return reservations
    return reservations.filter((sale) => [sale.product.name, sale.product.category, sale.user.name, sale.user.email].some((value) => value?.toLocaleLowerCase("es").includes(normalized)))
  }, [reservations, query])
  const total = reservations.reduce((sum, sale) => sum + (Number(sale.product.salePrice) || 0) * (Number(sale.quantity) || 0), 0)
  const pricedCount = reservations.filter((sale) => sale.product.salePrice != null).length

  return <main className="min-h-screen bg-[#f7faf9] px-4 py-8 text-[#092f35] sm:px-8 lg:px-12"><div className="mx-auto max-w-7xl">
    <Link href="/dashboard/admin" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-emerald-800"><ArrowLeft className="h-4 w-4" />Volver al inicio</Link>
    <header className="mt-6"><p className="font-semibold text-emerald-700">Gestión del club</p><h1 className="mt-1 text-3xl font-extrabold sm:text-4xl">Ventas</h1><p className="mt-2 text-zinc-500">Compras y reservas que ya fueron entregadas.</p></header>
    <section className="mt-7 grid gap-4 sm:grid-cols-2"><div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5"><p className="text-sm font-semibold text-emerald-800">Total estimado vendido</p><p className="mt-2 text-3xl font-extrabold text-emerald-950">{money(total)}</p><p className="mt-1 text-sm text-emerald-800/70">Estimado con el precio actual del producto y las cantidades entregadas.</p></div><div className="rounded-3xl border border-zinc-200 bg-white p-5"><p className="text-sm font-semibold text-zinc-500">Pedidos entregados</p><p className="mt-2 text-3xl font-extrabold">{reservations.length}</p><p className="mt-1 text-sm text-zinc-500">{pricedCount} con precio configurado.</p></div></section>
    <label className="mt-7 flex max-w-xl items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3"><Search className="h-5 w-5 text-zinc-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar producto o socio" className="w-full bg-transparent text-sm outline-none" /></label>
    {error && <p role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    <section className="mt-6 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4"><h2 className="font-bold">Entregas registradas</h2><span className="text-sm text-zinc-500">{reservations.length} ventas</span></div>
      {loading ? <p className="p-8 text-center text-zinc-500">Cargando ventas…</p> : filtered.length === 0 ? <div className="p-10 text-center text-zinc-500"><ShoppingCart className="mx-auto mb-3 h-8 w-8 text-zinc-300" />{reservations.length ? "No hay ventas que coincidan con la búsqueda." : "Todavía no hay reservas entregadas."}</div> : <div className="overflow-x-auto"><table className="w-full min-w-[780px] text-left text-sm"><thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500"><tr><th className="px-5 py-4">Fecha</th><th className="px-5 py-4">Producto</th><th className="px-5 py-4">Socio</th><th className="px-5 py-4">Cantidad</th><th className="px-5 py-4">Precio unitario</th><th className="px-5 py-4">Total</th></tr></thead><tbody className="divide-y divide-zinc-100">{filtered.map((sale) => { const price = Number(sale.product.salePrice) || 0; const quantity = Number(sale.quantity) || 0; const unit = getUnitLabel(sale); return <tr key={sale.id}><td className="whitespace-nowrap px-5 py-4 text-zinc-600">{new Date(sale.createdAt).toLocaleString("es-UY")}</td><td className="px-5 py-4"><p className="font-bold">{sale.product.name}</p><p className="mt-1 text-xs text-zinc-500">{sale.product.category || "Producto"}</p></td><td className="px-5 py-4"><p className="font-semibold">{sale.user.name || "Socio"}</p><p className="mt-1 text-xs text-zinc-500">{sale.user.email}</p></td><td className="px-5 py-4">{quantity} {unit}</td><td className="px-5 py-4">{sale.product.salePrice == null ? "Sin precio" : `${money(price)} / ${unit}`}</td><td className="px-5 py-4 font-bold">{sale.product.salePrice == null ? "—" : money(price * quantity)}</td></tr> })}</tbody></table></div>}
    </section>
  </div></main>
}
