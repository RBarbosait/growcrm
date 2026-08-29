"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import {
  ArrowLeft,
  AlertTriangle,
  Menu,
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  ImagePlus,
  LogOut,
  Package,
  Pencil,
  Plus,
  Search,
  Settings,
  ShoppingCart,
  Users,
  X,
  ArrowDownToLine,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"


const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://growcrm-api-production.up.railway.app"

type Club = {
  id: string
  name: string
  role?: string
}

type Product = {
  id: string
  clubId: string
  name: string
  category: string | null
  brand: string | null
  imageUrl: string | null
  purchasePrice: number | null
  salePrice: number | null
  stock: number
  minStock: number
  provider: string | null
  description: string | null
  attributes?: Record<string, unknown> | null
  createdAt: string
}

type User = {
  name: string
  email: string
}

export default function CatalogoPage() {
  const [user, setUser] = useState<User | null>(null)
  const [clubs, setClubs] = useState<Club[]>([])
  const [activeClub, setActiveClub] = useState<Club | null>(null)
const [showClubSelector, setShowClubSelector] = useState(false)
const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState("")

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

const [editingProduct, setEditingProduct] =
  useState<Product | null>(null)

const [viewingProduct, setViewingProduct] =
  useState<Product | null>(null)

const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadCatalog()
  }, [])

  async function loadCatalog() {
    try {
      setLoading(true)
      setError("")

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user?.email) {
        window.location.href = "/auth/login"
        return
      }

      const currentUser: User = {
        email: session.user.email,
        name:
          session.user.user_metadata?.full_name ||
          session.user.user_metadata?.name ||
          session.user.email.split("@")[0],
      }

      setUser(currentUser)

      const syncResponse = await fetch(
        `${API_URL}/user/sync`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: session.user.email,
            name: currentUser.name,
          }),
        }
      )

      if (!syncResponse.ok) {
        throw new Error("No se pudo sincronizar el usuario.")
      }

      const dbUser = await syncResponse.json()

      const userClubs: Club[] = Array.isArray(dbUser.clubs)
        ? dbUser.clubs
        : []

      setClubs(userClubs)

 // 0 clubes
if (userClubs.length === 0) {
  window.location.href = "/dashboard/onboarding"
  return
}

// 1 club → entra directamente
if (userClubs.length === 1) {
  localStorage.setItem(
    "growcrm_active_club_id",
    userClubs[0].id
  )

  setActiveClub(userClubs[0])

  await loadProducts(userClubs[0].id)

  return
}

