"use client"

import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Building2, Eye, ArrowRight, Sparkles } from "lucide-react"

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
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 flex flex-col">
      {/* HEADER */}
      <header className="h-20 border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-800 text-lg font-bold text-white">
              G
            </div>

            <span className="text-xl font-bold tracking-tight">
              GrowCRM
            </span>
          </div>

          <div className="text-sm text-zinc-500">
            Configuración inicial
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8 lg:py-20">
          {/* INTRO */}
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-sm font-medium text-emerald-800">
              <Sparkles className="h-4 w-4" />
              Primer paso
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-zinc-950 sm:text-5xl">
              Bienvenido
              {userName ? `, ${userName}` : ""}
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-zinc-500">
              Configurá tu espacio de trabajo para empezar a administrar
              tu club con GrowCRM.
            </p>
          </div>

          {/* OPTIONS */}
          <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
            {/* CREAR CLUB */}
            <Card
              className="group cursor-pointer rounded-2xl border-zinc-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg"
              onClick={() => router.push("/dashboard/create-club")}
            >
              <CardHeader className="p-8 pb-5">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-50">
                  <Building2 className="h-7 w-7 text-emerald-700" />
                </div>

                <CardTitle className="text-2xl font-bold text-zinc-950">
                  Crear mi club
                </CardTitle>

                <CardDescription className="mt-3 text-base leading-7 text-zinc-500">
                  Creá el espacio desde donde vas a administrar productos,
                  socios, reservas, stock y ventas.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-8 pt-4">
                <Button
                  className="h-12 w-full rounded-xl bg-emerald-800 font-semibold text-white hover:bg-emerald-900"
                >
                  Crear mi club
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>

            {/* DEMO */}
            <Card
              className="group cursor-pointer rounded-2xl border-zinc-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg"
              onClick={() => router.push("/dashboard/demo")}
            >
              <CardHeader className="p-8 pb-5">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50">
                  <Eye className="h-7 w-7 text-blue-600" />
                </div>

                <CardTitle className="text-2xl font-bold text-zinc-950">
                  Explorar demostración
                </CardTitle>

                <CardDescription className="mt-3 text-base leading-7 text-zinc-500">
                  Conocé GrowCRM usando un club ya configurado antes de
                  crear el tuyo.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-8 pt-4">
                <Button
                  variant="outline"
                  className="h-12 w-full rounded-xl border-zinc-300 font-semibold text-zinc-800 hover:bg-zinc-50"
                >
                  Abrir demo
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* INFO */}
          <div className="mx-auto mt-10 max-w-5xl rounded-2xl border border-zinc-200 bg-white px-6 py-5">
            <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
              <div>
                <p className="text-sm font-semibold text-zinc-800">
                  ¿Es tu primera vez en GrowCRM?
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  Podés explorar la demostración antes de crear tu club.
                </p>
              </div>

              <span className="text-sm font-medium text-emerald-700">
                Tu información queda asociada a tu cuenta.
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-sm text-zinc-500 sm:flex-row lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-800 text-xs font-bold text-white">
              G
            </div>

            <span>GrowCRM</span>
          </div>

          <span>
            Administración simple para tu club.
          </span>
        </div>
      </footer>
    </div>
  )
}