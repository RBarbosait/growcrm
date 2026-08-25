"use client"
import { useState } from "react"
import type { ElementType } from "react"
import { useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Package,
  CalendarDays,
  ShoppingCart,
  Bell,
  LogOut,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  UserPlus,
  CalendarCheck,
  Menu,
  X,
  LayoutGrid,
} from "lucide-react"

const menuItems = [
  {
    label: "Inicio",
    icon: LayoutDashboard,
    key: "inicio",
  },
  {
    label: "Socios",
    icon: Users,
    key: "socios",
  },
  {
    label: "Productos",
    icon: Package,
    key: "productos",
  },
  {
    label: "Reservas",
    icon: CalendarDays,
    key: "reservas",
  },
  {
    label: "Ventas",
    icon: ShoppingCart,
    key: "ventas",
  },
]

const activity = [
  {
    icon: CalendarCheck,
    title: "Reserva confirmada",
    description: "Martín confirmó una reserva.",
    time: "Hace 12 min",
  },
  {
    icon: UserPlus,
    title: "Nuevo socio",
    description: "Sofía se incorporó al club.",
    time: "Hace 1 h",
  },
  {
    icon: TrendingUp,
    title: "Nueva venta",
    description: "Venta registrada por $2.450.",
    time: "Hace 2 h",
  },
  {
    icon: AlertTriangle,
    title: "Stock bajo",
    description: "Un producto está por debajo del mínimo.",
    time: "Hace 3 h",
  },
]

export default function DemoPage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState("inicio")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">

