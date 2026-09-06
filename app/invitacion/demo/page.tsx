"use client"

import { useState } from "react"
import {
  ArrowRight,
  Check,
  Lock,
  Mail,
  Phone,
  User,
} from "lucide-react"

export default function InvitacionDemoPage() {
  const [showForm, setShowForm] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    password: "",
    confirmPassword: "",
    accept: false,
  })

  const updateField = (
    field: keyof typeof form,
    value: string | boolean
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

const handleSubmit = async (
  event: React.FormEvent<HTMLFormElement>
) => {
  event.preventDefault()

  if (
    !form.nombre ||
    !form.apellido ||
    !form.email ||
    !form.password ||
    !form.confirmPassword
  ) {
    alert("Completá todos los campos obligatorios.")
    return
  }

  if (form.password !== form.confirmPassword) {
    alert("Las contraseñas no coinciden.")
    return
  }

  if (!form.accept) {
    alert("Tenés que aceptar las condiciones para continuar.")
    return
  }

  try {
    // Tomamos el clubId de la URL:
    // /invitacion/demo?clubId=...
    const params = new URLSearchParams(window.location.search)
    const clubId = params.get("clubId")

    if (!clubId) {
      alert("No se encontró el club asociado a esta invitación.")
      return
    }

const API_URL =
  "https://growcrm-api-production.up.railway.app"

const response = await fetch(
  `${API_URL}/membership-request`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
body: JSON.stringify({
  clubId,
  nombre: form.nombre.trim(),
  apellido: form.apellido.trim(),
  email: form.email.trim(),
  telefono: form.telefono.trim(),
  password: form.password,
}),
  }
)

    const raw = await response.text()

console.log("STATUS:", response.status)
console.log("RESPONSE:", raw)

let data: any = {}

try {
  data = JSON.parse(raw)
} catch {
  data = { error: raw }
}

    if (!response.ok) {
      if (response.status === 409) {
        alert(
          data.error === "Membership request already pending"
            ? "Ya existe una solicitud pendiente para este email."
            : "Este usuario ya pertenece al club."
        )
        return
      }

      throw new Error(data.error || "No se pudo enviar la solicitud.")
    }

    console.log("✅ SOLICITUD CREADA:", data)

    setSubmitted(true)
  } catch (error) {
    console.error("❌ ERROR EN REGISTRO:", error)

    alert(
      error instanceof Error
        ? error.message
        : "No se pudo enviar la solicitud."
    )
  }
}

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#f5faf8] px-5 py-10">
        <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-md items-center justify-center">
          <section className="w-full rounded-[32px] border border-zinc-200 bg-white p-8 text-center shadow-sm sm:p-10">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e6f5f0]">
              <Check className="h-8 w-8 text-[#007f63]" />
            </div>

            <p className="mt-6 text-sm font-semibold text-[#007f63]">
              Registro recibido
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#092f35]">
              ¡Bienvenido al club!
            </h1>

            <p className="mt-4 text-sm leading-6 text-zinc-500">
              Recibimos tus datos correctamente. Tu incorporación al club
              quedará pendiente de validación por parte de la administración.
            </p>

            <div className="mt-8 rounded-2xl bg-[#f5faf8] p-4 text-left">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Estado
              </p>

              <p className="mt-1 text-sm font-semibold text-[#092f35]">
                Solicitud enviada
              </p>
            </div>

            <p className="mt-6 text-xs leading-5 text-zinc-400">
              Podés cerrar esta ventana. Te informaremos cuando tu registro
              haya sido aprobado.
            </p>
          </section>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f5faf8]">

      {/* TOP BRAND */}
      <header className="px-5 pt-6 sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#006b55] text-sm font-bold text-white shadow-sm">
              G
            </div>

            <div>
              <p className="text-sm font-bold text-[#092f35]">
                Club demo
              </p>

              <p className="text-xs text-zinc-400">
                Comunidad privada
              </p>
            </div>

          </div>

          <div className="hidden rounded-full bg-white px-4 py-2 text-xs font-semibold text-zinc-500 shadow-sm sm:block">
            Invitación privada
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 pb-12 pt-8 sm:px-8 sm:pt-12">

        {!showForm ? (

          /* ========================================================= */
          /* INVITACIÓN */
          /* ========================================================= */

          <section className="overflow-hidden rounded-[32px] border border-zinc-200 bg-white shadow-sm">

            <div className="grid lg:grid-cols-[1.05fr_.95fr]">

              {/* PRESENTACIÓN */}
              <div className="bg-[#e7f6f1] p-8 sm:p-12 lg:p-14">

                <div className="inline-flex rounded-full bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[#007f63] shadow-sm">
                  Invitación
                </div>

                <h1 className="mt-7 max-w-xl text-4xl font-bold leading-[1.05] tracking-tight text-[#092f35] sm:text-5xl">
                  Te invitamos a ser parte del club
                </h1>

                <p className="mt-6 max-w-lg text-base leading-7 text-[#49615d]">
                  Completá tu registro para formar parte de nuestra comunidad
                  y acceder a todos los beneficios del club.
                </p>

                <div className="mt-8 space-y-3">

                  <Benefit text="Acceso a la comunidad del club" />
                  <Benefit text="Gestión de tu membresía" />
                  <Benefit text="Acceso a los beneficios disponibles" />

                </div>

              </div>

              {/* ACCIÓN */}
              <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-14">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e6f5f0]">
                  <User className="h-6 w-6 text-[#007f63]" />
                </div>

                <h2 className="mt-6 text-2xl font-bold tracking-tight text-[#092f35]">
                  Tu invitación está lista
                </h2>

                <p className="mt-3 text-sm leading-6 text-zinc-500">
                  Para comenzar, completá tus datos y solicitá tu
                  incorporación como socio.
                </p>

                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#006b55] px-5 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#005c49]"
                >
                  Unirme al club
                  <ArrowRight className="h-4 w-4" />
                </button>

                <p className="mt-4 text-center text-xs leading-5 text-zinc-400">
                  El registro está sujeto a la aprobación del club.
                </p>

              </div>

            </div>

          </section>

        ) : (

          /* ========================================================= */
          /* REGISTRO */
          /* ========================================================= */

          <section className="mx-auto max-w-2xl">

            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="mb-5 text-sm font-semibold text-zinc-500 transition hover:text-[#007f63]"
            >
              ← Volver a la invitación
            </button>

            <div className="rounded-[32px] border border-zinc-200 bg-white p-7 shadow-sm sm:p-10">

              <div className="mb-8">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e6f5f0]">
                  <User className="h-5 w-5 text-[#007f63]" />
                </div>

                <p className="mt-6 text-sm font-semibold text-[#007f63]">
                  Registro de socio
                </p>

                <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#092f35]">
                  Completá tus datos
                </h1>

                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  Esta información será utilizada para gestionar tu
                  incorporación al club.
                </p>

              </div>

              <form onSubmit={handleSubmit} className="space-y-5">

                <div className="grid gap-5 sm:grid-cols-2">

                  <Field
                    label="Nombre"
                    placeholder="Tu nombre"
                    value={form.nombre}
                    onChange={(value) =>
                      updateField("nombre", value)
                    }
                    required
                  />

                  <Field
                    label="Apellido"
                    placeholder="Tu apellido"
                    value={form.apellido}
                    onChange={(value) =>
                      updateField("apellido", value)
                    }
                    required
                  />

                </div>

                <Field
                  label="Email"
                  type="email"
                  placeholder="tu@email.com"
                  value={form.email}
                  onChange={(value) =>
                    updateField("email", value)
                  }
                  icon={<Mail className="h-4 w-4" />}
                  required
                />

                <Field
                  label="Teléfono"
                  type="tel"
                  placeholder="09 000 000"
                  value={form.telefono}
                  onChange={(value) =>
                    updateField("telefono", value)
                  }
                  icon={<Phone className="h-4 w-4" />}
                />

                <div className="grid gap-5 sm:grid-cols-2">

                  <Field
                    label="Contraseña"
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(value) =>
                      updateField("password", value)
                    }
                    icon={<Lock className="h-4 w-4" />}
                    required
                  />

                  <Field
                    label="Repetir contraseña"
                    type="password"
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={(value) =>
                      updateField("confirmPassword", value)
                    }
                    icon={<Lock className="h-4 w-4" />}
                    required
                  />

                </div>

                <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-[#f5faf8] p-4">

                  <input
                    type="checkbox"
                    checked={form.accept}
                    onChange={(event) =>
                      updateField("accept", event.target.checked)
                    }
                    className="mt-1 h-4 w-4 rounded border-zinc-300 text-[#006b55] focus:ring-[#007f63]"
                  />

                  <span className="text-xs leading-5 text-zinc-600">
                    Acepto formar parte del club y declaro que la información
                    proporcionada es correcta.
                  </span>

                </label>

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#006b55] px-5 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#005c49]"
                >
                  Solicitar incorporación
                  <ArrowRight className="h-4 w-4" />
                </button>

                <div className="flex items-center justify-center gap-2 pt-1 text-xs text-zinc-400">
                  <Lock className="h-3.5 w-3.5" />
                  Tus datos serán tratados de forma segura.
                </div>

              </form>

            </div>

          </section>
        )}

        <footer className="mt-8 text-center">
          <p className="text-xs text-zinc-400">
            GrowCRM · Gestión inteligente para clubes
          </p>
        </footer>

      </div>
    </main>
  )
}

function Benefit({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white">
        <Check className="h-4 w-4 text-[#007f63]" />
      </div>

      <span className="text-sm font-medium text-[#36544f]">
        {text}
      </span>
    </div>
  )
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  icon,
  required = false,
}: {
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  type?: string
  icon?: React.ReactNode
  required?: boolean
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-zinc-700">
        {label}
        {required && (
          <span className="ml-1 text-[#007f63]">*</span>
        )}
      </label>

      <div className="relative">

        {icon && (
          <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
            {icon}
          </div>
        )}

        <input
          type={type}
          value={value}
          required={required}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={`h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[#007f63] focus:ring-4 focus:ring-[#007f63]/10 ${
            icon ? "pl-10" : ""
          }`}
        />

      </div>
    </div>
  )
}