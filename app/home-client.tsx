"use client"

import { useEffect, useState } from "react"
import { ChevronDown, Menu, X } from "lucide-react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { List } from "lucide-react"

export default function HomePage() {
  const searchParams = useSearchParams()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const API_URL = "https://growcrm-api-production.up.railway.app"

  useEffect(() => {
    const propertyId = searchParams.get("id")
    if (propertyId) {
      window.location.href = `/inmueble/${propertyId}`
    }
  }, [searchParams])

return (
<div className="relative min-h-screen bg-white text-zinc-900 overflow-hidden">

      {/* 🔥 BACKGROUND GLOW */}
<div className="absolute inset-0 -z-10 overflow-hidden">

  <div className="absolute -top-52 left-1/2 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-emerald-200/25 blur-[160px]" />

  <div className="absolute right-0 top-96 h-[400px] w-[400px] rounded-full bg-blue-200/20 blur-[140px]" />

</div>
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
        <button className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 hover:text-zinc-950">
          Para tu club
          <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
        </button>

        <div className="invisible absolute left-1/2 top-full z-50 mt-2 w-52 -translate-x-1/2 rounded-2xl border border-zinc-100 bg-white p-2 opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
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

    {/* BACKDROP */}
    <button
      type="button"
      aria-label="Cerrar menú"
      onClick={() => setMobileMenuOpen(false)}
      className="absolute inset-0 bg-black/30 backdrop-blur-sm"
    />

    {/* DRAWER */}
    <aside className="absolute right-0 top-0 flex h-full w-[82vw] max-w-sm flex-col bg-white shadow-2xl">

      {/* HEADER */}
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

      {/* NAV */}
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

      {/* ACTIONS */}
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
<div className="mx-auto max-w-7xl px-6">
 {/* HERO */}
<section className="grid items-center gap-10 py-10 sm:gap-14 sm:py-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:py-16">
  {/* IZQUIERDA */}
  <div className="max-w-xl">

    <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2">
      <span className="h-2 w-2 rounded-full bg-emerald-500" />
      <span className="text-sm font-medium text-emerald-900">
        Plataforma para clubes
      </span>
    </div>

<h1 className="text-4xl font-black leading-[1.02] tracking-tight text-zinc-950 sm:text-6xl lg:text-[64px]">
    Administrá tu club.
  <br />
  <span className="text-emerald-700">
    Conectá todo en un solo lugar.
  </span>
</h1>

<p className="mt-7 max-w-lg text-lg leading-relaxed text-zinc-500 sm:text-xl">
  Gestioná socios, reservas, productos, stock y comunicación
  desde una sola plataforma.
</p>

    <div className="mt-8">
      <Link href="/auth/register">
        <Button className="h-14 rounded-full bg-emerald-900 px-8 text-base hover:bg-emerald-800">
          Comenzar gratis
          <span className="ml-2">→</span>
        </Button>
      </Link>
    </div>

    <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4">

      <div className="flex items-center gap-2 text-sm font-medium text-zinc-800">
        <span className="text-lg text-emerald-800">♢</span>
        Seguro y confiable
      </div>

      <div className="flex items-center gap-2 text-sm font-medium text-zinc-800">
        <span className="text-lg text-emerald-800">ϟ</span>
        Fácil de usar
      </div>

      <div className="flex items-center gap-2 text-sm font-medium text-zinc-800">
        <span className="text-lg text-emerald-800">☁</span>
        En la nube
      </div>

    </div>

  </div>


  {/* DERECHA — MOCKUP */}
  <div className="relative">

    <div className="absolute -top-20 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-emerald-100/60 blur-3xl" />

    <div className="relative overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-2xl">

      {/* TOP BAR */}
      <div className="flex items-center justify-between border-b px-5 py-4">

        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">
            🌱 GrowCRM
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
        </div>

      </div>


      <div className="grid grid-cols-1 sm:grid-cols-[145px_1fr]">

  {/* SIDEBAR */}
  <div className="hidden min-h-[420px] bg-zinc-950 p-4 text-white sm:block">

    <div className="mb-6 rounded-xl bg-emerald-700 px-3 py-2 text-xs font-medium">
      Inicio
    </div>

    <div className="space-y-4 text-xs text-zinc-300">
      <div>♙ Socios</div>
      <div>▣ Catálogo</div>
      <div>▤ Stock</div>
      <div>▧ Reservas</div>
      <div>◫ Ventas / Retiros</div>
      <div>▢ Comunicación</div>
      <div>◉ Reportes</div>
      <div>⚙ Configuración</div>
    </div>

  </div>

  {/* DASHBOARD */}
  <div className="min-w-0 p-4 sm:p-6">

    <div className="mb-5 flex items-center justify-between gap-3">
      <h3 className="text-sm font-semibold sm:text-base">
        Resumen general
      </h3>

      <div className="shrink-0 rounded-full border px-3 py-1 text-[10px] sm:text-xs">
        Club Verde
      </div>
    </div>

    {/* MÉTRICAS */}
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">

      <div className="min-w-0 rounded-xl border p-3 sm:p-4">
        <p className="text-[9px] leading-tight text-zinc-400">
          Socios activos
        </p>
        <p className="mt-2 text-lg font-bold sm:text-xl">
          248
        </p>
      </div>

      <div className="min-w-0 rounded-xl border p-3 sm:p-4">
        <p className="text-[9px] leading-tight text-zinc-400">
          Reservas hoy
        </p>
        <p className="mt-2 text-lg font-bold sm:text-xl">
          12
        </p>
      </div>

      <div className="min-w-0 rounded-xl border p-3 sm:p-4">
        <p className="text-[9px] leading-tight text-zinc-400">
          Stock bajo
        </p>
        <p className="mt-2 text-lg font-bold sm:text-xl">
          7
        </p>
      </div>

      <div className="min-w-0 rounded-xl border p-3 sm:p-4">
        <p className="text-[9px] leading-tight text-zinc-400">
          Retiros hoy
        </p>
        <p className="mt-2 text-lg font-bold sm:text-xl">
          18
        </p>
      </div>

    </div>

    {/* ACTIVIDAD */}
    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">

      {/* RESERVAS */}
      <div className="min-w-0 rounded-xl border p-3 sm:p-4">

        <div className="mb-4 flex items-center justify-between gap-2">
          <span className="text-xs font-semibold">
            Reservas recientes
          </span>

          <span className="shrink-0 text-[9px] text-emerald-700">
            Ver todas
          </span>
        </div>

        <div className="space-y-3 text-[10px] sm:text-xs">

          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-medium">Juan Pérez</p>
              <p className="text-zinc-400">Reserva #1247</p>
            </div>
            <span className="shrink-0 text-emerald-600">
              Aprobada
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-medium">María González</p>
              <p className="text-zinc-400">Reserva #1246</p>
            </div>
            <span className="shrink-0 text-amber-500">
              Pendiente
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-medium">Lucas Rodríguez</p>
              <p className="text-zinc-400">Reserva #1245</p>
            </div>
            <span className="shrink-0 text-emerald-600">
              Aprobada
            </span>
          </div>

        </div>

      </div>

      {/* ACTIVIDAD / STOCK */}
      <div className="min-w-0 rounded-xl border p-3 sm:p-4">

        <div className="mb-4 flex items-center justify-between gap-2">
          <span className="text-xs font-semibold">
            Actividad reciente
          </span>

          <span className="shrink-0 text-[9px] text-emerald-700">
            Ver todo
          </span>
        </div>

        <div className="space-y-3 text-[10px] sm:text-xs">

          <div>
            <p className="font-medium">
              Nueva reserva recibida
            </p>
            <p className="text-zinc-400">
              Hace 5 min
            </p>
          </div>

          <div>
            <p className="font-medium">
              Reserva aprobada
            </p>
            <p className="text-zinc-400">
              Hace 15 min
            </p>
          </div>

          <div>
            <p className="font-medium">
              Stock actualizado
            </p>
            <p className="text-zinc-400">
              Hace 1 h
            </p>
          </div>

        </div>

      </div>

    </div>

  </div>

</div>
    </div>

  </div>

</section>
{/* TIPOS DE CLUBES */}
<section className="py-8">

  <div className="rounded-[28px] border border-emerald-100 bg-emerald-50/60 px-6 py-8">

    <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

      <div className="flex items-center gap-4 lg:min-w-[320px]">

        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-2xl">
          👥
        </div>

        <h2 className="text-xl font-bold leading-tight text-emerald-950">
          Un solo sistema para
          <br />
          distintos tipos de clubes.
        </h2>

      </div>

      <div className="grid flex-1 grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-5">

        <div className="flex items-center gap-3 border-l border-emerald-200 pl-5">
          <span className="text-2xl">🌿</span>
          <span className="text-sm font-medium text-emerald-950">
            Clubes de cannabis
          </span>
        </div>

        <div className="flex items-center gap-3 border-l border-emerald-200 pl-5">
          <span className="text-2xl">🍷</span>
          <span className="text-sm font-medium text-emerald-950">
            Clubes de vinos
          </span>
        </div>

        <div className="flex items-center gap-3 border-l border-emerald-200 pl-5">
          <span className="text-2xl">📖</span>
          <span className="text-sm font-medium text-emerald-950">
            Clubes de lectura
          </span>
        </div>

        <div className="flex items-center gap-3 border-l border-emerald-200 pl-5">
          <span className="text-2xl">👥</span>
          <span className="text-sm font-medium text-emerald-950">
            Comunidades
          </span>
        </div>

        <div className="hidden items-center gap-3 border-l border-emerald-200 pl-5 lg:flex">
          <span className="text-xl">•••</span>
          <span className="text-sm font-medium text-emerald-950">
            y más
          </span>
        </div>

      </div>

    </div>

  </div>

</section>

{/* FUNCIONALIDADES */}
<section className="py-24">

  <div className="mb-14 text-center">

    <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-emerald-800">
      Todo lo que tu club necesita
    </p>

    <h2 className="text-4xl font-bold tracking-tight text-zinc-950 md:text-5xl">
      Gestión simple. Control total.
    </h2>

    <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-500">
      Herramientas diseñadas para facilitar tu día a día y hacer crecer tu club.
    </p>

  </div>


  <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">

    {/* SOCIOS */}
    <div className="rounded-3xl border border-zinc-200 bg-white p-7 transition hover:-translate-y-1 hover:shadow-lg">

      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
        👥
      </div>

      <h3 className="text-lg font-semibold">
        Socios
      </h3>

      <p className="mt-3 text-sm leading-relaxed text-zinc-500">
        Gestioná tu comunidad y toda su información desde un solo lugar.
      </p>

    </div>


    {/* CATÁLOGO Y STOCK */}
    <div className="rounded-3xl border border-zinc-200 bg-white p-7 transition hover:-translate-y-1 hover:shadow-lg">

      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
        📋
      </div>

      <h3 className="text-lg font-semibold">
        Catálogo y stock
      </h3>

      <p className="mt-3 text-sm leading-relaxed text-zinc-500">
        Controlá productos, precios y disponibilidad de tu club.
      </p>

    </div>


    {/* RESERVAS Y QR */}
    <div className="rounded-3xl border border-zinc-200 bg-white p-7 transition hover:-translate-y-1 hover:shadow-lg">

      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
        📱
      </div>

      <h3 className="text-lg font-semibold">
        Reservas y QR
      </h3>

      <p className="mt-3 text-sm leading-relaxed text-zinc-500">
        Gestioná reservas y utilizá códigos QR para retiros o accesos.
      </p>

    </div>


    {/* VENTAS Y RETIROS */}
    <div className="rounded-3xl border border-zinc-200 bg-white p-7 transition hover:-translate-y-1 hover:shadow-lg">

      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
        🛒
      </div>

      <h3 className="text-lg font-semibold">
        Ventas y retiros
      </h3>

      <p className="mt-3 text-sm leading-relaxed text-zinc-500">
        Registrá ventas y retiros de forma rápida y ordenada.
      </p>

    </div>


    {/* COMUNICACIÓN */}
    <div className="rounded-3xl border border-zinc-200 bg-white p-7 transition hover:-translate-y-1 hover:shadow-lg">

      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
        💬
      </div>

      <h3 className="text-lg font-semibold">
        Comunicación
      </h3>

      <p className="mt-3 text-sm leading-relaxed text-zinc-500">
        Enviá notificaciones y anuncios a tus socios al instante.
      </p>

    </div>

  </div>

</section>

        {/* CONTACT */}
        <section className="py-24">

      <div className="max-w-2xl mx-auto rounded-[32px] border bg-white shadow-xl p-10 space-y-8">

<h2 className="text-4xl font-bold text-center">
  Contanos sobre tu club.
</h2>

<p className="text-center text-zinc-500">
  ¿Querés saber cómo GrowCRM puede ayudarte a gestionar tu club?
  Dejanos tus datos y nos ponemos en contacto.
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

<textarea
  name="message"
  required
  rows={4}
  placeholder="Contanos sobre tu club o qué necesitás gestionar."
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
focus:ring-2 focus:ring-emerald-400"
/>

            <Button type="submit" className="w-full h-12 rounded-xl">
              Enviar mensaje
            </Button>
          </form>

        </div>
        </section>

{/* FOOTER */}
<footer className="mt-24 border-t border-zinc-200 bg-white">

  <div className="mx-auto max-w-7xl px-6 py-14">

    <div className="grid gap-12 md:grid-cols-[2fr_1fr_1fr_1fr]">

      {/* BRAND */}
      <div>
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-zinc-950"
        >
          GrowCRM
        </Link>

        <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-500">
          La plataforma para gestionar tu club de forma simple,
          organizada y desde un solo lugar.
        </p>
      </div>

      {/* PARA TU CLUB */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-950">
          Para tu club
        </h3>

        <div className="mt-4 space-y-3">
          <Link
            href="/funcionalidades"
            className="block text-sm text-zinc-500 transition hover:text-zinc-950"
          >
            Funcionalidades
          </Link>

          <Link
            href="/club-partners"
            className="block text-sm text-zinc-500 transition hover:text-zinc-950"
          >
            Club Partners
          </Link>

          <Link
            href="/precios"
            className="block text-sm text-zinc-500 transition hover:text-zinc-950"
          >
            Precios
          </Link>
        </div>
      </div>

      {/* AYUDA */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-950">
          Ayuda
        </h3>

        <div className="mt-4 space-y-3">
          <Link
            href="/como-funciona"
            className="block text-sm text-zinc-500 transition hover:text-zinc-950"
          >
            Cómo funciona
          </Link>

          <Link
            href="/contactanos"
            className="block text-sm text-zinc-500 transition hover:text-zinc-950"
          >
            Contáctanos
          </Link>
        </div>
      </div>

      {/* ACCESO */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-950">
          Acceso
        </h3>

        <div className="mt-4 space-y-3">
          <Link
            href="/auth/login"
            className="block text-sm text-zinc-500 transition hover:text-zinc-950"
          >
            Ingresar
          </Link>

          <Link
            href="/auth/register"
            className="block text-sm text-zinc-500 transition hover:text-zinc-950"
          >
            Crear mi club
          </Link>
        </div>
      </div>

    </div>

    {/* BOTTOM */}
    <div className="mt-12 flex flex-col gap-4 border-t border-zinc-100 pt-6 text-sm text-zinc-400 sm:flex-row sm:items-center sm:justify-between">

      <p>
        © {new Date().getFullYear()} GrowCRM
      </p>

      <Link
        href="/"
        className="font-medium text-zinc-500 transition hover:text-zinc-950"
      >
        Volver al inicio ↑
      </Link>

    </div>

  </div>

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
