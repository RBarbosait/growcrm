"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, MessageCircle } from "lucide-react"
import ClubWall from "@/components/dashboard/club-wall"
import { WaitOverlay } from "@/components/ui/wait-overlay"
import { supabase } from "@/lib/supabase"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://growcrm-api-production.up.railway.app"
type AdminClub = { id: string; name: string; role: string }

export default function AdminWallPage() {
  const router = useRouter()
  const [club, setClub] = useState<AdminClub | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function loadClub() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) { router.replace("/auth/login?next=%2Fdashboard%2Fmuro"); return }
        const clubId = localStorage.getItem("growcrm_active_club_id")
        if (!clubId) { router.replace("/dashboard"); return }
        const response = await fetch(`${API_URL}/user/sync`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: session.user.email, name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] }) })
        const result = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(result.error || "No se pudo verificar el acceso al club.")
        const selected = (result.clubs || []).find((item: AdminClub) => item.id === clubId && item.role === "ADMIN")
        if (!selected) throw new Error("Esta sección está disponible solo para administradores del club.")
        setClub(selected)
      } catch (loadError) { setError(loadError instanceof Error ? loadError.message : "No se pudo abrir el muro.") }
      finally { setLoading(false) }
    }
    void loadClub()
  }, [router])

  if (loading) return <main className="min-h-screen bg-[#f7faf9]"><WaitOverlay open label="Abriendo el muro del club" messages={["Verificando tus permisos…", "Cargando la comunidad…"]} /></main>
  if (error || !club) return <main className="flex min-h-screen items-center justify-center bg-[#f7faf9] px-5"><section className="max-w-md rounded-3xl border border-zinc-200 bg-white p-8 text-center"><MessageCircle className="mx-auto h-8 w-8 text-emerald-700" /><h1 className="mt-4 text-xl font-bold">No se pudo abrir el muro</h1><p className="mt-2 text-sm text-zinc-500">{error || "No hay un club administrador seleccionado."}</p><button type="button" onClick={() => router.replace("/dashboard/admin")} className="mt-5 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white">Volver al panel</button></section></main>

  return <main className="min-h-screen bg-[#f7faf9] px-4 py-8 text-[#092f35] sm:px-8 lg:px-12"><div className="mx-auto max-w-7xl"><button type="button" onClick={() => router.replace("/dashboard/admin")} className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-emerald-800"><ArrowLeft className="h-4 w-4" />Volver al panel</button><div className="mt-5 rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-7"><ClubWall clubId={club.id} clubName={club.name} role="ADMIN" /></div></div></main>
}
