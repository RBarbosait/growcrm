"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Package,
  Save,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://growcrm-api-production.up.railway.app"

type Category = {
  id: string
  name: string
  slug: string
  sortOrder: number
  attributes: Attribute[]
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

type FormValues = Record<string, string | number | number[]>

export default function NuevoProductoPage() {
  const router = useRouter()

  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] =
    useState<Category | null>(null)

  const [formValues, setFormValues] =
    useState<FormValues>({})

  const [loadingCategories, setLoadingCategories] =
    useState(true)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    loadCategories()
  }, [])

  async function loadCategories() {
    try {
      setLoadingCategories(true)
      setError("")

      const clubId =
        typeof window !== "undefined"
          ? localStorage.getItem("growcrm_active_club_id")
          : null

      if (!clubId) {
        setError("No se encontró el club seleccionado.")
        return
      }

      const response = await fetch(
        `${API_URL}/club/${clubId}/product-categories`
      )

      if (!response.ok) {
        const data = await response.json().catch(() => null)

        throw new Error(
          data?.error ||
            "No se pudieron cargar las categorías."
        )
      }

      const data = await response.json()

      setCategories(
        Array.isArray(data) ? data : []
      )
    } catch (err) {
      console.error(
        "ERROR CARGANDO CATEGORÍAS:",
        err
      )

      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar las categorías."
      )
    } finally {
      setLoadingCategories(false)
    }
  }

  function handleCategoryChange(
    categoryId: string
  ) {
    const category =
      categories.find(
        (item) => item.id === categoryId
      ) || null

    setSelectedCategory(category)
    setFormValues({})
    setError("")
  }

  function handleChange(
    slug: string,
    value: string | number | number[]
  ) {
    setFormValues((current) => ({
      ...current,
      [slug]: value,
    }))
  }

  function isMissingRequired(
    attribute: Attribute
  ) {
    const value = formValues[attribute.slug]

    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return true
    }

    if (
      Array.isArray(value) &&
      value.length === 0
    ) {
      return true
    }

    return false
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault()

    setError("")

    if (!selectedCategory) {
      setError("Seleccioná una categoría.")
      return
    }

    const missingAttribute =
      selectedCategory.attributes.find(
        (attribute) =>
          attribute.required &&
          isMissingRequired(attribute)
      )

    if (missingAttribute) {
      setError(
        `Completá el campo "${missingAttribute.name}".`
      )
      return
    }

    const clubId =
      typeof window !== "undefined"
        ? localStorage.getItem(
            "growcrm_active_club_id"
          )
        : null

    if (!clubId) {
      setError("No se encontró el club seleccionado.")
      return
    }

    setLoading(true)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user?.email) {
        router.push("/auth/login")
        return
      }

      const attributes = {
        ...formValues,
      }

      const name =
        typeof attributes.nombre === "string"
          ? attributes.nombre.trim()
          : ""

      if (!name) {
        setError(
          "El nombre del producto es obligatorio."
        )
        return
      }

      const response = await fetch(
        `${API_URL}/product`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clubId,
            email: session.user.email,

            name,

            category:
              selectedCategory.name,

            categoryId:
              selectedCategory.id,

            attributes,

            // Compatibilidad temporal con la API actual
            salePrice:
              typeof attributes["precio"] ===
              "number"
                ? attributes["precio"]
                : typeof attributes[
                      "precio-por-gramo"
                    ] === "number"
                ? attributes["precio-por-gramo"]
                : 0,

            stock:
              typeof attributes.stock ===
              "number"
                ? attributes.stock
                : 0,

            minStock: 0,

            brand:
              typeof attributes.marca ===
              "string"
                ? attributes.marca
                : null,

            imageUrl:
              typeof attributes.imagen ===
              "string"
                ? attributes.imagen
                : null,
          }),
        }
      )

      const data = await response
        .json()
        .catch(() => null)

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "No se pudo crear el producto."
        )
      }

      router.push("/dashboard/catalogo")
      router.refresh()
    } catch (err) {
      console.error(
        "ERROR CREANDO PRODUCTO:",
        err
      )

      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al crear el producto."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">

      {/* HEADER */}

      <header className="flex min-h-20 items-center border-b border-zinc-200 bg-white px-4 py-3 sm:px-6 md:px-8">

        <div className="flex items-center gap-4">

          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              router.push("/dashboard/catalogo")
            }
            className="rounded-xl"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div>

            <p className="text-sm text-zinc-400">
              Catálogo
            </p>

            <h1 className="text-xl font-bold">
              Nuevo producto
            </h1>

          </div>

        </div>

      </header>

      {/* CONTENT */}

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 md:py-10">

        <div className="mb-6 sm:mb-8">

          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <Package className="h-6 w-6" />
          </div>

          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Agregar producto
          </h2>

          <p className="mt-2 text-zinc-500">
            La información que aparece depende de la categoría seleccionada.
          </p>

        </div>

        <Card className="rounded-3xl border-zinc-200 shadow-none">

          <CardHeader>
            <CardTitle>
              Información del producto
            </CardTitle>
          </CardHeader>

          <CardContent className="px-4 pb-5 sm:px-6 sm:pb-6">

            <form
              onSubmit={handleSubmit}
              className="space-y-8"
            >

              {/* CATEGORY */}

              <div>

                <label
                  htmlFor="category"
                  className="mb-2 block text-sm font-medium text-zinc-700"
                >
                  Categoría *
                </label>

                <select
                  id="category"
                  value={
                    selectedCategory?.id || ""
                  }
                  onChange={(e) =>
                    handleCategoryChange(
                      e.target.value
                    )
                  }
                  disabled={loadingCategories}
                  className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >

                  <option value="">
                    {loadingCategories
                      ? "Cargando categorías..."
                      : "Seleccioná una categoría"}
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* DYNAMIC ATTRIBUTES */}

              {selectedCategory && (
                <div className="space-y-5 border-t border-zinc-100 pt-5 sm:space-y-6 sm:pt-6">

                  {selectedCategory.attributes
                    .slice()
                    .sort(
                      (a, b) =>
                        a.sortOrder -
                        b.sortOrder
                    )
                    .map((attribute) => (

                      <DynamicField
                        key={attribute.id}
                        attribute={attribute}
                        value={
                          formValues[
                            attribute.slug
                          ]
                        }
                        onChange={(value) =>
                          handleChange(
                            attribute.slug,
                            value
                          )
                        }
                      />

                    ))}

                </div>
              )}

              {/* ERROR */}

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* ACTIONS */}

              <div className="flex flex-col-reverse gap-3 border-t border-zinc-100 pt-6 sm:flex-row sm:justify-end">

                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  onClick={() =>
                    router.push(
                      "/dashboard/catalogo"
                    )
                  }
                  className="h-12 rounded-xl px-6"
                >
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  disabled={
                    loading ||
                    loadingCategories ||
                    !selectedCategory
                  }
                  className="h-12 w-full rounded-xl bg-emerald-900 px-7 font-semibold hover:bg-emerald-800 sm:w-auto"
                >
                  <Save className="mr-2 h-4 w-4" />

                  {loading
                    ? "Guardando..."
                    : "Guardar producto"}
                </Button>

              </div>

            </form>

          </CardContent>

        </Card>

      </main>

    </div>
  )
}

