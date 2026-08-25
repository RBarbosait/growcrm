"use client"

import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Building2, Eye, ArrowRight, Sparkles, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function OnboardingPage() {
  const router = useRouter()
  const [userName, setUserName] = useState("")

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) return

      setUserName(
        session.user.user_metadata.full_name ||
          session.user.user_metadata.name ||
          session.user.email?.split("@")[0] ||
          ""
      )
    }

    loadUser()
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-zinc-900">
{/* BACKGROUND GLOW */}
<div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
  <div className="absolute -top-52 left-1/2 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-emerald-200/25 blur-[160px]" />
  <div className="absolute right-0 top-96 h-[400px] w-[400px] rounded-full bg-blue-200/20 blur-[140px]" />
</div>

{/* HEADER */}
<header className="relative z-50 w-full py-5">
  <div className="mx-auto flex h-14 max-w-7xl items-center justify-between rounded-2xl border border-zinc-100 bg-white/90 px-4 shadow-sm backdrop-blur sm:px-5">

    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-800 text-sm font-bold text-white">
        G
      </div>

      <span className="text-xl font-bold tracking-tight">
        GrowCRM
      </span>
    </div>

<div className="flex items-center gap-4">
  <span className="hidden text-sm font-medium text-zinc-500 sm:block">
    Configuración inicial
  </span>

  <button
    type="button"
    onClick={() => router.push("/")}
    className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-950"
  >
    <ArrowLeft className="h-4 w-4" />
    Volver
  </button>
</div>

  </div>
</header>

      {/* MAIN */}
<main className="relative z-10 flex-1">
  <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          {/* INTRO */}
          <div className="mx-auto max-w-3xl text-center">
<div className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-900">              <Sparkles className="h-4 w-4" />
              Primer paso
            </div>

<h1 className="text-4xl font-black leading-[1.02] tracking-tight text-zinc-950 sm:text-5xl md:text-6xl">
                Bienvenido
              {userName ? `, ${userName}` : ""}
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-500 sm:text-lg">
              Configurá tu espacio de trabajo para empezar a administrar
              tu club con GrowCRM.
            </p>
          </div>

          {/* OPTIONS */}
          <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-6 sm:mt-12 md:grid-cols-2">
            {/* CREAR CLUB */}
            <Card
className="group cursor-pointer rounded-3xl border border-zinc-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl"              onClick={() => router.push("/dashboard/create-club")}
            >
              <CardHeader className="p-6 pb-5 sm:p-8 sm:pb-5">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
                  <Building2 className="h-7 w-7 text-emerald-700" />
                </div>

                <CardTitle className="text-2xl font-bold tracking-tight text-zinc-950">
                  Crear mi club
                </CardTitle>

                <CardDescription className="mt-3 text-base leading-relaxed text-zinc-500">
                  Creá el espacio desde donde vas a administrar productos,
                  socios, reservas, stock y ventas.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-8 pt-4">
                <Button
className="h-12 w-full rounded-full bg-emerald-900 font-semibold text-white hover:bg-emerald-800"                >
                  Crear mi club
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>

            {/* DEMO */}
            <Card
className="group cursor-pointer rounded-3xl border border-zinc-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl"              onClick={() => router.push("/dashboard/demo")}
            >
              <CardHeader className="p-6 pb-5 sm:p-8 sm:pb-5">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
                  <Eye className="h-7 w-7 text-blue-600" />
                </div>

                <CardTitle className="text-2xl font-bold tracking-tight text-zinc-950">
                  Explorar demostración
                </CardTitle>

                <CardDescription className="mt-3 text-base leading-relaxed text-zinc-500">
                  Conocé GrowCRM usando un club ya configurado antes de
                  crear el tuyo.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 pt-4 sm:p-8 sm:pt-4">
                <Button
                  variant="outline"
                  className="h-12 w-full rounded-full border-zinc-300 font-semibold text-zinc-800 hover:bg-zinc-50"
                >
                  Abrir demo
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>
          </div>


        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-zinc-100 py-6">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-4 text-center sm:px-6">
          <span className="text-sm text-zinc-400">
            GrowCRM · Administración simple para tu club.
          </span>
        </div>
      </footer>
    </div>
  )
}