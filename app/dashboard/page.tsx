"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Building2, ChevronRight } from "lucide-react"
import { WaitOverlay } from "@/components/ui/wait-overlay"
import { supabase } from "@/lib/supabase"

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://growcrm-api-production.up.railway.app"

type Club = {
  id: string
  name: string
  role?: string
}

function getReservationReturnPath() {
  const next = new URLSearchParams(window.location.search).get("next")
  return (next?.startsWith("/qr-reserva?") || next?.startsWith("/dashboard/reservas?")) && !next.startsWith("//")
    ? next
    : null
}

export default function DashboardEntryPage() {
  const router = useRouter()
  const [clubs, setClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true

    async function resolveDashboard() {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError || !session?.user?.email) {
          router.replace("/auth/login")
          return
        }

        const qrReturnPath = getReservationReturnPath()

        const name =
          session.user.user_metadata?.full_name ||
          session.user.user_metadata?.name ||
          session.user.email.split("@")[0]

        const response = await fetch(`${API_URL}/user/sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: session.user.email, name }),
        })

        if (!response.ok) {
          throw new Error("No se pudo verificar el acceso a tu club.")
        }

        const result = await response.json()
        const userClubs: Club[] = Array.isArray(result.clubs) ? result.clubs : []

        if (!active) return

        if (userClubs.length === 0) {
          router.replace("/dashboard/onboarding")
          return
        }

        const storedClubId = localStorage.getItem("growcrm_active_club_id")
        const hasMemberRole = userClubs.some((club) => club.role === "MEMBER")
        const hasAdminRole = userClubs.some((club) => club.role !== "MEMBER")
        const hasMultipleRoles = hasMemberRole && hasAdminRole
        const selectedClub =
          userClubs.find((club) => club.id === storedClubId) ||
          (userClubs.length === 1 ? userClubs[0] : null)

        if (selectedClub && !hasMultipleRoles) {
          if (qrReturnPath && selectedClub.role !== "MEMBER") {
            localStorage.setItem("growcrm_active_club_id", selectedClub.id)
            router.replace(qrReturnPath)
            return
          }
          openClub(selectedClub)
          return
        }

        setClubs(userClubs)
      } catch (dashboardError) {
        console.error("DASHBOARD ROLE RESOLUTION ERROR:", dashboardError)
        if (active) {
          setError(
            dashboardError instanceof Error
              ? dashboardError.message
              : "No se pudo abrir tu espacio."
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    function openClub(club: Club) {
      localStorage.setItem("growcrm_active_club_id", club.id)
      router.replace(
        club.role === "MEMBER" ? "/dashboard/member" : "/dashboard/admin"
      )
    }

    void resolveDashboard()

    return () => {
      active = false
    }
  }, [router])

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5faf8]">
        <WaitOverlay
          open
          label="Abriendo tu espacio"
          messages={[
            "Verificando tu club y tu rol...",
            "Preparando tu espacio...",
          ]}
        />
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5faf8] px-5">
        <section className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-[#092f35]">No pudimos abrir tu espacio</h1>
          <p className="mt-2 text-sm text-zinc-500">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-xl bg-[#006b55] px-5 py-3 text-sm font-semibold text-white"
          >
            Reintentar
          </button>
        </section>
      </main>
    )
  }

  if (clubs.length === 0) return null

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5faf8] px-5 py-10">
      <section className="w-full max-w-2xl rounded-[32px] border border-emerald-100 bg-white p-7 shadow-xl shadow-emerald-950/5 sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
          <Building2 className="h-7 w-7" />
        </div>
        <p className="mt-5 text-center text-sm font-semibold text-emerald-700">Tu espacio GrowCRM</p>
        <h1 className="mt-2 text-center text-3xl font-bold tracking-tight text-[#092f35]">¿A qué club querés entrar?</h1>
            <p className="mt-3 text-center text-sm text-zinc-500">
              {clubs.some((club) => club.role === "MEMBER") && clubs.some((club) => club.role !== "MEMBER")
                ? "Tu cuenta tiene acceso como socio y administrador. Elegí cómo querés entrar."
                : "Elegí el club al que querés entrar."}
            </p>
        <div className="mt-8 grid gap-3">
          {clubs.map((club) => (
            <button
              key={club.id}
              type="button"
              onClick={() => {
                localStorage.setItem("growcrm_active_club_id", club.id)
                const returnPath = getReservationReturnPath()
                router.replace(club.role === "MEMBER" ? "/dashboard/member" : returnPath || "/dashboard/admin")
              }}
              className="flex items-center justify-between rounded-2xl border border-zinc-200 p-5 text-left transition hover:border-emerald-300 hover:bg-emerald-50/50"
            >
              <span>
                <span className="block font-semibold text-[#092f35]">{club.name}</span>
                <span className="mt-1 block text-xs font-medium uppercase tracking-wide text-zinc-400">
                  {club.role === "MEMBER" ? "Socio" : "Administrador"}
                </span>
              </span>
              <ChevronRight className="h-5 w-5 text-emerald-700" />
            </button>
          ))}
        </div>
      </section>
    </main>
  )
}
