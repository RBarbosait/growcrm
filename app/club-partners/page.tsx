"use client"

import Link from "next/link"
import { useState } from "react"
import {
  ChevronDown,
  ArrowRight,
  Users,
  Menu,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const partners = [
  {
    name: "La Paz Club",
    type: "Club Partner",
    description:
      "Un club que utiliza GrowCRM para organizar sus socios, reservas, productos y operación diaria.",
    location: "Montevideo, Uruguay",
  },
]

export default function ClubPartnersPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <main className="min-h-screen bg-white text-zinc-950">

      {/* NAV */}
      <header className="relative z-50 w-full py-5">
<div className="mx-auto flex h-14 max-w-7xl items-center justify-between rounded-2xl border border-zinc-100 bg-white/90 px-4 shadow-sm backdrop-blur sm:px-5">

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
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 hover:text-zinc-950"
              >
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
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 hover:text-zinc-950"
              >
                Ayuda

                <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
              </button>

              <div className="absolute left-1/2 top-full z-[100] -translate-x-1/2 pt-2">
                <div className="invisible w-52 rounded-2xl border border-zinc-100 bg-white p-2 opacity-0 shadow-xl transition-all duration-150 group-hover:visible group-hover:opacity-100">

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

{/* DESKTOP ACTION */}
<Link href="/auth/login" className="hidden md:block">
  <Button
    variant="outline"
    className="h-10 rounded-full border-emerald-800 px-5 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50"
  >
    Ingresar / Registrarse
  </Button>
</Link>

{/* MOBILE MENU BUTTON */}
<button
  type="button"
  onClick={() => setMobileMenuOpen(true)}
  className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 text-zinc-700 md:hidden"
  aria-label="Abrir menú"
>
  <Menu className="h-5 w-5" />
</button>

        </div>
      </header>
      {/* MOBILE MENU */}
{mobileMenuOpen && (
  <div className="fixed inset-0 z-[100] md:hidden">

    <button
      type="button"
      aria-label="Cerrar menú"
      onClick={() => setMobileMenuOpen(false)}
      className="absolute inset-0 bg-black/30 backdrop-blur-sm"
    />

    <aside className="absolute right-0 top-0 flex h-full w-[82vw] max-w-sm flex-col bg-white shadow-2xl">

      <div className="flex h-20 items-center justify-between border-b border-zinc-100 px-5">

        <Link
          href="/"
          onClick={() => setMobileMenuOpen(false)}
          className="text-xl font-bold tracking-tight text-zinc-950"
        >
          GrowCRM
        </Link>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-50"
          aria-label="Cerrar menú"
        >
          <X className="h-5 w-5" />
        </button>

      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto p-5">

        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Navegación
        </p>

        <Link
          href="/funcionalidades"
          onClick={() => setMobileMenuOpen(false)}
          className="block rounded-xl px-4 py-3 text-base font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Funcionalidades
        </Link>

        <Link
          href="/club-partners"
          onClick={() => setMobileMenuOpen(false)}
          className="block rounded-xl bg-zinc-50 px-4 py-3 text-base font-semibold text-zinc-950"
        >
          Club Partners
        </Link>

        <Link
          href="/precios"
          onClick={() => setMobileMenuOpen(false)}
          className="block rounded-xl px-4 py-3 text-base font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Precios
        </Link>

        <div className="my-4 border-t border-zinc-100" />

        <Link
          href="/como-funciona"
          onClick={() => setMobileMenuOpen(false)}
          className="block rounded-xl px-4 py-3 text-base font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Cómo funciona
        </Link>

        <Link
          href="/contactanos"
          onClick={() => setMobileMenuOpen(false)}
          className="block rounded-xl px-4 py-3 text-base font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Contáctanos
        </Link>

      </nav>

      <div className="border-t border-zinc-100 p-5">

        <Link
          href="/auth/login"
          onClick={() => setMobileMenuOpen(false)}
          className="block"
        >
          <Button className="h-12 w-full rounded-full bg-emerald-900 font-semibold hover:bg-emerald-800">
            Ingresar / Registrarse
          </Button>
        </Link>

      </div>

    </aside>

  </div>
)}

      {/* HERO */}
      <section className="relative overflow-hidden">

<div className="absolute -top-52 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-emerald-200/25 blur-[140px]" />

<div className="absolute right-0 top-96 -z-10 h-[350px] w-[350px] rounded-full bg-blue-200/15 blur-[120px]" />
        <div className="mx-auto max-w-4xl px-4 pb-14 pt-10 text-center sm:px-6 sm:pb-20 sm:pt-16 md:pb-24 md:pt-28">

          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />

            <span className="text-sm font-medium text-emerald-900">
              Nuestros Partners
            </span>
          </div>

          <h1 className="text-4xl font-black leading-[1.02] tracking-tight sm:text-6xl md:text-7xl">
            Clubes que ya forman parte
            <br />
            <span className="text-emerald-700">
              de GrowCRM.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-500 sm:mt-8 sm:text-xl">
            Conocé algunos de los clubes que utilizan GrowCRM para
            organizar su gestión y llevar su operación a un solo lugar.
          </p>

        </div>
      </section>

      {/* PARTNERS */}
      <section className="bg-zinc-50/70 px-4 py-16 sm:px-6 sm:py-20 md:py-24">

        <div className="mx-auto max-w-7xl">

<div className="mb-10 sm:mb-12">
  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Clubes que confían en GrowCRM.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {partners.map((partner) => (
              <article
                key={partner.name}
                className="group overflow-hidden rounded-3xl border border-zinc-200 bg-white transition hover:-translate-y-1 hover:shadow-xl"
              >

                {/* CARD HEADER */}
                <div className="flex h-36 items-center justify-center bg-emerald-950 sm:h-44">

                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 text-emerald-200 backdrop-blur">
                    <Users
                      className="h-10 w-10"
                      strokeWidth={1.5}
                    />
                  </div>

                </div>

                {/* CARD CONTENT */}
                <div className="p-5 sm:p-7">

                  <div className="mb-4 flex items-center justify-between gap-4">
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                      {partner.type}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold tracking-tight">
                    {partner.name}
                  </h3>

                  <p className="mt-3 leading-relaxed text-zinc-500">
                    {partner.description}
                  </p>

                  <div className="mt-6 border-t border-zinc-100 pt-5">

                    <p className="text-sm text-zinc-400">
                      {partner.location}
                    </p>

                    {/* SOLICITAR MEMBRESÍA */}
                    <Link
                      href={`/solicitar-membresia?club=${encodeURIComponent(
                        partner.name
                      )}`}
                      className="mt-5 block"
                    >
                      <Button
                        className="w-full rounded-full bg-emerald-900 font-semibold text-white hover:bg-emerald-800"
                      >
                        Solicitar membresía
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>

                  </div>

                </div>

              </article>
            ))}

          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 sm:px-6 sm:py-20">

        <div className="mx-auto max-w-5xl border-t border-zinc-200 pt-12">

          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">

            <div className="max-w-xl">

              <p className="text-sm font-semibold uppercase tracking-wider text-emerald-800">
                Club Partners
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-950">
                ¿Querés que tu club sea parte de GrowCRM?
              </h2>

              <p className="mt-3 text-base leading-relaxed text-zinc-500">
                Sumate a los clubes que ya están utilizando GrowCRM para
                organizar su gestión y llevar su operación a un solo lugar.
              </p>

            </div>

            {/* SOLICITAR SER CLUB PARTNER */}
            <Link
              href="/solicitar-clubpartner"
              className="shrink-0"
            >
<Button
  className="h-12 rounded-full bg-emerald-900 px-6 font-semibold text-white hover:bg-emerald-800"
>
                Quiero ser Club Partner
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>

          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t py-8">

<div className="mx-auto max-w-7xl px-4 sm:px-6">

  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

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