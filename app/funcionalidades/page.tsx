import Link from "next/link"
import { ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Users,
  Package,
  CalendarDays,
  QrCode,
  Bell,
  ShoppingCart,
  ArrowRight,
  Check,
} from "lucide-react"

const features = [
  {
    icon: Users,
    title: "Socios",
    description:
      "Gestioná la información de tus socios, su estado y actividad desde un único lugar.",
    items: [
      "Alta y gestión de socios",
      "Información de contacto",
      "Estado de cada socio",
      "Historial y actividad",
    ],
  },
  {
    icon: Package,
    title: "Catálogo y stock",
    description:
      "Administrá tus productos, precios, disponibilidad y niveles de stock.",
    items: [
      "Catálogo de productos",
      "Precios y disponibilidad",
      "Control de stock",
      "Alertas de stock bajo",
    ],
  },
  {
    icon: CalendarDays,
    title: "Reservas",
    description:
      "Recibí y gestioná las solicitudes de reserva de tus socios de forma ordenada.",
    items: [
      "Solicitud de reservas",
      "Aprobación y cancelación",
      "Historial de reservas",
      "Control de horarios",
    ],
  },
  {
    icon: QrCode,
    title: "QR",
    description:
      "Utilizá códigos QR para facilitar retiros, accesos y validaciones.",
    items: [
      "QR asociados a reservas",
      "Validación de retiros",
      "Acceso rápido",
      "Códigos con caducidad",
    ],
  },
  {
    icon: Bell,
    title: "Notificaciones",
    description:
      "Mantené a tus socios informados con notificaciones sobre la actividad de su club.",
    items: [
      "Confirmaciones de reservas",
      "Cambios de estado",
      "Avisos importantes",
      "Comunicación directa",
    ],
  },
  {
    icon: ShoppingCart,
    title: "Ventas y retiros",
    description:
      "Registrá ventas y retiros de forma rápida y mantené el movimiento del club organizado.",
    items: [
      "Registro de ventas",
      "Registro de retiros",
      "Productos y cantidades",
      "Historial de movimientos",
    ],
  },
]

export default function FuncionalidadesPage() {
  return (
    <main className="min-h-screen bg-white text-zinc-950">
      {/* HEADER */}
{/* NAV */}
<header className="relative z-50 w-full py-5">
    <div className="mx-auto flex h-14 max-w-7xl items-center justify-between rounded-2xl border border-zinc-100 bg-white/90 px-5 shadow-sm backdrop-blur">

    {/* LOGO */}
    <Link
      href="/"
      className="text-xl font-bold tracking-tight text-zinc-950"
    >
      GrowCRM
    </Link>

    {/* NAVIGATION */}
    <nav className="hidden items-center gap-1 md:flex">

{/* PARA TU CLUB */}
<div className="group relative">
  <button className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 hover:text-zinc-950">
    Para tu club

    <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
  </button>

  <div className="absolute left-1/2 top-full z-[100] -translate-x-1/2 pt-2">
    <div className="invisible w-52 rounded-2xl border border-zinc-100 bg-white p-2 opacity-0 shadow-xl transition-all duration-150 group-hover:visible group-hover:opacity-100">

      <Link
        href="/funcionalidades"
        className="block rounded-xl px-4 py-3 text-sm text-zinc-700 transition hover:bg-zinc-50 hover:text-zinc-950"
      >
        Funcionalidades
      </Link>

      <Link
        href="/club-partners"
        className="block rounded-xl px-4 py-3 text-sm text-zinc-700 transition hover:bg-zinc-50 hover:text-zinc-950"
      >
        Club Partners
      </Link>

    </div>
  </div>
</div>

      {/* PRECIOS */}
      <Link
        href="/precios"
        className="rounded-full px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 hover:text-zinc-950"
      >
        Precios
      </Link>

      {/* AYUDA */}
      <div className="group relative">
        <button className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 hover:text-zinc-950">
          Ayuda
          <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
        </button>

        <div className="invisible absolute left-1/2 top-full z-50 mt-2 w-52 -translate-x-1/2 rounded-2xl border border-zinc-100 bg-white p-2 opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
          <Link
            href="/como-funciona"
            className="block rounded-xl px-4 py-3 text-sm text-zinc-700 transition hover:bg-zinc-50 hover:text-zinc-950"
          >
            Cómo funciona
          </Link>

          <Link
            href="/contactanos"
            className="block rounded-xl px-4 py-3 text-sm text-zinc-700 transition hover:bg-zinc-50 hover:text-zinc-950"
          >
            Contáctanos
          </Link>
        </div>
      </div>

    </nav>

    {/* ACTION */}
    <Link href="/auth/login">
      <Button
        variant="outline"
        className="h-10 rounded-full border-emerald-800 px-5 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50"
      >
        Ingresar / Registrarse
      </Button>
    </Link>

  </div>
</header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-40 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-emerald-100/60 blur-3xl" />

        <div className="mx-auto max-w-4xl px-6 pb-20 pt-20 text-center md:pb-24 md:pt-28">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-sm font-medium text-emerald-900">
              Funcionalidades
            </span>
          </div>

          <h1 className="text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl md:text-7xl">
            Todo lo que necesitás
            <br />
            <span className="text-emerald-700">
              para gestionar tu club.
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-zinc-500 sm:text-xl">
            GrowCRM reúne en un solo lugar las herramientas que necesitás
            para administrar socios, productos, reservas, stock y comunicación.
          </p>

          <div className="mt-8">
            <Link href="/auth/register">
              <Button className="h-14 rounded-full bg-emerald-900 px-8 text-base hover:bg-emerald-800">
                Comenzar gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-zinc-50/70 py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-emerald-800">
              Una sola plataforma
            </p>

            <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
              Herramientas para el día a día.
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-500">
              Todo lo necesario para mantener la operación de tu club
              organizada y bajo control.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon

              return (
                <article
                  key={feature.title}
                  className="rounded-3xl border border-zinc-200 bg-white p-7 transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
                    <Icon className="h-7 w-7" strokeWidth={1.8} />
                  </div>

                  <h3 className="text-2xl font-bold">
                    {feature.title}
                  </h3>

                  <p className="mt-3 leading-relaxed text-zinc-500">
                    {feature.description}
                  </p>

                  <div className="mt-6 space-y-3 border-t border-zinc-100 pt-6">
                    {feature.items.map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-3 text-sm text-zinc-700"
                      >
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                          <Check className="h-3 w-3 text-emerald-700" />
                        </div>

                        {item}
                      </div>
                    ))}
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

  
{/* FOOTER */}
<footer className="border-t py-8">
  <div className="mx-auto max-w-7xl px-6">
    <div className="flex items-center justify-between">
      <p className="text-sm text-zinc-400">
        © {new Date().getFullYear()} GrowCRM
      </p>

      <Link
        href="/"
        className="text-sm font-medium text-zinc-600 transition hover:text-emerald-800"
      >
        ← Volver al inicio
      </Link>
    </div>
  </div>
</footer>
    </main>
  )
}