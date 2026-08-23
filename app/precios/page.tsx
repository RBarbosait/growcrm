"use client"

import Link from "next/link"
import {
  ChevronDown,
  ArrowRight,
  Check,
  Users,
  Package,
  CalendarDays,
  QrCode,
  Bell,
  ShoppingCart,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const features = [
  {
    icon: Users,
    title: "Socios",
    description:
      "Gestioná la información de tus socios, su estado y actividad desde un único lugar.",
  },
  {
    icon: Package,
    title: "Catálogo y stock",
    description:
      "Administrá productos, precios, disponibilidad y niveles de stock.",
  },
  {
    icon: CalendarDays,
    title: "Reservas",
    description:
      "Recibí y gestioná las solicitudes de reserva de tus socios.",
  },
  {
    icon: QrCode,
    title: "QR",
    description:
      "Facilitá retiros, accesos y validaciones mediante códigos QR.",
  },
  {
    icon: Bell,
    title: "Notificaciones",
    description:
      "Mantené a tus socios informados sobre la actividad de su club.",
  },
  {
    icon: ShoppingCart,
    title: "Ventas y retiros",
    description:
      "Registrá ventas y retiros y mantené el movimiento organizado.",
  },
]

export default function PreciosPage() {
  return (
    <main className="min-h-screen bg-white text-zinc-950">

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
              className="rounded-full bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-950"
            >
              Precios
            </Link>

            {/* AYUDA */}
            <div className="group relative">
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 hover:text-zinc-950"
              >
                Ayuda

                <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
              </button>

              {/* CONTENEDOR PUENTE */}
              <div className="invisible absolute left-1/2 top-full z-50 w-52 -translate-x-1/2 pt-2 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100">

                <div className="rounded-2xl border border-zinc-100 bg-white p-2 shadow-xl">

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

        <div className="mx-auto max-w-4xl px-6 pb-16 pt-20 text-center md:pb-20 md:pt-24">

          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />

            <span className="text-sm font-medium text-emerald-900">
              Precios
            </span>
          </div>

          <h1 className="text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl md:text-7xl">
            Empezá a gestionar
            <br />
            <span className="text-emerald-700">
              tu club gratis.
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-zinc-500 sm:text-xl">
            Durante esta etapa, todas las funcionalidades de GrowCRM están
            disponibles sin costo.
          </p>

        </div>
      </section>

      {/* EVERYTHING INCLUDED */}
      <section className="bg-zinc-50/70 px-6 py-20 md:py-24">

        <div className="mx-auto max-w-7xl">

          <div className="mb-14 text-center">

            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-emerald-800">
              Todo incluido
            </p>

            <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
              Todas las herramientas para tu club.
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-zinc-500">
              No necesitás elegir entre funcionalidades. Durante esta etapa,
              tenés acceso a toda la plataforma.
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
                    <Icon
                      className="h-7 w-7"
                      strokeWidth={1.8}
                    />
                  </div>

                  <h3 className="text-2xl font-bold tracking-tight">
                    {feature.title}
                  </h3>

                  <p className="mt-3 leading-relaxed text-zinc-500">
                    {feature.description}
                  </p>

                  <div className="mt-6 flex items-center gap-2 border-t border-zinc-100 pt-5">

                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50">
                      <Check className="h-3 w-3 text-emerald-700" />
                    </div>

                    <span className="text-sm font-medium text-zinc-700">
                      Incluido sin costo
                    </span>

                  </div>

                </article>
              )
            })}

          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">

        <div className="mx-auto max-w-5xl border-t border-zinc-200 pt-12">

          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">

            <div className="max-w-xl">

              <p className="text-sm font-semibold uppercase tracking-wider text-emerald-800">
                Empezá hoy
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-950">
                Tu club, organizado en un solo lugar.
              </h2>

              <p className="mt-3 text-base leading-relaxed text-zinc-500">
                Registrate y empezá a utilizar GrowCRM sin costo durante
                esta etapa.
              </p>

            </div>

            <Link href="/auth/register" className="shrink-0">

              <Button
                className="h-12 rounded-full bg-emerald-900 px-7 font-semibold hover:bg-emerald-800"
              >
                Comenzar gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

            </Link>

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