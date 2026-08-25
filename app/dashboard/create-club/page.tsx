"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Building2, Leaf, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const API_URL =
  "https://growcrm-api-production.up.railway.app"

interface ClubTemplate {
  id: string
  name: string
  slug: string
  description: string | null
}

export default function CreateClubPage() {
  const router = useRouter()

  const [templates, setTemplates] = useState<ClubTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")
  const [acceptRequirements, setAcceptRequirements] = useState(false)

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          router.push("/auth/login")
          return
        }

        const response = await fetch(`${API_URL}/club/templates`)

        if (!response.ok) {
          throw new Error("No se pudieron cargar los templates")
        }

        const data = await response.json()

        setTemplates(data)

        const standardTemplate = data.find(
  (template: ClubTemplate) => template.slug === "standard"
)

if (standardTemplate) {
  setSelectedTemplate(standardTemplate.id)
} else if (data.length > 0) {
  setSelectedTemplate(data[0].id)
}
      } catch (err) {
        console.error(err)
        setError("No se pudieron cargar los tipos de club.")
      } finally {
        setLoading(false)
      }
    }

    loadTemplates()
  }, [router])

  useEffect(() => {
    const selected = templates.find(
      (template) => template.id === selectedTemplate
    )

    if (selected?.slug !== "cannabis") {
      setAcceptRequirements(false)
    }
  }, [selectedTemplate, templates])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError("Ingresá el nombre del club.")
      return
    }

    if (!selectedTemplate) {
      setError("Seleccioná un tipo de club.")
      return
    }
    const selectedTemplateData = templates.find(
  (template) => template.id === selectedTemplate
)

