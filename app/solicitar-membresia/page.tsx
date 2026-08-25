"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useState } from "react"
import { ArrowLeft, Check, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SolicitarMembresiaPage() {
  const searchParams = useSearchParams()
  const club = searchParams.get("club") || ""
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

                <svg
                  className="h-3.5 w-3.5 transition-transform group-hover:rotate-180"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 7.5L10 12.5L15 7.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
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

                <svg
                  className="h-3.5 w-3.5 transition-transform group-hover:rotate-180"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 7.5L10 12.5L15 7.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
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

{/* MOBILE MENU */}
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
          className="block rounded-xl px-4 py-3 text-base font-medium text-zinc-700 hover:bg-zinc-50"
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

{/* CONTENT */}
      <section className="relative overflow-hidden">

        <div className="absolute -top-40 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-emerald-100/60 blur-3xl" />

<div className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-16 md:pt-24">

          <div className="grid gap-10 sm:gap-16 md:grid-cols-2 md:items-start">

            {/* INTRO */}
            <div className="pt-4">

              <Link
                href="/club-partners"
                className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-emerald-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver a Club Partners
              </Link>

              <div className="mt-10">

                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />

                  <span className="text-sm font-medium text-emerald-900">
                    Solicitud de membresía
                  </span>
                </div>

                <h1 className="text-4xl font-black leading-[1.02] tracking-tight sm:text-6xl">
                  Formá parte
                  <br />
                  <span className="text-emerald-700">
                    de este club.
                  </span>
                </h1>

<p className="mt-6 max-w-xl text-base leading-relaxed text-zinc-500 sm:mt-7 sm:text-xl">
                  Completá tus datos y enviá tu solicitud de membresía.
                  El club recibirá tu solicitud y se pondrá en contacto
                  con vos.
                </p>

                {club && (
                  <div className="mt-8 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5">
                    <p className="text-sm font-medium text-emerald-800">
                      Club seleccionado
                    </p>

                    <p className="mt-1 text-lg font-bold text-emerald-950">
                      {club}
                    </p>
                  </div>
                )}

                <div className="mt-8 space-y-4">

                  <div className="flex items-center gap-3 text-sm text-zinc-600">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50">
                      <Check className="h-3.5 w-3.5 text-emerald-700" />
                    </div>

                    Solicitud enviada directamente al club
                  </div>

                  <div className="flex items-center gap-3 text-sm text-zinc-600">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50">
                      <Check className="h-3.5 w-3.5 text-emerald-700" />
                    </div>

                    Sin costo durante esta etapa
                  </div>

                </div>

              </div>
            </div>

            {/* FORM */}
            <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-7 md:p-9">

              <div className="mb-8">
                <h2 className="text-2xl font-bold tracking-tight">
                  Tus datos
                </h2>

                <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                  Necesitamos algunos datos para que el club pueda
                  comunicarse contigo.
                </p>
              </div>

              <form className="space-y-5">

                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-zinc-800"
                  >
                    Nombre completo
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="Tu nombre"
                    className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none transition placeholder:text-zinc-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-zinc-800"
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="tu@email.com"
                    className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none transition placeholder:text-zinc-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-medium text-zinc-800"
                  >
                    Teléfono
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    placeholder="+598 ..."
                    className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none transition placeholder:text-zinc-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="mb-2 block text-sm font-medium text-zinc-800"
                  >
                    Mensaje
                  </label>

                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    placeholder="Contanos algo más..."
                    className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-zinc-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <Button
                  type="submit"
                  className="h-12 w-full rounded-full bg-emerald-900 font-semibold text-white hover:bg-emerald-800"
                >
                  Enviar solicitud
                  <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                </Button>

                <p className="text-center text-xs leading-relaxed text-zinc-400">
                  Al enviar la solicitud, tus datos serán compartidos
                  con el club seleccionado para poder contactarte.
                </p>

              </form>

            </div>

          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t py-8">

        <div className="mx-auto max-w-7xl px-6">

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