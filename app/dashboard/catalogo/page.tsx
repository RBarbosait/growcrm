"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  Pencil,
  Trash2,
  X,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://growcrm-api-production.up.railway.app"

type Product = {
  id: string
  clubId: string
  name: string
  category: string | null
  brand: string | null
  purchasePrice: number | null
  salePrice: number
  stock: number
  minStock: number
  provider: string | null
  description: string | null
  createdAt: string
  categoryId: string | null
  attributes: Record<string, any> | null
  imageUrl: string | null
}
type Attribute = {
  id: string
  name: string
  slug: string
  type: string
  options?: string[] | null
  required: boolean
  sortOrder: number
}

type Club = {
  id: string
  name: string
}

export default function CatalogoPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [club, setClub] = useState<Club | null>(null)

  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null)

const [editAttributes, setEditAttributes] =
  useState<Attribute[]>([])

const [loadingEditAttributes, setLoadingEditAttributes] =
  useState(false)

  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] =
    useState<string | null>(null)

  useEffect(() => {
    loadCatalog()
  }, [])

  async function loadCatalog() {
    try {
      setLoading(true)
      setError("")

      const clubId = localStorage.getItem(
        "growcrm_active_club_id"
      )

      if (!clubId) {
        setError("No hay un club seleccionado.")
        return
      }

      try {
        const clubResponse = await fetch(
          `${API_URL}/club/${clubId}`
        )

        if (clubResponse.ok) {
          const clubData = await clubResponse.json()
          setClub(clubData)
        }
      } catch (clubError) {
        console.warn(
          "No se pudo cargar la información del club:",
          clubError
        )
      }

      const response = await fetch(
        `${API_URL}/club/${clubId}/products`
      )

      if (!response.ok) {
        const errorText = await response.text()

        console.error(
          "ERROR API PRODUCTOS:",
          response.status,
          errorText
        )

        throw new Error(
          "No se pudieron cargar los productos."
        )
      }

      const data = await response.json()

      console.log("PRODUCTOS CARGADOS:", data)

      setProducts(
        Array.isArray(data) ? data : []
      )
    } catch (err) {
      console.error(
        "ERROR CARGANDO CATÁLOGO:",
        err
      )

      setError(
        "No se pudieron cargar los productos."
      )
    } finally {
      setLoading(false)
    }
  }

  async function getUserEmail() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    return user?.email || null
  }

  async function handleSaveProduct(
    product: Product
  ) {
    const clubId = localStorage.getItem(
      "growcrm_active_club_id"
    )

    if (!clubId) {
      alert("No hay un club seleccionado.")
      return
    }

    const email = await getUserEmail()

    if (!email) {
      alert("No se pudo identificar al usuario.")
      return
    }

    try {
      setSaving(true)

      const response = await fetch(
        `${API_URL}/product/${product.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clubId,
            email,
            name: product.name,
            category: product.category,
            brand: product.brand,
            purchasePrice:
              product.purchasePrice,
            salePrice: product.salePrice,
            stock: product.stock,
            minStock: product.minStock,
            provider: product.provider,
            description: product.description,
            categoryId: product.categoryId,
attributes: product.attributes,
          }),
        }
      )

      if (!response.ok) {
        const text = await response.text()

        console.error(
          "ERROR EDITANDO PRODUCTO:",
          response.status,
          text
        )

        throw new Error(
          "No se pudo editar el producto."
        )
      }

      const updatedProduct =
        await response.json()

      setProducts((current) =>
        current.map((item) =>
          item.id === updatedProduct.id
            ? updatedProduct
            : item
        )
      )

      setEditingProduct(null)
    } catch (err) {
      console.error(
        "ERROR EDITANDO PRODUCTO:",
        err
      )

      alert(
        "No se pudo guardar el producto."
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteProduct(
    product: Product
  ) {
    const confirmed = window.confirm(
      `¿Seguro que querés eliminar "${product.name}"?`
    )

    if (!confirmed) return

    const clubId = localStorage.getItem(
      "growcrm_active_club_id"
    )

    if (!clubId) {
      alert("No hay un club seleccionado.")
      return
    }

    const email = await getUserEmail()

    if (!email) {
      alert("No se pudo identificar al usuario.")
      return
    }

    try {
      setDeletingId(product.id)

      const response = await fetch(
        `${API_URL}/product/${product.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clubId,
            email,
          }),
        }
      )

      if (!response.ok) {
        const text = await response.text()

        console.error(
          "ERROR ELIMINANDO PRODUCTO:",
          response.status,
          text
        )

        throw new Error(
          "No se pudo eliminar el producto."
        )
      }

      setProducts((current) =>
        current.filter(
          (item) => item.id !== product.id
        )
      )
    } catch (err) {
      console.error(
        "ERROR ELIMINANDO PRODUCTO:",
        err
      )

      alert(
        "No se pudo eliminar el producto."
      )
    } finally {
      setDeletingId(null)
    }
  }

  const filteredProducts = useMemo(() => {
    const term = search
      .trim()
      .toLowerCase()

    if (!term) return products

    return products.filter((product) => {
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
    })
  }, [products, search])

  const groupedProducts = useMemo(() => {
    const groups: Record<
      string,
      Product[]
    > = {}

    filteredProducts.forEach((product) => {
      const category =
        product.category?.trim() ||
        "Sin categoría"

      if (!groups[category]) {
        groups[category] = []
      }

      groups[category].push(product)
    })

    return Object.entries(groups).sort(
      ([a], [b]) =>
        a.localeCompare(b, "es", {
          sensitivity: "base",
        })
    )
  }, [filteredProducts])

  return (
    <>
      <main className="min-h-screen bg-white text-zinc-950">

        {/* HEADER */}

        <header className="border-b border-zinc-100 bg-white">
          <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">

            <div>
              <p className="text-sm font-medium text-emerald-700">
                {club?.name || "Catálogo"}
              </p>

              <h1 className="text-2xl font-bold tracking-tight">
                Productos
              </h1>
            </div>

            <Link href="/dashboard/catalogo/nuevo">
              <Button className="h-11 shrink-0 rounded-full bg-emerald-900 px-4 text-sm font-semibold text-white hover:bg-emerald-800 sm:px-6">
                <Plus className="mr-2 h-4 w-4" />
                Agregar producto
              </Button>
            </Link>

          </div>
        </header>

        {/* CONTENT */}

        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">

          {/* BACK */}

          <Link
            href="/dashboard"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-emerald-800"
          >
            ← Volver al dashboard
          </Link>

          {/* CLUB */}

          {club && (
            <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-4 sm:mb-8 sm:px-5">

              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                Club
              </p>

              <p className="mt-1 text-lg font-bold text-zinc-950">
                {club.name}
              </p>

            </div>
          )}

          {/* TITLE + SEARCH */}

          <div className="mb-8 flex flex-col gap-5 sm:mb-10 md:flex-row md:items-end md:justify-between">

            <div>
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                Tu catálogo
              </h2>

              <p className="mt-1 text-zinc-500">
                Administrá productos, precios y disponibilidad.
              </p>
            </div>

            <div className="relative w-full md:w-80">

              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

              <input
                type="text"
                placeholder="Buscar producto..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="h-11 w-full rounded-full border border-zinc-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              />

            </div>

          </div>

          {/* ERROR */}

          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {/* LOADING */}

          {loading && (
            <div className="rounded-3xl border border-zinc-200 bg-white p-16 text-center">

              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-emerald-800" />

              <p className="mt-4 text-sm text-zinc-500">
                Cargando productos...
              </p>

            </div>
          )}

          {/* EMPTY */}

          {!loading &&
            !error &&
            products.length === 0 && (
              <div className="rounded-3xl border border-dashed border-zinc-300 bg-zinc-50/50 px-6 py-16 text-center">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
                  <Package className="h-8 w-8" />
                </div>

                <h3 className="mt-5 text-xl font-bold">
                  Todavía no tenés productos
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
                  Agregá tu primer producto para comenzar a administrar el catálogo y el stock de tu club.
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

              </div>
            )}

          {/* SEARCH EMPTY */}

          {!loading &&
            !error &&
            products.length > 0 &&
            filteredProducts.length === 0 && (
              <div className="rounded-3xl border border-zinc-200 bg-zinc-50/50 px-6 py-16 text-center">

                <Search className="mx-auto h-8 w-8 text-zinc-300" />

                <h3 className="mt-4 text-lg font-bold">
                  No encontramos productos
                </h3>

                <p className="mt-1 text-sm text-zinc-500">
                  Probá con otro nombre, categoría o marca.
                </p>

              </div>
            )}

          {/* CATEGORIES */}

          {!loading &&
            !error &&
            groupedProducts.length > 0 && (
              <div className="space-y-12">

                {groupedProducts.map(
                  ([category, categoryProducts]) => (
                    <section key={category}>

                      <div className="mb-5 flex items-center gap-4">

                        <div>
                          <h3 className="text-2xl font-bold tracking-tight">
                            {category}
                          </h3>

                          <p className="mt-1 text-sm text-zinc-400">
                            {categoryProducts.length}{" "}
                            {categoryProducts.length === 1
                              ? "producto"
                              : "productos"}
                          </p>
                        </div>

                        <div className="h-px flex-1 bg-zinc-100" />

                      </div>

                      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white">

                        <div className="overflow-x-auto">

                          <table className="w-full">

                            <thead className="border-b border-zinc-100 bg-zinc-50/70">

                              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">

                                <th className="px-6 py-4">
                                  Producto
                                </th>

                                <th className="hidden px-6 py-4 md:table-cell">
  Marca
</th>

<th className="hidden px-6 py-4 md:table-cell">
  Precio compra
</th>

                                <th className="px-6 py-4">
                                  Precio venta
                                </th>

                                <th className="px-6 py-4">
                                  Stock
                                </th>

                                <th className="px-6 py-4 text-right">
                                  Acciones
                                </th>

                              </tr>

                            </thead>

                            <tbody>

                              {categoryProducts.map(
                                (product) => {

                                  const lowStock =
                                    product.stock <=
                                    product.minStock

                                  const deleting =
                                    deletingId ===
                                    product.id

                                  return (
                                    <tr
                                      key={product.id}
                                      className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/50"
                                    >

                                      <td className="px-6 py-5">

                                        <div className="flex min-w-0 items-center gap-3">

                                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                                            <Package className="h-5 w-5" />
                                          </div>

                                          <div className="min-w-0">

                                            <p className="font-semibold text-zinc-950">
                                              {product.name}
                                            </p>

                                            {product.provider && (
                                              <p className="mt-0.5 text-xs text-zinc-400">
                                                {product.provider}
                                              </p>
                                            )}

                                          </div>

                                        </div>

                                      </td>

<td className="hidden px-6 py-5 text-sm text-zinc-600 md:table-cell">
                                            {product.brand || "—"}
                                      </td>

<td className="hidden px-6 py-5 text-sm text-zinc-600 md:table-cell">
                                        {product.purchasePrice != null
                                          ? `$${product.purchasePrice.toLocaleString(
                                              "es-UY"
                                            )}`
                                          : "—"}
                                      </td>

                                      <td className="px-3 py-4 text-sm font-semibold text-zinc-950 sm:px-6 sm:py-5">
                                        {product.salePrice != null
                                          ? `$${product.salePrice.toLocaleString(
                                              "es-UY"
                                            )}`
                                          : "—"}
                                      </td>

                                      <td className="px-3 py-4 sm:px-6 sm:py-5">

                                        <div className="w-24 sm:w-28">

  <div className="h-2 overflow-hidden rounded-full bg-zinc-100">

    <div
      className={`h-full rounded-full transition-all ${
        lowStock
          ? "bg-orange-400"
          : "bg-emerald-600"
      }`}
      style={{
        width: `${
          product.minStock > 0
            ? Math.min(
                100,
                Math.max(
                  8,
                  (product.stock /
                    (product.minStock * 3)) *
                    100
                )
              )
            : product.stock > 0
              ? 100
              : 0
        }%`,
      }}
    />

  </div>

  <div className="mt-1.5 flex items-center gap-1">

    {lowStock && (
      <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
    )}

    <span
      className={`text-xs font-medium ${
        lowStock
          ? "text-orange-600"
          : "text-zinc-400"
      }`}
    >
      {lowStock ? "Stock bajo" : "Disponible"}
    </span>

  </div>

</div>

                                      </td>

                                      <td className="px-3 py-4 sm:px-6 sm:py-5">

                                        <div className="flex justify-end gap-1 sm:gap-2">

                                          <Button
                                            type="button"
                                            variant="outline"
                                            onClick={async () => {
  setEditingProduct(product)
  setEditAttributes([])
  setLoadingEditAttributes(true)

  try {
    let categoryId = product.categoryId

    if (!categoryId && product.category) {
      const clubId = localStorage.getItem(
        "growcrm_active_club_id"
      )

      if (!clubId) {
        throw new Error(
          "No hay un club seleccionado."
        )
      }

      const categoriesResponse = await fetch(
        `${API_URL}/club/${clubId}/product-categories`
      )

      if (!categoriesResponse.ok) {
        throw new Error(
          "No se pudieron cargar las categorías."
        )
      }

      const categories =
        await categoriesResponse.json()

      const matchedCategory =
        Array.isArray(categories)
          ? categories.find(
              (category) =>
                category.name === product.category
            )
          : null

      categoryId = matchedCategory?.id || null

      if (categoryId) {
        setEditingProduct((current) =>
          current
            ? {
                ...current,
                categoryId,
              }
            : current
        )
      }
    }

    if (!categoryId) {
      setEditAttributes([])
      return
    }

    const response = await fetch(
      `${API_URL}/product-category/${categoryId}/attributes`
    )

    if (!response.ok) {
      throw new Error(
        "No se pudieron cargar los atributos."
      )
    }

    const data = await response.json()

    setEditAttributes(
      Array.isArray(data) ? data : []
    )
  } catch (error) {
    console.error(
      "ERROR CARGANDO ATRIBUTOS PARA EDITAR:",
      error
    )

    alert(
      "No se pudieron cargar los atributos del producto."
    )

    setEditingProduct(null)
  } finally {
    setLoadingEditAttributes(false)
  }
}}
                                            disabled={deleting}
                                            className="h-9 rounded-full px-2 text-xs sm:px-4 sm:text-sm"
                                          >
                                            <Pencil className="mr-2 h-3.5 w-3.5" />
                                            Editar
                                          </Button>

                                          <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                              handleDeleteProduct(
                                                product
                                              )
                                            }
                                            disabled={deleting}
className="h-9 rounded-full border-red-200 px-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 sm:px-4 sm:text-sm"                                          >
                                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                                            {deleting
                                              ? "Eliminando..."
                                              : "Eliminar"}
                                          </Button>

                                        </div>

                                      </td>

                                    </tr>
                                  )
                                }
                              )}

                            </tbody>

                          </table>

                        </div>

                      </div>

                    </section>
                  )
                )}

              </div>
            )}

          {/* FOOTER */}

          <footer className="mt-20 border-t border-zinc-200 pt-8">

            <div className="flex flex-col justify-between gap-4 pb-6 sm:flex-row sm:items-center">

              <p className="text-sm text-zinc-400">
                © {new Date().getFullYear()} GrowCRM
              </p>

              <Link
                href="/dashboard"
                className="text-sm font-medium text-zinc-600 transition hover:text-emerald-800"
              >
                ← Volver al dashboard
              </Link>

            </div>

          </footer>

        </section>

      </main>

      {/* EDIT MODAL */}

      {editingProduct && (
<EditProductModal
  product={editingProduct}
  attributes={editAttributes}
  loadingAttributes={loadingEditAttributes}
  saving={saving}
  onClose={() => {
    setEditingProduct(null)
    setEditAttributes([])
  }}
  onSave={handleSaveProduct}
/>
      )}
    </>
  )
}