if (
  selectedTemplateData?.slug === "cannabis" &&
  !acceptRequirements
) {
  setError(
    "Debés leer y aceptar los requisitos aplicables a los Clubes de Membresía."
  )
  return
}

    setCreating(true)
    setError("")

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user?.email) {
        router.push("/auth/login")
        return
      }

      const response = await fetch(`${API_URL}/club`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          templateId: selectedTemplate,
          email: session.user.email,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || "No se pudo crear el club")
      }

      console.log("✅ CLUB CREATED:", data)

      router.push("/dashboard")
    } catch (err) {
      console.error("❌ CREATE CLUB ERROR:", err)

      setError(
        err instanceof Error
          ? err.message
          : "No se pudo crear el club."
      )
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <p className="text-zinc-500">Cargando...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-4xl">

        {/* VOLVER */}
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="mb-6 flex min-h-10 items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-900 sm:mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a mis clubes
        </button>

        {/* HEADER */}
        <div className="mb-8 text-center sm:mb-10">

          <div className="mb-5 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
            Crear club
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            Creá tu club
          </h1>

<p className="mx-auto mt-3 max-w-2xl text-base leading-6 text-zinc-500 sm:mt-4 sm:text-lg sm:leading-7">
              Elegí el tipo de club y configurá la información básica
            para comenzar.
          </p>

        </div>

        <form onSubmit={handleCreate}>

{/* TIPO DE CLUB */}
<section className="mb-8">
  <h2 className="mb-4 text-xl font-bold text-zinc-900">
    Tipo de club
  </h2>

  <div className="max-w-xl">
    <div className="relative">
      <select
        value={selectedTemplate}
        onChange={(e) => setSelectedTemplate(e.target.value)}
        className="h-12 w-full appearance-none rounded-xl border border-zinc-200 bg-white px-4 pr-12 text-zinc-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
      >
        {templates
          .slice()
          .sort((a, b) => {
            if (a.slug === "standard") return -1
            if (b.slug === "standard") return 1
            return 0
          })
          .map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
      </select>

      {/* Flecha */}
      <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
        <svg
          className="h-4 w-4 text-zinc-500"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </div>

    {selectedTemplate && (
      <p className="mt-3 text-sm text-zinc-500">
        {
          templates.find(
            (template) => template.id === selectedTemplate
          )?.description
        }
      </p>
    )}
  </div>
</section>

          {/* DATOS */}
          <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-8">

            <h2 className="text-xl font-bold text-zinc-900">
              Información del club
            </h2>

            <p className="mt-2 text-zinc-500">
              Estos datos podrán modificarse posteriormente.
            </p>

            <div className="mt-6 space-y-5 sm:mt-7 sm:space-y-6">

              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-700">
                  Nombre del club
                </label>

                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Club Verde"
                  className="h-12 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-700">
                  Descripción
                </label>

                <Textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  placeholder="Contale a tus socios qué es este club..."
                  className="min-h-[120px] resize-none rounded-xl sm:min-h-[140px]"
                />
              </div>

            </div>

            {error && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
{/* REQUISITOS CANNABIS */}
{templates.find((template) => template.id === selectedTemplate)?.slug ===
  "cannabis" && (
  <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-6">

    <h3 className="text-lg font-bold text-zinc-900">
      Requisitos para Club de Membresía Cannábico
    </h3>

    <p className="mt-2 text-sm leading-6 text-zinc-600">
      Antes de crear el club, verificá que la organización pueda cumplir
      con los requisitos legales y regulatorios aplicables.
    </p>

    <div className="mt-5 max-h-72 overflow-y-auto rounded-xl border border-amber-200 bg-white p-4 sm:max-h-80 sm:p-5">

      <ul className="space-y-4 text-sm leading-6 text-zinc-700">

        <li>
          <strong>• Asociación Civil:</strong> el club debe constituirse
          como Asociación Civil y obtener el reconocimiento de su
          personería jurídica correspondiente.
        </li>

        <li>
          <strong>• Cantidad de socios:</strong> el Club de Membresía debe
          contar con un mínimo de 15 y un máximo de 45 socios.
        </li>

        <li>
          <strong>• Miembros habilitados:</strong> los miembros deben ser
          personas físicas capaces, mayores de edad, ciudadanos naturales
          o legales uruguayos, o personas con residencia permanente,
          conforme a los requisitos establecidos por el IRCCA.
        </li>

        <li>
          <strong>• Objeto del club:</strong> la normativa establece como
          objeto la plantación, cultivo y cosecha de cannabis psicoactivo
          destinado al uso de sus miembros. También contempla actividades
          de información y educación sobre consumo responsable dirigidas
          exclusivamente a sus integrantes.
        </li>

        <li>
          <strong>• Producción:</strong> se permite hasta 99 plantas de
          cannabis psicoactivo y la producción y acopio anual no puede
          superar los 480 gramos por socio.
        </li>

        <li>
          <strong>• Distribución:</strong> la producción debe distribuirse
          entre los miembros para su uso personal, dejando constancia de
          las entregas realizadas y cumpliendo los mecanismos de registro
          correspondientes.
        </li>

        <li>
          <strong>• Responsable Técnico:</strong> el club debe contar con
          un Responsable Técnico encargado de controlar el cumplimiento de
          las normas vigentes establecidas por el IRCCA.
        </li>

        <li>
          <strong>• Sede:</strong> el club debe contar con una única sede
          donde se desarrollen las actividades correspondientes, incluyendo
          plantación, cultivo, cosecha, procesamiento y distribución.
        </li>

        <li>
          <strong>• Ubicación:</strong> la guía del IRCCA establece
          condiciones específicas de ubicación, incluyendo una distancia
          mayor a 150 metros respecto de determinados centros donde
          concurran menores de edad y de instituciones de atención y
          tratamiento de adicciones.
        </li>

        <li>
          <strong>• Infraestructura:</strong> deben cumplirse las
          condiciones mínimas de seguridad, infraestructura, cultivo,
          almacenamiento y funcionamiento establecidas por el IRCCA.
        </li>

        <li>
          <strong>• Planes:</strong> para el registro deben presentarse,
          entre otros documentos, un Plan de Producción/Cultivo y un plan
          de distribución o sistema de entregas.
        </li>

        <li>
          <strong>• Registro ante IRCCA:</strong> el club y sus miembros
          deben cumplir con las obligaciones de registro correspondientes.
          Las altas, bajas y modificaciones de los miembros deben
          gestionarse conforme al sistema establecido por el IRCCA.
        </li>

        <li>
          <strong>• Información de los miembros:</strong> la información
          relativa a la identidad de los miembros tiene carácter de dato
          sensible y debe tratarse conforme a la normativa aplicable.
        </li>

      </ul>
    </div>

<label className="mt-5 flex cursor-pointer items-start gap-3">

      <input
        type="checkbox"
        checked={acceptRequirements}
        onChange={(e) =>
          setAcceptRequirements(e.target.checked)
        }
        className="mt-1 h-5 w-5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
      />

      <span className="text-sm leading-6 text-zinc-700">
        <strong>
          Declaro que he leído y comprendido estos requisitos
        </strong>{" "}
        y que la información proporcionada para crear este club es
        correcta. Me comprometo a utilizar GrowCRM de acuerdo con la
        normativa aplicable y a gestionar las actividades del club bajo
        mi responsabilidad.
      </span>

    </label>

    <p className="mt-4 text-xs leading-5 text-zinc-500">
      GrowCRM es una herramienta de gestión y no sustituye la inscripción,
      habilitación, asesoramiento profesional ni las obligaciones que
      correspondan ante el IRCCA u otros organismos competentes.
    </p>

  </div>
)}
            <div className="mt-8 flex justify-end">
  <Button
    type="submit"
    disabled={creating}
    className="h-12 w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-8 font-bold shadow-lg hover:from-emerald-700 hover:to-teal-600 sm:w-auto"
  >
                {creating
                  ? "Creando club..."
                  : "Crear club →"}
              </Button>
            </div>

          </section>

        </form>
      </div>
    </main>
  )
}