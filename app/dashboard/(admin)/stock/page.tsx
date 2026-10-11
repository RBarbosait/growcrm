"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Package, Search } from "lucide-react"
import { supabase } from "@/lib/supabase"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://growcrm-api-production.up.railway.app"

type Product = {
  id: string
  name: string
  category: string | null
  brand: string | null
  stock: number
  minStock: number
  attributes?: Record<string, unknown> | null
}

type Club = { id: string; role?: string }

function getUnitLabel(product: Product) {
  const raw = typeof product.attributes?.stockUnit === "string" ? product.attributes.stockUnit.trim() : "unidad"
  const labels: Record<string, string> = {
    g: "g",
    kg: "kg",
    ml: "ml",
    l: "l",
    unidad: Number(product.stock) === 1 ? "unidad" : "unidades",
    unidades: "unidades",
    "gramos (g)": "g",
    "kilogramos (kg)": "kg",
    "mililitros (ml)": "ml",
    "litros (l)": "l",
  }
  return labels[raw.toLocaleLowerCase("es")] || raw
}

export default function StockPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    void loadStock()
  }, [])

  async function loadStock() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user?.email) {
        window.location.href = "/auth/login?next=%2Fdashboard%2Fstock"
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
      const savedId = localStorage.getItem("growcrm_active_club_id")
      const club = clubs.find((item) => item.id === savedId) || (clubs.length === 1 ? clubs[0] : null)
      if (club?.role === "MEMBER") {
        window.location.replace("/dashboard/member")
        return
      }
      if (!club) throw new Error("Seleccioná un club desde el panel de administración para ver su stock.")
      localStorage.setItem("growcrm_active_club_id", club.id)
      const response = await fetch(`${API_URL}/club/${club.id}/products`, { headers: { Authorization: `Bearer ${session.access_token}` } })
      const result = await response.json().catch(() => [])
      if (!response.ok) throw new Error(result.error || "No se pudo cargar el stock.")
      setProducts(Array.isArray(result) ? result : [])
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudo cargar el stock.")
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("es")
    if (!normalized) return products
    return products.filter((product) => [product.name, product.category, product.brand].some((value) => value?.toLocaleLowerCase("es").includes(normalized)))
  }, [products, query])

  return <main className="min-h-screen bg-[#f7faf9] px-4 py-8 text-[#092f35] sm:px-8 lg:px-12">
    <div className="mx-auto max-w-7xl">
      <Link href="/dashboard/admin" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-emerald-800"><ArrowLeft className="h-4 w-4" />Volver al inicio</Link>
      <header className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div><p className="font-semibold text-emerald-700">Gestión del club</p><h1 className="mt-1 text-3xl font-extrabold sm:text-4xl">Stock</h1><p className="mt-2 text-zinc-500">Existencias y mínimos configurados para todos los productos.</p></div>
        <Link href="/dashboard/catalogo" className="rounded-full bg-emerald-900 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-800">Administrar catálogo</Link>
      </header>
      <label className="mt-8 flex max-w-xl items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3"><Search className="h-5 w-5 text-zinc-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar producto, categoría o marca" className="w-full bg-transparent text-sm outline-none" /></label>
      {error && <p role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      <section className="mt-6 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4"><h2 className="font-bold">Inventario</h2><span className="text-sm text-zinc-500">{products.length} productos</span></div>
        {loading ? <p className="p-8 text-center text-zinc-500">Cargando stock…</p> : filtered.length === 0 ? <div className="p-10 text-center text-zinc-500"><Package className="mx-auto mb-3 h-8 w-8 text-zinc-300" />{products.length ? "No hay productos que coincidan con la búsqueda." : "Todavía no hay productos en el catálogo."}</div> : <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500"><tr><th className="px-5 py-4">Producto</th><th className="px-5 py-4">Categoría</th><th className="px-5 py-4">Stock actual</th><th className="px-5 py-4">Stock mínimo</th><th className="px-5 py-4">Estado</th><th className="px-5 py-4"></th></tr></thead><tbody className="divide-y divide-zinc-100">{filtered.map((product) => {
          const stock = Number(product.stock) || 0
          const min = Number(product.minStock) || 0
          const unit = getUnitLabel(product)
          const label = stock <= 0 ? "Agotado" : stock <= 5 ? "Por agotarse" : min > 0 && stock <= min ? "Stock bajo" : min > 0 && stock <= min * 1.25 ? "Cerca del mínimo" : "Disponible"
          const color = stock <= 0 ? "bg-red-50 text-red-700" : stock <= 5 || (min > 0 && stock <= min) ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-800"
          return <tr key={product.id}><td className="px-5 py-4"><p className="font-bold text-[#092f35]">{product.name}</p>{product.brand && <p className="mt-1 text-xs text-zinc-500">{product.brand}</p>}</td><td className="px-5 py-4 text-zinc-600">{product.category || "—"}</td><td className="px-5 py-4 font-semibold">{stock} {unit}</td><td className="px-5 py-4 text-zinc-600">{min} {unit}</td><td className="px-5 py-4"><span className={`rounded-full px-3 py-1.5 text-xs font-bold ${color}`}>{label}</span></td><td className="px-5 py-4 text-right"><Link href="/dashboard/catalogo" className="font-semibold text-emerald-800 hover:underline">Editar</Link></td></tr>
        })}</tbody></table></div>}
      </section>
    </div>
  </main>
}
