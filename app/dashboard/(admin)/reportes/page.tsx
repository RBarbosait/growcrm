"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, BarChart3, LoaderCircle, Package, ShoppingCart, TriangleAlert } from "lucide-react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { supabase } from "@/lib/supabase"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://growcrm-api-production.up.railway.app"

type Reservation = {
  id: string
  status: string
  quantity: number
  createdAt: string
  completedAt?: string | null
  saleUnitPrice?: number | null
  saleTotal?: number | null
  product: { id: string; name: string; salePrice: number | null }
}
type Product = { id: string; name: string; stock: number; minStock: number }
type Club = { id: string; role?: string }
type MonthSales = { month: string; total: number; key: string }

const money = (value: number) => `$${value.toLocaleString("es-UY", { maximumFractionDigits: 2 })}`

function saleAmount(sale: Reservation) {
  const price = sale.saleUnitPrice ?? sale.product.salePrice ?? 0
  return sale.saleTotal ?? Number(price) * Number(sale.quantity)
}

export default function ReportsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => { void loadReports() }, [])

  async function loadReports() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user?.email) {
        window.location.href = "/auth/login?next=%2Fdashboard%2Freportes"
        return
      }
      const sync = await fetch(`${API_URL}/user/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email, name: session.user.user_metadata?.full_name || session.user.email.split("@")[0] }),
      })
      const user = await sync.json().catch(() => ({}))
      if (!sync.ok) throw new Error(user.error || "No se pudo verificar el acceso al club.")
      const clubs: Club[] = Array.isArray(user.clubs) ? user.clubs : []
      const storedId = localStorage.getItem("growcrm_active_club_id")
      const club = clubs.find((item) => item.id === storedId) || (clubs.length === 1 ? clubs[0] : null)
      if (club?.role === "MEMBER") {
        window.location.replace("/dashboard/member")
        return
      }
      if (!club) throw new Error("Seleccioná un club desde el panel de administración para ver sus reportes.")
      localStorage.setItem("growcrm_active_club_id", club.id)
      const headers = { Authorization: `Bearer ${session.access_token}` }
      const [reservationsResponse, productsResponse] = await Promise.all([
        fetch(`${API_URL}/club/${club.id}/reservations`, { headers }),
        fetch(`${API_URL}/club/${club.id}/products`, { headers }),
      ])
      const [reservationsResult, productsResult] = await Promise.all([
        reservationsResponse.json().catch(() => []),
        productsResponse.json().catch(() => []),
      ])
      if (!reservationsResponse.ok) throw new Error(reservationsResult.error || "No se pudieron cargar las reservas.")
      if (!productsResponse.ok) throw new Error(productsResult.error || "No se pudo cargar el catálogo.")
      setReservations(Array.isArray(reservationsResult) ? reservationsResult : [])
      setProducts(Array.isArray(productsResult) ? productsResult : [])
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar los reportes.")
    } finally {
      setLoading(false)
    }
  }

  const report = useMemo(() => {
    const completed = reservations.filter((item) => item.status === "COMPLETED")
    const pending = reservations.filter((item) => item.status === "PENDING").length
    const total = completed.reduce((sum, sale) => sum + saleAmount(sale), 0)
    const estimated = completed.filter((sale) => sale.saleTotal == null && sale.product.salePrice != null).length
    const stockAlerts = products.filter((product) => Number(product.stock) <= 0 || (Number(product.minStock) > 0 && Number(product.stock) <= Number(product.minStock)))
    const months: MonthSales[] = Array.from({ length: 6 }, (_, index) => {
      const date = new Date()
      date.setDate(1)
      date.setMonth(date.getMonth() - (5 - index))
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      return { key, month: new Intl.DateTimeFormat("es-UY", { month: "short" }).format(date), total: 0 }
    })
    for (const sale of completed) {
      const date = new Date(sale.completedAt || sale.createdAt)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      const month = months.find((item) => item.key === key)
      if (month) month.total += saleAmount(sale)
    }
    const topProducts = Object.values(completed.reduce<Record<string, { id: string; name: string; amount: number; quantity: number }>>((items, sale) => {
      const key = sale.product.id
      items[key] ||= { id: key, name: sale.product.name, amount: 0, quantity: 0 }
      items[key].amount += saleAmount(sale)
      items[key].quantity += Number(sale.quantity) || 0
      return items
    }, {})).sort((a, b) => b.amount - a.amount).slice(0, 5)
    const statuses = [
      { label: "Pendientes", count: pending, style: "bg-amber-50 text-amber-800" },
      { label: "Aprobadas", count: reservations.filter((item) => item.status === "APPROVED").length, style: "bg-sky-50 text-sky-800" },
      { label: "Entregadas", count: completed.length, style: "bg-emerald-50 text-emerald-800" },
      { label: "Rechazadas", count: reservations.filter((item) => item.status === "REJECTED").length, style: "bg-rose-50 text-rose-800" },
    ]
    return { completed, pending, total, estimated, stockAlerts, months, topProducts, statuses }
  }, [reservations, products])

  return <main className="min-h-screen bg-[#f7faf9] px-4 py-8 text-[#092f35] sm:px-8 lg:px-12">
    <div className="mx-auto max-w-7xl">
      <Link href="/dashboard/admin" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-emerald-800"><ArrowLeft className="h-4 w-4" />Volver al inicio</Link>
      <header className="mt-6"><p className="font-semibold text-emerald-700">Gestión del club</p><h1 className="mt-1 text-3xl font-extrabold sm:text-4xl">Reportes</h1><p className="mt-2 text-zinc-500">Ventas, reservas y stock de tu club en una sola vista.</p></header>
      {error && <p role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {loading ? <div role="status" aria-live="polite" className="mt-8 flex min-h-48 items-center justify-center gap-3 rounded-3xl border border-zinc-200 bg-white text-zinc-500"><LoaderCircle className="h-5 w-5 animate-spin" />Preparando tus reportes…</div> : <>
        <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Total vendido" value={money(report.total)} hint={report.estimated ? `${report.estimated} ventas estimadas al precio actual` : "Importes registrados al entregar"} icon={ShoppingCart} />
          <Metric label="Pedidos entregados" value={String(report.completed.length)} hint={`${report.pending} pendientes de aprobación`} icon={BarChart3} />
          <Metric label="Productos en catálogo" value={String(products.length)} hint="Productos cargados en el club" icon={Package} />
          <Metric label="Alertas de stock" value={String(report.stockAlerts.length)} hint="Agotados o debajo del mínimo" icon={TriangleAlert} warning={report.stockAlerts.length > 0} />
        </section>

        <section className="mt-6 grid gap-5 xl:grid-cols-[1.6fr_1fr]">
          <article className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6"><div><h2 className="text-lg font-bold">Ventas de los últimos 6 meses</h2><p className="mt-1 text-sm text-zinc-500">Según las reservas marcadas como entregadas.</p></div>{report.completed.length ? <div className="mt-6 h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={report.months} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${Number(value).toLocaleString("es-UY")}`} width={78} /><Tooltip formatter={(value) => money(Number(value))} labelFormatter={(label) => `Mes: ${label}`} /><Bar dataKey="total" name="Ventas" fill="#08745a" radius={[7, 7, 0, 0]} /></BarChart></ResponsiveContainer></div> : <EmptyState text="Cuando registres una entrega, vas a ver su evolución acá." />}</article>
          <article className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6"><h2 className="text-lg font-bold">Estado de reservas</h2><p className="mt-1 text-sm text-zinc-500">Seguimiento de las solicitudes al club.</p><div className="mt-5 grid gap-3">{report.statuses.map((item) => <div key={item.label} className="flex items-center justify-between rounded-2xl bg-zinc-50 px-4 py-3"><span className="text-sm font-medium text-zinc-600">{item.label}</span><span className={`rounded-full px-3 py-1 text-sm font-bold ${item.style}`}>{item.count}</span></div>)}</div><Link href="/dashboard/reservas" className="mt-5 inline-flex text-sm font-bold text-emerald-800 hover:underline">Ver reservas <span className="ml-1">→</span></Link></article>
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-2">
          <article className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6"><h2 className="text-lg font-bold">Productos más vendidos</h2><p className="mt-1 text-sm text-zinc-500">Ordenados por importe de ventas entregadas.</p>{report.topProducts.length ? <div className="mt-4 divide-y divide-zinc-100">{report.topProducts.map((product, index) => { const max = report.topProducts[0]?.amount || 1; return <div key={product.id} className="py-3"><div className="flex items-center justify-between gap-3"><span className="truncate text-sm font-semibold"><span className="mr-2 text-zinc-400">{index + 1}.</span>{product.name}</span><span className="shrink-0 text-sm font-bold">{money(product.amount)}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-100"><div className="h-full rounded-full bg-emerald-700" style={{ width: `${Math.max(4, product.amount / max * 100)}%` }} /></div></div> })}</div> : <EmptyState text="Todavía no hay ventas para comparar productos." />}</article>
          <article className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-bold">Stock para revisar</h2><p className="mt-1 text-sm text-zinc-500">Agotados o por debajo del mínimo configurado.</p></div><span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-800">{report.stockAlerts.length}</span></div>{report.stockAlerts.length ? <div className="mt-4 divide-y divide-zinc-100">{report.stockAlerts.slice(0, 6).map((product) => <div key={product.id} className="flex items-center justify-between gap-3 py-3"><span className="truncate text-sm font-semibold">{product.name}</span><span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${Number(product.stock) <= 0 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-800"}`}>{Number(product.stock) <= 0 ? "Agotado" : `${product.stock} disponibles`}</span></div>)}</div> : <EmptyState text="Todo el catálogo está por encima de sus mínimos." />}<Link href="/dashboard/stock" className="mt-4 inline-flex text-sm font-bold text-emerald-800 hover:underline">Ver stock <span className="ml-1">→</span></Link></article>
        </section>
      </>}
    </div>
  </main>
}

function Metric({ label, value, hint, icon: Icon, warning = false }: { label: string; value: string; hint: string; icon: typeof ShoppingCart; warning?: boolean }) {
  return <article className={`rounded-3xl border p-5 shadow-sm ${warning ? "border-amber-200 bg-amber-50" : "border-zinc-200 bg-white"}`}><div className="flex items-center justify-between"><p className="text-sm font-semibold text-zinc-500">{label}</p><Icon className={`h-5 w-5 ${warning ? "text-amber-700" : "text-emerald-800"}`} /></div><p className="mt-3 text-3xl font-extrabold">{value}</p><p className="mt-1 text-sm text-zinc-500">{hint}</p></article>
}

function EmptyState({ text }: { text: string }) {
  return <div className="flex min-h-36 items-center justify-center px-5 text-center text-sm text-zinc-400">{text}</div>
}