function DynamicField({
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
    const options =
      Array.isArray(attribute.options)
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
          className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
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

        <div className="flex items-center gap-2">

          {[1, 2, 3, 4, 5].map(
            (number) => (
              <button
                key={number}
                type="button"
                onClick={() =>
                  onChange(number)
                }
                className={`flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-semibold transition ${
                  number <= current
                    ? "border-emerald-700 bg-emerald-700 text-white"
                    : "border-zinc-200 bg-white text-zinc-500 hover:border-emerald-300"
                }`}
              >
                {number}
              </button>
            )
          )}

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
          className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />

      </div>
    )
  }

  if (attribute.type === "multi-number") {
    const values = Array.isArray(value)
      ? value
      : []

    function toggleWeight(
      weight: number
    ) {
      const exists =
        values.includes(weight)

      onChange(
        exists
          ? values.filter(
              (item) =>
                item !== weight
            )
          : [...values, weight]
      )
    }

    return (
      <div>

        <label className="mb-3 block text-sm font-medium text-zinc-700">
          {attribute.name}
          {requiredMark}
        </label>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

          {[1, 3.5, 5, 10].map(
            (weight) => {

              const active =
                values.includes(weight)

              return (
                <button
                  key={weight}
                  type="button"
                  onClick={() =>
                    toggleWeight(weight)
                  }
                  className={`h-12 rounded-xl border text-sm font-semibold transition ${
                    active
                      ? "border-emerald-700 bg-emerald-50 text-emerald-800"
                      : "border-zinc-200 bg-white text-zinc-600 hover:border-emerald-300"
                  }`}
                >
                  {weight} g
                </button>
              )
            }
          )}

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
        className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
      />

    </div>
  )
}