{/* HEADER */}
<header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
  <div className="flex h-16 items-center justify-between px-4 sm:px-6">

    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-800 text-sm font-bold text-white">
        G
      </div>

      <div>
        <p className="font-bold leading-none">
          GrowCRM
        </p>

        <p className="mt-1 text-xs text-zinc-500">
          Modo demostración
        </p>
      </div>
    </div>

    <div className="flex items-center gap-2 sm:gap-4">

      <div className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:block">
        DEMO
      </div>

      <button
        type="button"
        onClick={() => router.push("/dashboard")}
        className="hidden items-center gap-2 rounded-xl px-3 py-2 text-sm text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 sm:flex"
      >
        <LogOut className="h-4 w-4" />
        Salir
      </button>

      <button
        type="button"
        onClick={() => setMobileMenuOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 text-zinc-700 transition hover:bg-zinc-50 md:hidden"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>

    </div>
  </div>
</header>
{/* MOBILE MENU */}
{mobileMenuOpen && (
  <div className="fixed inset-0 z-[100] md:hidden">

    <button
      type="button"
      aria-label="Cerrar menú"
      onClick={() => setMobileMenuOpen(false)}
      className="absolute inset-0 bg-black/30"
    />

    <aside className="absolute right-0 top-0 flex h-full w-[82vw] max-w-sm flex-col bg-white shadow-xl">

      <div className="flex h-16 items-center justify-between border-b border-zinc-100 px-5">

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-800 text-sm font-bold text-white">
            G
          </div>

          <span className="font-bold">
            GrowCRM
          </span>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-50"
          aria-label="Cerrar menú"
        >
          <X className="h-5 w-5" />
        </button>

      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">

        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Demo
        </p>

        {menuItems.map((item) => {
          const Icon = item.icon
          const active = activeSection === item.key

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setActiveSection(item.key)
                setMobileMenuOpen(false)
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                active
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          )
        })}

        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-600 hover:bg-zinc-50"
        >
          <Bell className="h-4 w-4" />
          Avisos
        </button>

      </nav>

      <div className="border-t border-zinc-100 p-4">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          <LogOut className="h-4 w-4" />
          Salir de la demo
        </button>
      </div>

    </aside>
  </div>
)}

      <div className="flex">

        {/* SIDEBAR */}
        <aside className="hidden min-h-[calc(100vh-64px)] w-64 shrink-0 border-r border-zinc-200 bg-white p-4 md:block">

          <div className="mb-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Club demo
            </p>

            <h2 className="mt-1 font-bold text-zinc-900">
              Green House Club
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              15 socios
            </p>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const active = activeSection === item.key

              return (
                <button
                  key={item.key}
                  onClick={() => setActiveSection(item.key)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              )
            })}
          </nav>

          <div className="mt-8 border-t border-zinc-100 pt-6">
            <button
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-900"
            >
              <Bell className="h-4 w-4" />
              Avisos
            </button>
          </div>

        </aside>

        {/* MAIN */}
        <main className="min-w-0 flex-1 p-4 sm:p-6 md:p-8">

          {/* TOP */}
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-zinc-500">
                <span>Demo</span>
                <ChevronRight className="h-3 w-3" />
                <span>Inicio</span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Green House Club
              </h1>

              <p className="mt-2 text-zinc-500">
                Vista general de tu club
              </p>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
              Estás explorando una demo
            </div>

          </div>

          {/* KPI */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <StatCard
              title="Socios"
              value="15"
              description="+2 este mes"
              icon={Users}
            />

            <StatCard
              title="Productos"
              value="12"
              description="2 con stock bajo"
              icon={Package}
            />

            <StatCard
              title="Reservas"
              value="8"
              description="3 pendientes"
              icon={CalendarDays}
            />

            <StatCard
              title="Ventas"
              value="$18.450"
              description="Este mes"
              icon={ShoppingCart}
            />

          </div>

          {/* CONTENT */}
          <div className="mt-8 grid gap-6 lg:grid-cols-3">

            {/* ACTIVITY */}
            <section className="rounded-3xl border border-zinc-200 bg-white lg:col-span-2">

              <div className="border-b border-zinc-100 p-6">
                <h2 className="font-bold">
                  Actividad reciente
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Lo último que ocurrió en el club
                </p>
              </div>

              <div className="divide-y divide-zinc-100">

                {activity.map((item, index) => {
                  const Icon = item.icon

                  return (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-5"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100">
                        <Icon className="h-5 w-5 text-zinc-600" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">
                          {item.title}
                        </p>

                        <p className="mt-1 text-sm text-zinc-500">
                          {item.description}
                        </p>
                      </div>

                      <span className="shrink-0 text-xs text-zinc-400">
                        {item.time}
                      </span>
                    </div>
                  )
                })}

              </div>

            </section>

            {/* QUICK VIEW */}
            <section className="rounded-3xl border border-zinc-200 bg-white">

              <div className="border-b border-zinc-100 p-6">
                <h2 className="font-bold">
                  Resumen
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Estado actual
                </p>
              </div>

              <div className="space-y-5 p-6">

                <SummaryRow
                  label="Socios activos"
                  value="13"
                />

                <SummaryRow
                  label="Reservas pendientes"
                  value="3"
                />

                <SummaryRow
                  label="Ventas del mes"
                  value="$18.450"
                />

                <SummaryRow
                  label="Productos con stock bajo"
                  value="2"
                  warning
                />

              </div>

            </section>

          </div>

          {/* DEMO CTA */}
          <div className="mt-8 rounded-3xl border border-emerald-200 bg-emerald-50/70 p-6 md:p-8">

            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">

              <div>
                <p className="text-sm font-semibold text-emerald-700">
                  ¿Te gusta lo que ves?
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  Creá tu propio club en GrowCRM
                </h2>

                <p className="mt-2 max-w-xl text-sm text-zinc-600">
                  Configurá tu espacio y empezá a administrar socios,
                  productos, reservas y ventas.
                </p>
              </div>

              <button
                onClick={() => router.push("/dashboard/create-club")}
className="shrink-0 rounded-full bg-emerald-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"              >
                Crear mi club →
              </button>

            </div>

          </div>

        </main>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string
  value: string
  description: string
  icon: ElementType
}) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">

      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-zinc-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
          <Icon className="h-5 w-5 text-emerald-600" />
        </div>
      </div>

      <p className="mt-3 text-xs text-zinc-400">
        {description}
      </p>

    </div>
  )
}

function SummaryRow({
  label,
  value,
  warning = false,
}: {
  label: string
  value: string
  warning?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-zinc-500">
        {label}
      </span>

      <span
        className={`text-sm font-bold ${
          warning ? "text-amber-600" : "text-zinc-900"
        }`}
      >
        {value}
      </span>
    </div>
  )
}