// 2+ clubes → SIEMPRE mostrar selector
setShowClubSelector(true)
    } catch (err) {
      console.error("ERROR CARGANDO CATÁLOGO:", err)
      setError("No se pudo cargar el catálogo.")
    } finally {
      setLoading(false)
    }
  }

  async function loadProducts(clubId: string) {
    const response = await fetch(
      `${API_URL}/club/${clubId}/products`
    )

    if (!response.ok) {
      const text = await response.text()

      console.error(
        "ERROR API PRODUCTOS:",
        response.status,
        text
      )

      throw new Error("No se pudieron cargar los productos.")
    }

    const data = await response.json()

    setProducts(Array.isArray(data) ? data : [])
  }

  async function handleSaveProduct(
    updatedProduct: Product
  ) {
    if (!activeClub || !user) return

    try {
      setSaving(true)

      const response = await fetch(
        `${API_URL}/product/${updatedProduct.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clubId: activeClub.id,
            email: user.email,

            name: updatedProduct.name,
            category: updatedProduct.category,
            brand: updatedProduct.brand,
            imageUrl: updatedProduct.imageUrl,

            purchasePrice:
              updatedProduct.purchasePrice,

            salePrice:
              updatedProduct.salePrice,

            stock:
              updatedProduct.stock,

            minStock:
              updatedProduct.minStock,

            provider:
              updatedProduct.provider,

            description:
              updatedProduct.description,
              
              attributes:
  updatedProduct.attributes,
          }),
        }
      )

      if (!response.ok) {
        const text = await response.text()

        console.error(
          "ERROR ACTUALIZANDO PRODUCTO:",
          response.status,
          text
        )

        throw new Error(
          "No se pudo actualizar el producto."
        )
      }

      const savedProduct = await response.json()

      setProducts((current) =>
        current.map((product) =>
          product.id === savedProduct.id
            ? savedProduct
            : product
        )
      )

      setEditingProduct(null)
    } catch (err) {
      console.error("ERROR GUARDANDO PRODUCTO:", err)
      alert("No se pudo guardar el producto.")
    } finally {
      setSaving(false)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  function handleChangeClub() {
    if (clubs.length <= 1) return

    localStorage.removeItem(
      "growcrm_active_club_id"
    )

    window.location.href = "/dashboard"
  }

  const filteredProducts = products.filter(
    (product) => {
      const term = search
        .trim()
        .toLowerCase()

      if (!term) return true

      return (
        product.name
          .toLowerCase()
          .includes(term) ||
        product.category
          ?.toLowerCase()
          .includes(term) ||
        product.brand
          ?.toLowerCase()
          .includes(term) ||
        product.provider
          ?.toLowerCase()
          .includes(term)
      )
    }
  )

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="text-sm text-zinc-500">
          Cargando catálogo...
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">

      {/* =====================================================- */}
      {/* APP SHELL */}
      {/* =====================================================- */}

      <div className="flex min-h-screen">

        {/* =================================================== */}
        {/* SIDEBAR */}
        {/* =================================================== */}

        <aside className="hidden w-64 shrink-0 border-r border-zinc-200 bg-white lg:flex lg:flex-col">

          {/* LOGO */}

          <div className="flex h-20 items-center border-b border-zinc-100 px-6">

            <Link
              href="/dashboard"
              className="flex items-center gap-2"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-900 text-white">
                <span className="text-sm font-bold">
                  G
                </span>
              </div>

              <span className="text-xl font-bold tracking-tight">
                GrowCRM
              </span>
            </Link>

          </div>

          {/* CLUB */}

          <div className="px-4 py-5">

            <div className="rounded-2xl bg-zinc-50 p-4">

              <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                Club
              </p>

              <div className="mt-2 flex items-center justify-between gap-2">

                <p className="truncate font-semibold text-zinc-900">
                  {activeClub?.name || "Sin club"}
                </p>

                {clubs.length > 1 && (
                  <button
                    type="button"
                    onClick={handleChangeClub}
                    className="shrink-0 rounded-lg p-1 text-zinc-400 transition hover:bg-zinc-200 hover:text-zinc-900"
                    title="Cambiar club"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}

              </div>

            </div>

          </div>

          {/* NAVIGATION */}

          <nav className="flex-1 space-y-1 px-4">

            <DashboardNavItem
              icon={BarChart3}
              label="Inicio"
              onClick={() =>
                (window.location.href =
                  "/dashboard")
              }
            />

            <DashboardNavItem
              icon={Users}
              label="Socios"
              onClick={() =>
                (window.location.href =
                  "/dashboard/socios")
              }
            />

            <DashboardNavItem
              icon={Package}
              label="Catálogo"
              active
            />

            <DashboardNavItem
              icon={Package}
              label="Stock"
              onClick={() =>
                (window.location.href =
                  "/dashboard/stock")
              }
            />

            <DashboardNavItem
              icon={CalendarDays}
              label="Reservas"
              onClick={() =>
                (window.location.href =
                  "/dashboard/reservas")
              }
            />

            <DashboardNavItem
              icon={ShoppingCart}
              label="Ventas"
              onClick={() =>
                (window.location.href =
                  "/dashboard/ventas")
              }
            />

            <DashboardNavItem
              icon={ArrowDownToLine}
              label="Retiros"
              onClick={() =>
                (window.location.href =
                  "/dashboard/retiros")
              }
            />

            <DashboardNavItem
              icon={Bell}
              label="Comunicación"
              onClick={() =>
                (window.location.href =
                  "/dashboard/comunicacion")
              }
            />

            <DashboardNavItem
              icon={BarChart3}
              label="Reportes"
              onClick={() =>
                (window.location.href =
                  "/dashboard/reportes")
              }
            />

            <div className="my-4 border-t border-zinc-100" />

            <DashboardNavItem
              icon={Settings}
              label="Configuración"
              onClick={() =>
                (window.location.href =
                  "/dashboard/configuracion")
              }
            />

          </nav>

          {/* QUICK ACTION */}

          <div className="border-t border-zinc-100 p-4">

            <Button
              className="h-11 w-full rounded-xl bg-emerald-900 font-semibold hover:bg-emerald-800"
              onClick={() =>
                (window.location.href =
                  "/dashboard/reservas")
              }
            >
              <CalendarDays className="mr-2 h-4 w-4" />
              Nueva reserva
            </Button>

          </div>

        </aside>
        {/* =================================================== */}
{/* MOBILE MENU */}
{/* =================================================== */}

{mobileMenuOpen && (
  <div className="fixed inset-0 z-[90] lg:hidden">

    <button
      type="button"
      aria-label="Cerrar menú"
      onClick={() => setMobileMenuOpen(false)}
      className="absolute inset-0 bg-black/30 backdrop-blur-sm"
    />

    <aside className="relative z-10 flex h-full w-[min(82vw,320px)] flex-col bg-white shadow-2xl">

      {/* LOGO */}

      <div className="flex h-20 items-center justify-between border-b border-zinc-100 px-5">

        <Link
          href="/dashboard"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center gap-2"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-900 text-white">
            <span className="text-sm font-bold">
              G
            </span>
          </div>

          <span className="text-xl font-bold tracking-tight">
            GrowCRM
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 hover:bg-zinc-100"
          aria-label="Cerrar menú"
        >
          <X className="h-5 w-5" />
        </button>

      </div>

      {/* CLUB */}

      <div className="px-4 py-5">

        <div className="rounded-2xl bg-zinc-50 p-4">

          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            Club
          </p>

          <p className="mt-2 truncate font-semibold text-zinc-900">
            {activeClub?.name || "Sin club"}
          </p>

        </div>

      </div>

      {/* NAVIGATION */}

      <nav className="flex-1 space-y-1 overflow-y-auto px-4">

        <DashboardNavItem
          icon={BarChart3}
          label="Inicio"
          onClick={() =>
            (window.location.href = "/dashboard")
          }
        />

        <DashboardNavItem
          icon={Users}
          label="Socios"
          onClick={() =>
            (window.location.href = "/dashboard/socios")
          }
        />

        <DashboardNavItem
          icon={Package}
          label="Catálogo"
          active
        />

        <DashboardNavItem
          icon={Package}
          label="Stock"
          onClick={() =>
            (window.location.href = "/dashboard/stock")
          }
        />

        <DashboardNavItem
          icon={CalendarDays}
          label="Reservas"
          onClick={() =>
            (window.location.href = "/dashboard/reservas")
          }
        />

        <DashboardNavItem
          icon={ShoppingCart}
          label="Ventas"
          onClick={() =>
            (window.location.href = "/dashboard/ventas")
          }
        />

        <DashboardNavItem
          icon={ArrowDownToLine}
          label="Retiros"
          onClick={() =>
            (window.location.href = "/dashboard/retiros")
          }
        />

        <DashboardNavItem
          icon={Bell}
          label="Comunicación"
          onClick={() =>
            (window.location.href = "/dashboard/comunicacion")
          }
        />

        <DashboardNavItem
          icon={BarChart3}
          label="Reportes"
          onClick={() =>
            (window.location.href = "/dashboard/reportes")
          }
        />

        <div className="my-4 border-t border-zinc-100" />

        <DashboardNavItem
          icon={Settings}
          label="Configuración"
          onClick={() =>
            (window.location.href = "/dashboard/configuracion")
          }
        />

      </nav>

      {/* LOGOUT */}

      <div className="border-t border-zinc-100 p-4">

        <button
          type="button"
          onClick={handleLogout}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-700"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>

      </div>

    </aside>

  </div>
)}

        {/* =================================================== */}
        {/* MAIN */}
        {/* =================================================== */}

        <main className="min-w-0 flex-1">

          {/* TOP BAR */}

<header className="flex min-h-16 items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 sm:min-h-20 sm:px-6 sm:py-4 md:px-8">
            <div className="flex items-center gap-4">
                <button
  type="button"
  onClick={() => setMobileMenuOpen(true)}
  className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 text-zinc-600 lg:hidden"
  aria-label="Abrir menú"
>
  <Menu className="h-5 w-5" />
</button>

              <Link
                href="/dashboard"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-950"
                title="Volver al dashboard"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>

              <div>
                <p className="text-sm text-zinc-400">
                  {activeClub?.name || "Club"}
                </p>

                <h1 className="text-xl font-bold">
                  Catálogo
                </h1>
              </div>

            </div>

            <div className="flex items-center gap-3">

              <div className="hidden text-right md:block">

                <p className="text-sm font-semibold text-zinc-900">
                  {user.name}
                </p>

                <p className="max-w-[220px] truncate text-xs text-zinc-400">
                  {user.email}
                </p>

              </div>

              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-emerald-100 text-emerald-800">
                  {user.name
                    .charAt(0)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <button
                onClick={handleLogout}
                className="rounded-xl p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-900"
                title="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
              </button>

            </div>

          </header>

          {/* CONTENT */}

<div className="mx-auto max-w-7xl space-y-6 p-4 sm:space-y-8 sm:p-6 md:p-8">
            {/* PAGE INTRO */}

            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

              <div>

                <p className="text-sm font-medium text-emerald-700">
                  {activeClub?.name}
                </p>

                <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                  Productos
                </h2>

                <p className="mt-2 max-w-2xl text-zinc-500">
                  Administrá el catálogo, precios y stock de tu club desde un solo lugar.
                </p>

              </div>

              <Link
                href="/dashboard/catalogo/nuevo"
                className="shrink-0"
              >
                <Button className="h-11 w-full rounded-full bg-emerald-900 px-6 font-semibold hover:bg-emerald-800 sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar producto
                </Button>
              </Link>

            </div>

            {/* SEARCH */}

            <Card className="rounded-3xl border-zinc-200 shadow-none">

              <CardContent className="p-5">

                <div className="relative max-w-xl">

                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                  <input
                    type="text"
                    placeholder="Buscar por nombre, categoría, marca o proveedor..."
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    className="h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50 pl-11 pr-4 text-sm outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  />

                </div>

              </CardContent>

            </Card>

            {/* ERROR */}

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {/* EMPTY */}

            {!error && products.length === 0 && (

              <Card className="rounded-3xl border-dashed border-zinc-300 shadow-none">

                <CardContent className="px-6 py-16 text-center">

                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
                    <Package className="h-8 w-8" />
                  </div>

                  <h3 className="mt-5 text-xl font-bold">
                    Todavía no hay productos
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
                    Agregá el primer producto de tu club para comenzar a administrar el catálogo.
                  </p>

                  <Link
                    href="/dashboard/catalogo/nuevo"
                    className="mt-6 inline-block"
                  >
                    <Button className="rounded-full bg-emerald-900 px-6 font-semibold hover:bg-emerald-800">
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar producto
                    </Button>
                  </Link>

                </CardContent>

              </Card>

            )}

            {/* NO SEARCH RESULTS */}

            {products.length > 0 &&
              filteredProducts.length === 0 && (

                <Card className="rounded-3xl border-zinc-200 shadow-none">

                  <CardContent className="px-6 py-16 text-center">

                    <Search className="mx-auto h-8 w-8 text-zinc-300" />

                    <h3 className="mt-4 text-lg font-bold">
                      No encontramos productos
                    </h3>

                    <p className="mt-1 text-sm text-zinc-500">
                      Probá con otro término de búsqueda.
                    </p>

                  </CardContent>

                </Card>

              )}

            {/* PRODUCTS */}

            {filteredProducts.length > 0 && (

              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">

                {filteredProducts.map(
                  (product) => (
                    <ProductCard
  key={product.id}
  product={product}
  onEdit={() =>
    setEditingProduct(product)
  }
  onView={() =>
    setViewingProduct(product)
  }
/>
                  )
                )}

              </div>

            )}

            {/* FOOTER */}

            <footer className="border-t border-zinc-200 pt-8">

              <div className="flex flex-col justify-between gap-4 pb-4 text-sm text-zinc-400 sm:flex-row sm:items-center">

                <p>
                  © {new Date().getFullYear()} GrowCRM
                </p>

                <Link
                  href="/dashboard"
                  className="font-medium text-zinc-600 transition hover:text-emerald-800"
                >
                  ← Volver al dashboard
                </Link>

              </div>

            </footer>

          </div>

        </main>

      </div>

      {/* EDIT MODAL */}

{editingProduct && (

  <EditProductModal
    product={editingProduct}
    saving={saving}
    onClose={() =>
      setEditingProduct(null)
    }
    onSave={handleSaveProduct}
  />

)}

{viewingProduct && (

  <ProductDetailModal
    product={viewingProduct}
    onClose={() =>
      setViewingProduct(null)
    }
  />

)}

    </div>
  )
}


function getCommercialTag(
  attributes?: Record<string, unknown> | null
) {
  const tag = attributes?.commercialTag

  if (
    tag !== "nuevo" &&
    tag !== "mas_vendido" &&
    tag !== "recomendado" &&
    tag !== "destacado" &&
    tag !== "oferta"
  ) {
    return null
  }

  switch (tag) {
    case "nuevo":
      return {
        label: "Nuevo",
        className:
          "bg-white/95 text-emerald-800 border border-emerald-100",
      }

    case "mas_vendido":
      return {
        label: "Más vendido",
        className:
          "bg-white/95 text-zinc-900 border border-zinc-200",
      }

    case "recomendado":
      return {
        label: "Recomendado",
        className:
          "bg-white/95 text-blue-700 border border-blue-100",
      }

    case "destacado":
      return {
        label: "Destacado",
        className:
          "bg-white/95 text-purple-700 border border-purple-100",
      }

    case "oferta":
      return {
        label: "Oferta",
        className:
          "bg-white/95 text-red-700 border border-red-100",
      }
  }
}

/* =============================================================== */
/* PRODUCT CARD */
/* =============================================================== */

function ProductCard({
  product,
  onEdit,
  onView,
}: {
  product: Product
  onEdit: () => void
  onView: () => void
}) {
  const stock = Number(product.stock) || 0
  const minStock = Number(product.minStock) || 0

  // =========================
  // ESTADOS DE STOCK
  // =========================

  const isOutOfStock = stock <= 0

  // Independiente del stock mínimo.
  // Si quedan 5 unidades o menos, está por agotarse.
  const isNearEmpty =
    stock > 0 &&
    stock <= 5

  // Por debajo o igual al mínimo configurado.
  // Solo aplica después de "Por agotarse".
  const isLowStock =
    stock > 5 &&
    minStock > 0 &&
    stock <= minStock

  // Está por encima del mínimo,
  // pero todavía cerca de alcanzarlo.
  const isNearMinimum =
    minStock > 0 &&
    stock > minStock &&
    stock <= minStock * 1.25

  const stockStatus =
    isOutOfStock
      ? "Agotado"
      : isNearEmpty
        ? "Por agotarse"
        : isLowStock
          ? "Stock bajo"
          : isNearMinimum
            ? "Cerca del mínimo"
            : "Stock"

  // =========================
  // COLOR
  // =========================

  const stockColor =
    isOutOfStock
      ? "bg-red-500"
      : isNearEmpty
        ? "bg-orange-500"
        : isLowStock
          ? "bg-amber-500"
          : isNearMinimum
            ? "bg-yellow-500"
            : "bg-emerald-600"

  const stockTextColor =
    isOutOfStock
      ? "text-red-600"
      : isNearEmpty
        ? "text-orange-600"
        : isLowStock
          ? "text-amber-600"
          : isNearMinimum
            ? "text-yellow-700"
            : "text-emerald-700"

  // =========================
  // BARRA
  // =========================
  //
  // La barra representa stock real respecto
  // de una escala razonable.
  //
  // Si hay stock mínimo:
  // usamos 125% del mínimo como referencia.
  //
  // Si no hay stock mínimo:
  // usamos 5 unidades como referencia,
  // porque "Por agotarse" termina en 5.

// =====================================================
// BARRA DE STOCK
// =====================================================
//
// La barra no pretende mostrar un "porcentaje real"
// de inventario porque el producto no tiene capacidad
// máxima definida.
//
// Representa el stock actual dentro de una escala
// basada en el stock mínimo:
//
//   0              = 0%
//   stock mínimo   = 50%
//   2x stock mínimo = 100%
//
// Si no hay stock mínimo configurado usamos 10
// unidades como referencia visual.
//

const stockScaleMax =
  minStock > 0
    ? minStock * 2
    : 10

const stockBarWidth =
  stockScaleMax > 0
    ? Math.min(
        (stock / stockScaleMax) * 100,
        100
      )
    : 0

  // =========================
  // ETIQUETA COMERCIAL
  // =========================

const commercialTag = getCommercialTag(product.attributes)

  return (
    <Card
      onClick={onView}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault()
          onView()
        }
      }}
      className="group cursor-pointer overflow-hidden rounded-3xl border-zinc-200 shadow-none transition hover:-translate-y-1 hover:shadow-xl"
    >
      {/* IMAGEN */}

      <div className="relative h-44 overflow-hidden bg-zinc-100 sm:h-52">

{product.imageUrl ? (
  <img
    src={product.imageUrl}
    alt={product.name}
    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
  />
) : (
  <ProductImageFallback
    category={product.category}
  />
)}


{commercialTag && (
  <div className="absolute right-4 top-4">
    <span
      className={`rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm backdrop-blur ${commercialTag.className}`}
    >
      {commercialTag.label}
    </span>
  </div>
)}

</div>

{/* CONTENIDO */}


      <CardContent className="p-6">

        <div className="flex items-start justify-between gap-4">

          <div className="min-w-0">

            {product.category && (
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                {product.category}
              </p>
            )}

            <h3 className="mt-1 truncate text-xl font-bold tracking-tight">
              {product.name}
            </h3>

            {product.brand && (
              <p className="mt-1 text-sm text-zinc-500">
                {product.brand}
              </p>
            )}

          </div>

          {/* EDITAR */}

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onEdit()
            }}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-200 text-zinc-500 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
            title="Editar producto"
          >
            <Pencil className="h-4 w-4" />
          </button>

        </div>

        {/* PRECIO + STOCK */}

        <div className="mt-6 grid grid-cols-2 items-end gap-6 border-t border-zinc-100 pt-5">

          <div>

            <p className="text-xs text-zinc-400">
              Precio de venta
            </p>

            <p className="mt-1 text-2xl font-bold">
              {product.salePrice != null
                ? `$${product.salePrice.toLocaleString("es-UY")}`
                : "—"}
            </p>

          </div>

          <div>

            <div className="flex items-center justify-end">

              <p
                className={`text-xs font-semibold ${stockTextColor}`}
              >
                {stockStatus}
              </p>

            </div>

            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-100">

              <div
                className={`h-full rounded-full transition-all ${stockColor}`}
                style={{
                  width: `${stockBarWidth}%`,
                }}
              />

            </div>

          </div>

        </div>

        {product.provider && (
          <p className="mt-4 text-xs text-zinc-400">
            Proveedor: {product.provider}
          </p>
        )}

      </CardContent>

    </Card>
  )
}

/* =============================================================== */
/* IMAGE FALLBACK */
/* =============================================================== */

function ProductImageFallback({
  category,
}: {
  category: string | null
}) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-zinc-100">

      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-sm">
        <Package className="h-9 w-9 text-emerald-800" />
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">
        {category || "Producto"}
      </p>

    </div>
  )
}
/* =============================================================== */
/* interpretar el pentagrama */
/* =============================================================== */

/* =============================================================== */
/* PRODUCT PENTAGRAM */
/* =============================================================== */

function ProductPentagram({
  values,
}: {
  values: {
    potencia: number
    euforia: number
    energia: number
    relajacion: number
    sociabilidad: number
  }
}) {
  const size = 280
  const center = size / 2
  const radius = 88

  const axes = [
    {
      key: "potencia",
      label: "Potencia",
      angle: -90,
    },
    {
      key: "euforia",
      label: "Euforia",
      angle: -18,
    },
    {
      key: "energia",
      label: "Energía",
      angle: 54,
    },
    {
      key: "relajacion",
      label: "Relajación",
      angle: 126,
    },
    {
      key: "sociabilidad",
      label: "Sociabilidad",
      angle: 198,
    },
  ] as const

  function getPoint(angle: number, distance: number) {
    const radians = (angle * Math.PI) / 180

    return {
      x: center + Math.cos(radians) * distance,
      y: center + Math.sin(radians) * distance,
    }
  }

  function getPolygonPoints(distance: number) {
    return axes
      .map((axis) => {
        const point = getPoint(axis.angle, distance)

        return `${point.x},${point.y}`
      })
      .join(" ")
  }

  const profilePoints = axes
    .map((axis) => {
      const value = Math.max(
        0,
        Math.min(5, values[axis.key])
      )

      const point = getPoint(
        axis.angle,
        (value / 5) * radius
      )

      return `${point.x},${point.y}`
    })
    .join(" ")

  return (
    <div className="w-full max-w-md">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="h-auto w-full overflow-visible"
      >
        {/* NIVELES DEL PENTAGRAMA */}

        {[1, 2, 3, 4, 5].map((level) => (
          <polygon
            key={level}
            points={getPolygonPoints(
              (radius / 5) * level
            )}
            fill="none"
            stroke="#e4e4e7"
            strokeWidth="1"
          />
        ))}

        {/* EJES */}

        {axes.map((axis) => {
          const point = getPoint(
            axis.angle,
            radius
          )

          return (
            <line
              key={axis.key}
              x1={center}
              y1={center}
              x2={point.x}
              y2={point.y}
              stroke="#e4e4e7"
              strokeWidth="1"
            />
          )
        })}

        {/* PERFIL */}

        <polygon
          points={profilePoints}
          fill="rgba(5, 150, 105, 0.16)"
          stroke="#059669"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* PUNTOS */}

        {axes.map((axis) => {
          const value = Math.max(
            0,
            Math.min(5, values[axis.key])
          )

          const point = getPoint(
            axis.angle,
            (value / 5) * radius
          )

          return (
            <circle
              key={axis.key}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="white"
              stroke="#059669"
              strokeWidth="2"
            />
          )
        })}

        {/* ETIQUETAS */}

        {axes.map((axis) => {
          const point = getPoint(
            axis.angle,
            radius + 30
          )

          let textAnchor:
            | "start"
            | "middle"
            | "end" = "middle"

          if (point.x < center - 10) {
            textAnchor = "end"
          }

          if (point.x > center + 10) {
            textAnchor = "start"
          }

          return (
            <text
              key={axis.key}
              x={point.x}
              y={point.y}
              textAnchor={textAnchor}
              dominantBaseline="middle"
              className="fill-zinc-600 text-[11px] font-semibold"
            >
              {axis.label}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
/* =============================================================== */
/* VIEW PRODUCT MODAL */
/* =============================================================== */


function ProductDetailModal({
  product,
  onClose,
}: {
  product: Product
  onClose: () => void
}) {
const stock = Number(product.stock) || 0
const minStock = Number(product.minStock) || 0

const isOutOfStock = stock <= 0

const isNearEmpty =
  stock > 0 &&
  stock <= 5

const isLowStock =
  stock > 5 &&
  minStock > 0 &&
  stock <= minStock

const isNearMinimum =
  minStock > 0 &&
  stock > minStock &&
  stock <= minStock * 1.25

const stockStatus =
  isOutOfStock
    ? "Agotado"
    : isNearEmpty
      ? "Por agotarse"
      : isLowStock
        ? "Stock bajo"
        : isNearMinimum
          ? "Cerca del mínimo"
          : "Stock"

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
      />

      <div className="relative z-10 max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-white shadow-2xl">

        {/* IMAGEN */}

        <div className="relative h-64 overflow-hidden bg-zinc-100 sm:h-80">

          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <ProductImageFallback
              category={product.category}
            />
          )}

          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-zinc-500 shadow-sm"
          >
            <X className="h-5 w-5" />
          </button>



        </div>

        {/* CONTENIDO */}

        <div className="p-6 sm:p-8">

          {product.category && (
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              {product.category}
            </p>
          )}

          <h2 className="mt-2 text-3xl font-bold tracking-tight">
            {product.name}
          </h2>

          {product.brand && (
            <p className="mt-1 text-sm text-zinc-500">
              {product.brand}
            </p>
          )}

          <div className="mt-6 border-t border-zinc-100 pt-6">

            <p className="text-sm text-zinc-400">
              Precio
            </p>

            <p className="mt-1 text-3xl font-bold text-zinc-950">
              {product.salePrice != null
                ? `$${product.salePrice.toLocaleString("es-UY")}`
                : "Consultar"}
            </p>

          </div>

          {product.description && (
            <div className="mt-6">

              <h3 className="text-sm font-semibold">
                Descripción
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                {product.description}
              </p>

            </div>
          )}

          {/* PENTAGRAMA */}

          {product.category?.toLowerCase() ===
            "flor de marihuana" && (
            <div className="mt-8 border-t border-zinc-100 pt-8">

              <h3 className="text-lg font-bold">
                Perfil de la flor
              </h3>

              <p className="mt-1 text-sm text-zinc-500">
                Características del producto
              </p>

              <div className="mt-6 flex justify-center">
<ProductPentagram
  values={{
    potencia: Number(product.attributes?.potencia) || 0,
    euforia: Number(product.attributes?.euforia) || 0,
    energia: Number(product.attributes?.energia) || 0,
    relajacion: Number(product.attributes?.relajacion) || 0,
    sociabilidad: Number(product.attributes?.sociabilidad) || 0,
  }}
/>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  )
}

/* =============================================================== */
/* EDIT MODAL */
/* =============================================================== */

function EditProductModal({
  product,
  saving,
  onClose,
  onSave,
}: {
  product: Product
  saving: boolean
  onClose: () => void
  onSave: (
    product: Product
  ) => Promise<void>
}) {
  const [form, setForm] =
    useState<Product>(product)

  function updateField(
    field: keyof Product,
    value: string | number | null
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault()

    onSave(form)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

      {/* BACKDROP */}

      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
      />

      {/* MODAL */}

<div className="relative z-10 flex max-h-[94vh] w-[calc(100%-1rem)] max-w-2xl flex-col overflow-y-auto rounded-[24px] bg-white shadow-2xl sm:max-h-[90vh] sm:w-full sm:rounded-[28px]">
        {/* HEADER */}

        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-100 bg-white px-6 py-5">

          <div>

            <p className="text-sm font-medium text-emerald-700">
              Catálogo
            </p>

            <h2 className="text-xl font-bold">
              Editar producto
            </h2>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            <X className="h-5 w-5" />
          </button>

        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
className="space-y-6 p-4 sm:p-6"        >

          {/* IMAGE */}

          <div>

            <label className="text-sm font-semibold text-zinc-800">
              Imagen del producto
            </label>

            <div className="mt-3 flex flex-col gap-4 sm:flex-row">

              <div className="h-32 w-32 shrink-0 overflow-hidden rounded-2xl bg-zinc-100">

                {form.imageUrl ? (

                  <img
                    src={form.imageUrl}
                    alt={form.name}
                    className="h-full w-full object-cover"
                  />

                ) : (

                  <ProductImageFallback
                    category={form.category}
                  />

                )}

              </div>

              <div className="flex flex-1 flex-col justify-center">

                <div className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                  <ImagePlus className="h-4 w-4 text-emerald-700" />
                  Imagen personalizada
                </div>

                <p className="mt-1 text-sm leading-relaxed text-zinc-400">
                  Podés asociar una URL de imagen al producto.
                  La subida directa de archivos la conectamos con Storage en el siguiente paso.
                </p>

                <input
                  type="url"
                  value={form.imageUrl || ""}
                  onChange={(e) =>
                    updateField(
                      "imageUrl",
                      e.target.value || null
                    )
                  }
                  placeholder="https://..."
                  className="mt-3 h-10 rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />

              </div>

            </div>

          </div>

          {/* NAME */}

          <div>

            <label className="text-sm font-semibold">
              Nombre
            </label>

            <input
              required
              value={form.name}
              onChange={(e) =>
                updateField(
                  "name",
                  e.target.value
                )
              }
              className="mt-2 h-11 w-full rounded-xl border border-zinc-200 px-4 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />

          </div>

          {/* CATEGORY / BRAND */}

          <div className="grid gap-4 md:grid-cols-2">

            <Field
              label="Categoría"
              value={form.category || ""}
              onChange={(value) =>
                updateField(
                  "category",
                  value || null
                )
              }
            />

            <Field
              label="Marca"
              value={form.brand || ""}
              onChange={(value) =>
                updateField(
                  "brand",
                  value || null
                )
              }
            />

          </div>
          {/* ETIQUETA COMERCIAL */}

<div>
  <label className="text-sm font-semibold">
    Etiqueta comercial
  </label>

  <select
    value={
      typeof form.attributes?.commercialTag === "string"
        ? form.attributes.commercialTag
        : ""
    }
    onChange={(e) => {
      const value = e.target.value

      setForm((current) => ({
        ...current,
        attributes: {
          ...(current.attributes || {}),
          commercialTag: value || null,
        },
      }))
    }}
    className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
  >
    <option value="">Sin etiqueta</option>
    <option value="nuevo">Nuevo</option>
    <option value="mas_vendido">Más vendido</option>
    <option value="recomendado">Recomendado</option>
    <option value="destacado">Destacado</option>
    <option value="oferta">Oferta</option>
  </select>
</div>

          {/* PRICES */}

          <div className="grid gap-4 md:grid-cols-2">

            <NumberField
              label="Precio de compra"
              value={
                form.purchasePrice ?? ""
              }
              onChange={(value) =>
                updateField(
                  "purchasePrice",
                  value === ""
                    ? null
                    : Number(value)
                )
              }
            />

            <NumberField
              label="Precio de venta"
              value={
                form.salePrice ?? ""
              }
              onChange={(value) =>
                updateField(
                  "salePrice",
                  value === ""
                    ? null
                    : Number(value)
                )
              }
            />

          </div>

{/* STOCK */}

<div className="space-y-4">

  <div className="grid gap-4 md:grid-cols-2">

    <NumberField
      label="Stock"
      value={form.stock}
      onChange={(value) =>
        updateField(
          "stock",
          Number(value)
        )
      }
    />

    <NumberField
      label="Stock mínimo"
      value={form.minStock}
      onChange={(value) =>
        updateField(
          "minStock",
          Number(value)
        )
      }
    />

  </div>

  <div>

    <label className="text-sm font-semibold">
      Unidad de stock
    </label>

    <select
      value={
        typeof form.attributes?.stockUnit === "string"
          ? form.attributes.stockUnit
          : ""
      }
      onChange={(e) => {
        const value = e.target.value

        setForm((current) => ({
          ...current,
          attributes: {
            ...(current.attributes || {}),
            stockUnit: value,
          },
        }))
      }}
      className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
    >

      <option value="">
        Seleccioná una unidad
      </option>

      <option value="g">
        Gramos (g)
      </option>

      <option value="kg">
        Kilogramos (kg)
      </option>

      <option value="ml">
        Mililitros (ml)
      </option>

      <option value="l">
        Litros (l)
      </option>

      <option value="unidad">
        Unidades
      </option>

    </select>

  </div>

</div>

          {/* PROVIDER */}

          <Field
            label="Proveedor"
            value={form.provider || ""}
            onChange={(value) =>
              updateField(
                "provider",
                value || null
              )
            }
          />

          {/* DESCRIPTION */}

          <div>

            <label className="text-sm font-semibold">
              Descripción
            </label>

            <textarea
              value={form.description || ""}
              onChange={(e) =>
                updateField(
                  "description",
                  e.target.value || null
                )
              }
              rows={4}
              className="mt-2 w-full resize-none rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />

          </div>

          {/* ACTIONS */}

          <div className="flex flex-col-reverse gap-3 border-t border-zinc-100 pt-5 sm:flex-row sm:justify-end">

            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-11 rounded-full px-6"
              disabled={saving}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={saving}
              className="h-11 rounded-full bg-emerald-900 px-6 font-semibold hover:bg-emerald-800"
            >
              {saving ? (
                "Guardando..."
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Guardar cambios
                </>
              )}
            </Button>

          </div>

        </form>

      </div>

    </div>
  )
}

/* =============================================================== */
/* FORM FIELDS */
/* =============================================================== */

function Field({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div>

      <label className="text-sm font-semibold">
        {label}
      </label>

      <input
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="mt-2 h-11 w-full rounded-xl border border-zinc-200 px-4 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
      />

    </div>
  )
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number | string
  onChange: (value: number | string) => void
}) {
  return (
    <div>

      <label className="text-sm font-semibold">
        {label}
      </label>

      <input
        type="number"
        min="0"
        step="0.01"
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="mt-2 h-11 w-full rounded-xl border border-zinc-200 px-4 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
      />

    </div>
  )
}

/* =============================================================== */
/* NAV */
/* =============================================================== */

function DashboardNavItem({
  icon: Icon,
  label,
  active = false,
  onClick,
}: {
  icon: any
  label: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
        active
          ? "bg-emerald-900 text-white shadow-sm"
          : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
      }`}
    >
      <Icon
        className="h-4 w-4"
        strokeWidth={1.8}
      />

      {label}
    </button>
  )
}