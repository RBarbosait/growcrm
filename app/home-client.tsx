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
<div className="relative min-h-screen bg-white text-zinc-900 overflow-hidden">
    <div className="mx-auto max-w-7xl px-6">

      {/* 🔥 BACKGROUND GLOW */}
<div className="absolute inset-0 -z-10 overflow-hidden">

  <div className="absolute -top-52 left-1/2 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-emerald-200/25 blur-[160px]" />

  <div className="absolute right-0 top-96 h-[400px] w-[400px] rounded-full bg-blue-200/20 blur-[140px]" />

</div>
      {/* NAV */}
<div className="w-full max-w-6xl flex items-center justify-between py-6">

  <Link href="/" className="text-2xl font-bold tracking-tight">
    GrowCRM
  </Link>

  <div className="flex items-center gap-8">

    <Link href="/how-it-works">
      <Button variant="ghost">Funciones</Button>
    </Link>

    <Link href="/about">
      <Button variant="ghost">Precios</Button>
    </Link>

    <Link href="/auth/login">
      <Button variant="ghost">
        Ingresar
      </Button>
    </Link>

    <Link href="/auth/register">
      <Button className="rounded-full px-6">
        Comenzar
      </Button>
    </Link>

  </div>

</div>

 <section className="grid lg:grid-cols-2 gap-24 items-center min-h-[82vh] py-16">

  {/* IZQUIERDA */}

<div className="max-w-xl space-y-8">
    <div className="inline-flex rounded-full border px-4 py-2 bg-white shadow-sm">
      <span className="text-xs font-medium">
        Nuevo · Plataforma para clubes
      </span>
    </div>

<h1 className="text-6xl lg:text-7xl font-black leading-none tracking-tight">

  Todo tu club.

  <br />

  <span className="text-emerald-600">
    Una sola plataforma.
  </span>

</h1>

    <p className="max-w-xl text-xl text-zinc-500 leading-relaxed">

      Gestioná socios, reservas, productos, stock, QR,
      eventos y notificaciones desde un único lugar.

    </p>

<div className="flex gap-4 pt-2">

      <Link href="/auth/register">
        <Button className="h-14 px-8 rounded-full text-base">
          Comenzar gratis
        </Button>
      </Link>

      <Link href="/how-it-works">
        <Button variant="outline" className="h-14 px-8 rounded-full">
          Ver demo
        </Button>
      </Link>

    </div>

<div className="flex gap-12 pt-6">
      <div>
        <p className="text-3xl font-bold">+250</p>
        <p className="text-zinc-500 text-sm">Socios</p>
      </div>

      <div>
        <p className="text-3xl font-bold">98%</p>
        <p className="text-zinc-500 text-sm">Reservas aprobadas</p>
      </div>

      <div>
        <p className="text-3xl font-bold">24/7</p>
        <p className="text-zinc-500 text-sm">Disponible</p>
      </div>

    </div>

  </div>

  {/* DERECHA */}

  <div>

    <div className="rounded-[32px] border bg-white shadow-2xl overflow-hidden">

      <div className="border-b px-6 py-4 flex items-center justify-between">

        <h3 className="font-semibold">
          GrowCRM Dashboard
        </h3>

        <div className="flex gap-2">

          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />

        </div>

      </div>

      <div className="p-6 space-y-5">

        <div className="grid grid-cols-2 gap-4">

          <div className="rounded-2xl bg-zinc-900 text-white p-5">
            <p className="text-xs opacity-70">Socios activos</p>
            <p className="text-4xl font-bold mt-2">248</p>
          </div>

          <div className="rounded-2xl border p-5">
            <p className="text-xs text-zinc-500">Reservas hoy</p>
            <p className="text-4xl font-bold mt-2">18</p>
          </div>

        </div>

        <div className="rounded-2xl border p-5">

          <div className="flex justify-between mb-3">

            <span>QR emitidos</span>

            <strong>67</strong>

          </div>

          <div className="h-3 rounded-full bg-zinc-200 overflow-hidden">

            <div className="h-full w-3/4 bg-emerald-500 rounded-full"/>

          </div>

        </div>

        <div className="rounded-2xl border p-5">

          <p className="font-medium mb-4">
            Próximas reservas
          </p>

          <div className="space-y-3">

            <div className="flex justify-between">

              <span>Rodrigo Barbosa</span>

              <span>14:00</span>

            </div>

            <div className="flex justify-between">

              <span>Juan Pérez</span>

              <span>15:30</span>

            </div>

            <div className="flex justify-between">

              <span>Lucía Gómez</span>

              <span>18:00</span>

            </div>

          </div>

        </div>

      </div>

    </div>

  </div>

