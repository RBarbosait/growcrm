"use client"

import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ContactanosPage() {
  const API_URL = "https://growcrm-api-production.up.railway.app"

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
              Contactanos
            </span>
          </div>

          <h1 className="text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl md:text-7xl">
            Hablemos sobre
            <br />
            <span className="text-emerald-700">
              tu club.
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-zinc-500 sm:text-xl">
            Contanos sobre tu club y cómo lo gestionás.
            Queremos conocer tu operación y acompañarte.
          </p>

        </div>
      </section>

      {/* CONTACT FORM */}
      <section className="px-6 pb-24">

        <div className="mx-auto max-w-2xl">

          <div className="rounded-[32px] border border-zinc-200 bg-white p-8 shadow-xl md:p-10">

            <h2 className="text-3xl font-bold text-center">
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