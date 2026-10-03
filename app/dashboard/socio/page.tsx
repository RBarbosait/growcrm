"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Gift, Leaf, LogOut, Search, Sparkles, Tag } from "lucide-react"
import { WaitOverlay } from "@/components/ui/wait-overlay"
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
  description: string | null
}

type ClubBenefit = {
  id: string
  title: string
  description: string
  imageUrl: string | null
  linkUrl: string | null
}

type MemberDashboardData = {
  user: { name: string | null; email: string }
  membership: { id: string; active: boolean }
  club: {
    id: string
    name: string
    description: string | null
    template: { name: string; slug: string }
  }
  products: ClubProduct[]
  benefits: ClubBenefit[]
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
      <main className="min-h-screen bg-[#f5faf8]">
        <WaitOverlay open label="Cargando el espacio del socio" messages={loadingMessages} />
      </main>
    )
  }

  if (error || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5faf8] px-5">
        <section className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
            <Leaf className="h-7 w-7" />
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

  const firstName = data.user.name?.trim().split(/\s+/)[0] || "socio"

  return (
    <main className="min-h-screen bg-[#f5faf8] text-[#092f35]">
      <header className="sticky top-0 z-30 border-b border-emerald-950/5 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <a href="#inicio" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#006b55] text-white shadow-sm">
              <Leaf className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-bold leading-tight">{data.club.name}</span>
              <span className="block text-xs text-zinc-400">Comunidad del club</span>
            </span>
          </a>

          <nav className="hidden items-center gap-7 text-sm font-semibold text-zinc-500 md:flex">
            <a href="#catalogo" className="transition hover:text-[#007f63]">Catálogo</a>
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
        <section id="inicio" className="relative isolate overflow-hidden rounded-[32px] bg-gradient-to-br from-[#063e35] via-[#006b55] to-[#159675] px-7 py-9 text-white shadow-xl shadow-emerald-950/10 sm:px-11 sm:py-12">
          <div className="pointer-events-none absolute -right-12 -top-28 -z-10 h-80 w-80 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-2 -top-16 -z-10 h-60 w-60 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-36 right-1/4 -z-10 h-72 w-72 rounded-full bg-emerald-300/10 blur-3xl" />

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-semibold text-emerald-50 backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              Tu comunidad, tu espacio
            </div>
            <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-5xl">
              ¡Qué bueno tenerte acá, {firstName}!
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-emerald-50/85 sm:text-base">
              Este es tu espacio en {data.club.name}. Explorá el catálogo, descubrí beneficios y disfrutá todo lo que preparó tu club para vos.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#catalogo" className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#006b55] shadow-sm transition hover:bg-emerald-50">Explorar catálogo</a>
              <a href="#beneficios" className="rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">Ver beneficios</a>
            </div>
          </div>

          <div id="membresia" className="mt-8 flex flex-wrap items-center gap-3 border-t border-white/15 pt-6 sm:absolute sm:bottom-10 sm:right-10 sm:mt-0 sm:border-0 sm:pt-0">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-300/15 px-4 py-2 text-sm font-semibold text-emerald-50 ring-1 ring-inset ring-emerald-200/20">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              Membresía activa
            </span>
            <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/90">{data.club.template.name}</span>
          </div>
        </section>

        {data.club.description && (
          <section className="mt-7 rounded-3xl border border-emerald-100 bg-white px-6 py-5 shadow-sm sm:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Sobre tu club</p>
            <p className="mt-2 max-w-4xl text-sm leading-7 text-zinc-600">{data.club.description}</p>
          </section>
        )}

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
                <article key={product.id} className="group overflow-hidden rounded-[28px] border border-zinc-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-950/5">
                  <div className="relative aspect-[1.55/1] overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-100">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-emerald-700/70"><Leaf className="h-12 w-12" /></div>
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
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-dashed border-emerald-200 bg-white px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><Leaf className="h-7 w-7" /></div>
              <h3 className="mt-4 text-lg font-bold">{data.products.length ? "No encontramos resultados" : "El catálogo se está preparando"}</h3>
              <p className="mt-2 text-sm text-zinc-500">{data.products.length ? "Probá con otra búsqueda o categoría." : "Pronto vas a encontrar acá las opciones de tu club."}</p>
            </div>
          )}
        </section>

        <section id="beneficios" className="scroll-mt-24 pt-14">
          <div className="overflow-hidden rounded-[32px] bg-[#e8f6f1] p-7 sm:p-10">
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
    </main>
  )
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "UYU",
    maximumFractionDigits: 0,
  }).format(value)
}