/* =============================================================== */
/* EDIT MODAL */
/* =============================================================== */

function EditProductModal({
  product,
  attributes,
  loadingAttributes,
  saving,
  onClose,
  onSave,
}: {
  product: Product
  attributes: Attribute[]
  loadingAttributes: boolean
  saving: boolean
  onClose: () => void
  onSave: (product: Product) => Promise<void>
}) {
  const [form, setForm] = useState<Product>(product)

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()
    onSave(form)
  }

  function updateAttribute(
    slug: string,
    value: string | number | number[]
  ) {
    setForm((current) => ({
      ...current,
      attributes: {
        ...(current.attributes || {}),
        [slug]: value,
      },
    }))
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-100 bg-white px-6 py-5">

          <div>
            <p className="text-sm font-medium text-emerald-700">
              Catálogo
            </p>

            <h2 className="text-xl font-bold">
              Editar producto
            </h2>

            <p className="mt-1 text-sm text-zinc-400">
              {product.category || "Producto"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            <X className="h-5 w-5" />
          </button>

        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-6"
        >

{loadingAttributes ? (
  <div className="py-10 text-center text-sm text-zinc-500">
    Cargando información del producto...
  </div>
) : !attributes.length ? (
  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-5 text-sm text-zinc-500">
    Este producto todavía no tiene atributos configurados para su categoría.
  </div>
) : (
  <div className="space-y-6">

    {attributes
      .slice()
      .sort(
        (a, b) =>
          a.sortOrder - b.sortOrder
      )
      .map((attribute) => (
        <DynamicEditField
          key={attribute.id}
          attribute={attribute}
          value={
            form.attributes?.[attribute.slug]
          }
          onChange={(value) =>
            updateAttribute(
              attribute.slug,
              value
            )
          }
        />
      ))}

    {/* STOCK */}

    <div className="border-t border-zinc-100 pt-6">

      <div className="mb-3">
        <label className="block text-sm font-medium text-zinc-700">
          Stock
        </label>

        <p className="mt-1 text-xs text-zinc-400">
          Podés dejarlo vacío y completarlo más adelante.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

        <input
          type="number"
          min="0"
          step="0.01"
          value={
            form.stock !== null &&
            form.stock !== undefined
              ? form.stock
              : ""
          }
          onChange={(e) =>
            setForm((current) => ({
              ...current,
              stock:
                e.target.value === ""
                  ? 0
                  : Number(e.target.value),
            }))
          }
          placeholder="Cantidad"
          className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
        />

        <select
          value={
            typeof form.attributes?.stockUnit === "string"
              ? form.attributes.stockUnit
              : ""
          }
          onChange={(e) =>
            updateAttribute(
              "stockUnit",
              e.target.value
            )
          }
          className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
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

      <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <strong>Recordatorio:</strong> para publicar este producto
        necesitás definir el stock y la unidad.
      </div>

    </div>

  </div>
)}

          <div className="flex flex-col-reverse gap-3 border-t border-zinc-100 pt-5 sm:flex-row sm:justify-end">

            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={
                saving ||
                loadingAttributes
              }
              className="h-11 rounded-full px-6"
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={
                saving ||
                loadingAttributes ||
                !attributes.length
              }
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

function DynamicEditField({
  attribute,
  value,
  onChange,
}: {
  attribute: Attribute
  value: string | number | number[] | undefined
  onChange: (
    value: string | number | number[]
  ) => void
}) {
  const requiredMark =
    attribute.required ? " *" : ""

  if (attribute.type === "select") {
    const options = Array.isArray(attribute.options)
      ? attribute.options
      : []

    return (
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-700">
          {attribute.name}
          {requiredMark}
        </label>

        <select
          value={
            typeof value === "string"
              ? value
              : ""
          }
          onChange={(e) =>
            onChange(e.target.value)
          }
          className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
        >
          <option value="">
            Seleccioná una opción
          </option>

          {options.map((option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          ))}
        </select>
      </div>
    )
  }

  if (attribute.type === "rating") {
    const current =
      typeof value === "number"
        ? value
        : 0

    return (
      <div>
        <label className="mb-3 block text-sm font-medium text-zinc-700">
          {attribute.name}
          {requiredMark}
        </label>

        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((number) => (
            <button
              key={number}
              type="button"
              onClick={() =>
                onChange(number)
              }
              className={`h-10 w-10 rounded-xl border text-sm font-semibold transition ${
                number <= current
                  ? "border-emerald-700 bg-emerald-700 text-white"
                  : "border-zinc-200 bg-white text-zinc-500 hover:border-emerald-300"
              }`}
            >
              {number}
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (attribute.type === "number") {
    return (
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-700">
          {attribute.name}
          {requiredMark}
        </label>

        <input
          type="number"
          min="0"
          step="0.01"
          value={
            typeof value === "number"
              ? value
              : ""
          }
          onChange={(e) =>
            onChange(
              e.target.value === ""
                ? ""
                : Number(e.target.value)
            )
          }
          className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
        />
      </div>
    )
  }

  if (attribute.type === "multi-number") {
    const values = Array.isArray(value)
      ? value
      : []

    return (
      <div>
        <label className="mb-3 block text-sm font-medium text-zinc-700">
          {attribute.name}
          {requiredMark}
        </label>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1, 3.5, 5, 10].map((weight) => {
            const active =
              values.includes(weight)

            return (
              <button
                key={weight}
                type="button"
                onClick={() =>
                  onChange(
                    active
                      ? values.filter(
                          (item) =>
                            item !== weight
                        )
                      : [
                          ...values,
                          weight,
                        ]
                  )
                }
                className={`h-11 rounded-xl border text-sm font-semibold transition ${
                  active
                    ? "border-emerald-700 bg-emerald-50 text-emerald-800"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-emerald-300"
                }`}
              >
                {weight} g
              </button>
            )
          })}
        </div>

        <p className="mt-2 text-xs text-zinc-400">
          Seleccioná los pesos que el club ofrece.
        </p>
      </div>
    )
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-700">
        {attribute.name}
        {requiredMark}
      </label>

      <input
        type={
          attribute.type === "image"
            ? "url"
            : "text"
        }
        value={
          typeof value === "string"
            ? value
            : ""
        }
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={
          attribute.type === "image"
            ? "URL de imagen"
            : ""
        }
        className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
      />
    </div>
  )
}