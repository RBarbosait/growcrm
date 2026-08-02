"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { List } from "lucide-react"

export default function HomePage() {
  const searchParams = useSearchParams()
  const API_URL = "https://growcrm-api-production.up.railway.app"

  useEffect(() => {
    const propertyId = searchParams.get("id")
    if (propertyId) {
      window.location.href = `/inmueble/${propertyId}`
    }
  }, [searchParams])

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-zinc-50 to-zinc-100 text-foreground flex flex-col items-center p-4 overflow-hidden">

      {/* 🔥 BACKGROUND GLOW */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-r from-emerald-200 to-blue-200 blur-3xl opacity-40 -z-10" />

      {/* NAV */}
      <div className="w-full max-w-5xl flex flex-wrap items-center justify-end gap-2 mb-6">
        <Link href="/how-it-works">
          <Button variant="ghost" size="sm">Cómo funciona</Button>
        </Link>

        <Link href="/about">
          <Button variant="ghost" size="sm">About</Button>
        </Link>

        <Link href="/auth/login">
          <Button variant="outline" size="sm">Iniciar Sesión</Button>
        </Link>

        <Link href="/auth/register">
          <Button size="sm">Registrarse</Button>
        </Link>
      </div>

      <div className="max-w-md w-full text-center space-y-8">

        {/* 🔥 HERO PRO */}
        <div className="space-y-4 animate-fade-up">

          <img
            src="/casadata-logo.png"
            alt="casaData"
            className="w-16 h-16 mx-auto animate-scale-in"
          />

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs">
            🔥 Data real, no suposiciones
          </div>

          <h1 className="text-4xl font-bold leading-tight">
            Descubrí quién realmente quiere tu propiedad
          </h1>

          <p className="text-muted-foreground">
            casaData detecta intención real de compra en tiempo real.
          </p>

        </div>

        {/* CTA */}
        <div className="space-y-3 animate-fade-up">

          <Link href="/inmuebles">
            <Button className="w-full h-14 text-lg rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white shadow-md hover:shadow-lg hover:scale-[1.02] transition-all">
              <List className="w-5 h-5 mr-2" />
              Explorar propiedades
            </Button>
          </Link>

          <Link href="/auth/register">
            <Button
              variant="outline"
              className="w-full h-14 text-lg rounded-xl border border-zinc-300 text-zinc-700 hover:bg-zinc-100 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all"
            >
              🚀 Publicar gratis
            </Button>
          </Link>

        </div>

        {/* 🔥 MÉTRICAS PRO */}
        <div className="grid grid-cols-3 gap-3 animate-fade-up delay-100">

          <div className="p-4 rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-700 text-white shadow-md">
            <p className="text-xl font-bold">+120%</p>
            <p className="text-xs opacity-80">más leads</p>
          </div>

          <div className="p-4 rounded-xl backdrop-blur-md bg-white/70 border border-white/40 shadow-sm">
            <p className="text-xl font-bold">x2</p>
            <p className="text-xs text-muted-foreground">revisitas</p>
          </div>

          <div className="p-4 rounded-xl backdrop-blur-md bg-white/70 border border-white/40 shadow-sm">
            <p className="text-xl font-bold">+35%</p>
            <p className="text-xs text-muted-foreground">tiempo</p>
          </div>

        </div>

        {/* 🔥 IMAGE PRO */}
        <div className="relative rounded-2xl overflow-hidden shadow-xl animate-fade-up delay-200">
          <img
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200&auto=format&fit=crop"
            alt="real estate"
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        {/* VALUE */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 animate-fade-up delay-300 shadow-sm">
          <p className="text-sm text-emerald-700 font-medium">
            🎉 Primera publicación GRATIS para nuevos usuarios
          </p>
        </div>

        {/* HOW IT WORKS */}
        <div className="pt-6 space-y-4 text-left animate-fade-up delay-400">

          <h2 className="text-center font-semibold text-lg">
            Cómo funciona
          </h2>

          <div className="space-y-3 text-sm text-muted-foreground">

            <div className="p-3 rounded-xl backdrop-blur-md bg-white/70 border border-white/40 shadow-sm">
              1. Publicás tu propiedad en casaData
            </div>

            <div className="p-3 rounded-xl backdrop-blur-md bg-white/70 border border-white/40 shadow-sm">
              2. Detectamos comportamiento real (tiempo, scroll, revisitas)
            </div>

            <div className="p-3 rounded-xl backdrop-blur-md bg-white/70 border border-white/40 shadow-sm">
              3. Identificamos usuarios con alta intención de compra
            </div>

          </div>

          <Link href="/how-it-works">
            <Button variant="ghost" className="w-full">
              Ver más →
            </Button>
          </Link>

        </div>

        {/* 🇺🇾 */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 animate-fade-up delay-500 text-center shadow-sm">
          <p className="text-sm text-blue-800 font-medium">
            🇺🇾 casaData es un emprendimiento uruguayo
          </p>
        </div>

        {/* CONTACT */}
        <div className="pt-6 space-y-4 animate-fade-up delay-500">

          <h2 className="text-center font-semibold text-lg">
            ¿Querés conocernos?
          </h2>

          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault()

              const form = e.currentTarget
              const name = (form.elements.namedItem("name") as HTMLInputElement).value
              const contact = (form.elements.namedItem("contact") as HTMLInputElement).value
              const message = (form.elements.namedItem("message") as HTMLTextAreaElement).value

              await fetch(`${API_URL}/contact`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, contact, message }),
              })

              form.reset()
              alert("Mensaje enviado ✅")
            }}
          >
            <input name="name" required placeholder="Nombre"
              className="w-full p-3 rounded-xl border bg-white focus:ring-2 focus:ring-emerald-400" />

            <input name="contact" required placeholder="Email o Teléfono"
              className="w-full p-3 rounded-xl border bg-white focus:ring-2 focus:ring-emerald-400" />

            <textarea name="message" required rows={4}
              className="w-full p-3 rounded-xl border bg-white focus:ring-2 focus:ring-emerald-400" />

            <Button type="submit" className="w-full h-12 rounded-xl">
              Enviar mensaje
            </Button>
          </form>

        </div>

        {/* FOOTER */}
        <div className="pt-10 pb-6 text-center space-y-4 border-t mt-10">
          <p className="text-sm text-muted-foreground">
            casaData © {new Date().getFullYear()}
          </p>
        </div>

      </div>

      {/* ANIMATIONS (igual que tuyo) */}
      <style jsx global>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }

        .animate-fade-up { animation: fadeUp 0.6s ease forwards; }
        .animate-scale-in { animation: scaleIn 0.5s ease forwards; }

        .delay-100 { animation-delay: 0.1s }
        .delay-200 { animation-delay: 0.2s }
        .delay-300 { animation-delay: 0.3s }
        .delay-400 { animation-delay: 0.4s }
        .delay-500 { animation-delay: 0.5s }
      `}</style>

    </div>
  )
}