</section>
<section className="py-24">

    <div className="text-center mb-14">

        <h2 className="text-4xl font-bold">
            Todo lo que necesitás
        </h2>

        <p className="mt-4 text-zinc-500 text-lg">
            Gestioná todo tu club desde un solo lugar.
        </p>

    </div>

<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

  <div className="rounded-3xl border bg-white p-8 shadow-sm hover:shadow-lg transition">
    <div className="text-4xl mb-5">👥</div>
    <h3 className="font-semibold text-xl">Socios</h3>
    <p className="mt-3 text-zinc-500">
      Gestioná altas, bajas, cuotas e historial de cada socio.
    </p>
  </div>

  <div className="rounded-3xl border bg-white p-8 shadow-sm hover:shadow-lg transition">
    <div className="text-4xl mb-5">📅</div>
    <h3 className="font-semibold text-xl">Reservas</h3>
    <p className="mt-3 text-zinc-500">
      Aprobaciones, calendario y reservas online.
    </p>
  </div>

  <div className="rounded-3xl border bg-white p-8 shadow-sm hover:shadow-lg transition">
    <div className="text-4xl mb-5">📦</div>
    <h3 className="font-semibold text-xl">Inventario</h3>
    <p className="mt-3 text-zinc-500">
      Controlá productos, stock y alertas automáticas.
    </p>
  </div>

  <div className="rounded-3xl border bg-white p-8 shadow-sm hover:shadow-lg transition">
    <div className="text-4xl mb-5">📱</div>
    <h3 className="font-semibold text-xl">QR</h3>
    <p className="mt-3 text-zinc-500">
      Acceso rápido para reservas e ingreso de socios.
    </p>
  </div>

  <div className="rounded-3xl border bg-white p-8 shadow-sm hover:shadow-lg transition">
    <div className="text-4xl mb-5">🔔</div>
    <h3 className="font-semibold text-xl">Notificaciones</h3>
    <p className="mt-3 text-zinc-500">
      Enviá avisos automáticos a tus socios.
    </p>
  </div>

  <div className="rounded-3xl border bg-white p-8 shadow-sm hover:shadow-lg transition">
    <div className="text-4xl mb-5">📈</div>
    <h3 className="font-semibold text-xl">Reportes</h3>
    <p className="mt-3 text-zinc-500">
      Visualizá métricas, ventas y actividad del club.
    </p>
  </div>

</div>

</section>

        {/* CONTACT */}
        <section className="py-24">

      <div className="max-w-2xl mx-auto rounded-[32px] border bg-white shadow-xl p-10 space-y-8">

<h2 className="text-4xl font-bold text-center">
Solicitá una demo
</h2>

<p className="text-center text-zinc-500">
Contanos sobre tu club y nos pondremos en contacto.
</p>

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
              className="
w-full
rounded-2xl
border
border-zinc-200
bg-zinc-50
px-5
py-4
focus:bg-white
focus:ring-2
focus:ring-emerald-500
transition focus:ring-2 focus:ring-emerald-400" />

            <input name="contact" required placeholder="Email o Teléfono"
              className="
w-full
rounded-2xl
border
border-zinc-200
bg-zinc-50
px-5
py-4
focus:bg-white
focus:ring-2
focus:ring-emerald-500
transition focus:ring-2 focus:ring-emerald-400" />

            <textarea name="message" required rows={4}
              className="
w-full
rounded-2xl
border
border-zinc-200
bg-zinc-50
px-5
py-4
focus:bg-white
focus:ring-2
focus:ring-emerald-500
transition
focus:ring-2 focus:ring-emerald-400" />

            <Button type="submit" className="w-full h-12 rounded-xl">
              Enviar mensaje
            </Button>
          </form>

        </div>
        </section>

        {/* FOOTER */}
<footer className="mt-24 border-t py-12 text-center">

    <h3 className="font-semibold text-lg">
        GrowCRM
    </h3>

    <p className="mt-2 text-zinc-500">
        Plataforma integral para la gestión de clubes.
    </p>

    <p className="mt-8 text-sm text-zinc-400">
        © {new Date().getFullYear()} GrowCRM
    </p>

</footer>

      
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
