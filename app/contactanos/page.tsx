"use client"

import Link from "next/link"
import { useState } from "react"
import { ChevronDown, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ContactanosPage() {
  const API_URL = "https://growcrm-api-production.up.railway.app"
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
          className="block rounded-xl bg-zinc-50 px-4 py-3 text-base font-semibold text-zinc-950"
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
        <div className="mx-auto max-w-4xl px-4 pb-12 pt-10 text-center sm:px-6 sm:pb-16 sm:pt-16 md:pb-20 md:pt-24">

          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />

            <span className="text-sm font-medium text-emerald-900">
              Contactanos
            </span>
          </div>

          <h1 className="text-4xl font-black leading-[1.02] tracking-tight sm:text-6xl md:text-7xl">
            Hablemos sobre
            <br />
            <span className="text-emerald-700">
              tu club.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-500 sm:mt-7 sm:text-xl">
            Contanos sobre tu club y cómo lo gestionás.
            Queremos conocer tu operación y acompañarte.
          </p>

        </div>
      </section>

      {/* CONTACT FORM */}
      <section className="px-4 pb-16 sm:px-6 sm:pb-24">

        <div className="mx-auto max-w-2xl">

          <div className="rounded-[32px] border border-zinc-200 bg-white p-5 shadow-xl sm:p-8 md:p-10">

            <h2 className="text-2xl font-bold text-center sm:text-3xl">
              Contanos sobre tu club.
            </h2>

            <p className="mt-3 text-center text-zinc-500">
              Dejanos tus datos y nos ponemos en contacto.
            </p>

            <form
              className="mt-8 space-y-3"
              onSubmit={async (e) => {
                e.preventDefault()

                const form = e.currentTarget

                const name = (
                  form.elements.namedItem("name") as HTMLInputElement
                ).value

                const contact = (
                  form.elements.namedItem("contact") as HTMLInputElement
                ).value

                const message = (
                  form.elements.namedItem("message") as HTMLTextAreaElement
                ).value

                await fetch(`${API_URL}/contact`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    name,
                    contact,
                    message,
                  }),
                })

                form.reset()

                alert("Mensaje enviado ✅")
              }}
            >

              <input
                name="name"
                required
                placeholder="Nombre"
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-4 transition focus:bg-white focus:ring-2 focus:ring-emerald-400"
              />

              <input
                name="contact"
                required
                placeholder="Email o Teléfono"
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-4 transition focus:bg-white focus:ring-2 focus:ring-emerald-400"
              />

              <textarea
                name="message"
                required
                rows={5}
                placeholder="Contanos sobre tu club o qué necesitás gestionar."
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-4 transition focus:bg-white focus:ring-2 focus:ring-emerald-400"
              />

              <Button
                type="submit"
                className="h-12 w-full rounded-xl bg-emerald-900 hover:bg-emerald-800"
              >
                Enviar mensaje
              </Button>

            </form>

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