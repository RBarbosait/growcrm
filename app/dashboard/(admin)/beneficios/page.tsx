"use client"

import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ExternalLink, Gift, ImagePlus, Pencil, Plus, Sparkles, Trash2, X } from "lucide-react"
import { WaitOverlay } from "@/components/ui/wait-overlay"
import { supabase } from "@/lib/supabase"

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://growcrm-api-production.up.railway.app"

type ClubBenefit = {
  id: string
  clubId: string
  title: string
  description: string
  imageUrl: string | null
  linkUrl: string | null
  active: boolean
  sortOrder: number
}

const emptyForm = { title: "", description: "", imageUrl: "", linkUrl: "" }

export default function BenefitsAdminPage() {
  const router = useRouter()
  const [benefits, setBenefits] = useState<ClubBenefit[]>([])
  const [clubId, setClubId] = useState("")
  const [clubName, setClubName] = useState("")
  const [accessToken, setAccessToken] = useState("")
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    async function loadBenefits() {
      try {
        const { data: authData } = await supabase.auth.getSession()
        const session = authData.session
        if (!session) {
          router.replace("/auth/login")
          return
        }

        const selectedClubId = localStorage.getItem("growcrm_active_club_id")
        if (!selectedClubId) {
          setError("No hay un club seleccionado. Volvé al dashboard y elegí tu club administrador.")
          return
        }

        const syncResponse = await fetch(`${API_URL}/user/sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.email,
          }),
        })

        if (!syncResponse.ok) throw new Error("No se pudo verificar el acceso al club.")
        const userData = await syncResponse.json()
        const adminClub = (userData.clubs || []).find(
          (club: { id: string; name: string; role: string }) =>
            club.id === selectedClubId && club.role === "ADMIN"
        )

        if (!adminClub) {
          throw new Error("Esta sección está disponible solo para administradores del club.")
        }

        setClubId(selectedClubId)
        setClubName(adminClub.name)
        setAccessToken(session.access_token)

        const response = await fetch(`${API_URL}/club/${selectedClubId}/benefits`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        const result = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(result.error || "No se pudieron cargar los beneficios.")
        setBenefits(Array.isArray(result) ? result : [])
      } catch (loadError) {
        console.error("LOAD CLUB BENEFITS ERROR:", loadError)
        setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar los beneficios.")
      } finally {
        setLoading(false)
      }
    }

    void loadBenefits()
  }, [router])

  async function saveBenefit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!clubId || !accessToken) return

    setSaving(true)
    setError("")
    try {
      const response = await fetch(
        editingId
          ? `${API_URL}/club-benefit/${editingId}`
          : `${API_URL}/club/${clubId}/benefits`,
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(form),
        }
      )
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || "No se pudo guardar el beneficio.")

      if (editingId) {
        setBenefits((current) => current.map((benefit) => benefit.id === editingId ? result : benefit))
      } else {
        setBenefits((current) => [result, ...current])
      }
      setForm(emptyForm)
      setEditingId(null)
    } catch (saveError) {
      console.error("SAVE CLUB BENEFIT ERROR:", saveError)
      setError(saveError instanceof Error ? saveError.message : "No se pudo guardar el beneficio.")
    } finally {
      setSaving(false)
    }
  }

  function editBenefit(benefit: ClubBenefit) {
    setEditingId(benefit.id)
    setForm({
      title: benefit.title,
      description: benefit.description,
      imageUrl: benefit.imageUrl || "",
      linkUrl: benefit.linkUrl || "",
    })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function toggleBenefit(benefit: ClubBenefit) {
    try {
      const response = await fetch(`${API_URL}/club-benefit/${benefit.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ active: !benefit.active }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || "No se pudo cambiar el estado.")
      setBenefits((current) => current.map((item) => item.id === benefit.id ? result : item))
    } catch (toggleError) {
      console.error("TOGGLE BENEFIT ERROR:", toggleError)
      setError(toggleError instanceof Error ? toggleError.message : "No se pudo cambiar el estado.")
    }
  }

  async function deleteBenefit(benefit: ClubBenefit) {
    if (!window.confirm(`¿Eliminar el beneficio “${benefit.title}”?`)) return

    try {
      const response = await fetch(`${API_URL}/club-benefit/${benefit.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || "No se pudo eliminar el beneficio.")
      setBenefits((current) => current.filter((item) => item.id !== benefit.id))
      if (editingId === benefit.id) cancelEdit()
    } catch (deleteError) {
      console.error("DELETE BENEFIT ERROR:", deleteError)
      setError(deleteError instanceof Error ? deleteError.message : "No se pudo eliminar el beneficio.")
    }
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
  }

  if (loading) {
    return <main className="min-h-screen bg-[#f5faf8]"><WaitOverlay open label="Cargando beneficios" messages={["Abriendo la administración de beneficios...", "Cargando lo que ve tu comunidad...", "Ya casi está listo..."]} /></main>
  }

  return (
    <main className="min-h-screen bg-[#f5faf8] text-[#092f35]">
      <WaitOverlay open={saving} label="Guardando beneficio" messages={["Guardando el beneficio...", "Actualizando el espacio de socios...", "Ya casi está listo..."]} />
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        <button type="button" onClick={() => router.push("/dashboard/admin")} className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 transition hover:text-emerald-800">
          <ArrowLeft className="h-4 w-4" /> Volver al dashboard
        </button>

        <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-emerald-700">{clubName || "Tu club"}</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Beneficios para socios</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">Publicá experiencias, ventajas y novedades que los socios encontrarán en su espacio.</p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-emerald-800 shadow-sm ring-1 ring-emerald-100">
            <Sparkles className="h-4 w-4" /> Visible en el dashboard de socios
          </div>
        </header>

        {error && <div role="alert" className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">{error}</div>}

        <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <form onSubmit={saveBenefit} className="rounded-[28px] border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Gift className="h-5 w-5" /></span>
              <div>
                <h2 className="font-bold">{editingId ? "Editar beneficio" : "Crear beneficio"}</h2>
                <p className="text-xs text-zinc-400">Los campos con * son obligatorios.</p>
              </div>
            </div>

            <label className="mt-6 block text-sm font-semibold text-zinc-700">
              Título *
              <input required maxLength={90} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Ej.: Encuentros exclusivos" className="mt-2 h-12 w-full rounded-xl border border-zinc-200 px-4 text-sm font-normal outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" />
            </label>

            <label className="mt-5 block text-sm font-semibold text-zinc-700">
              Descripción *
              <textarea required maxLength={700} rows={4} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Contale al socio en qué consiste y cómo puede aprovecharlo." className="mt-2 w-full resize-y rounded-xl border border-zinc-200 px-4 py-3 text-sm font-normal leading-6 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" />
            </label>

            <label className="mt-5 block text-sm font-semibold text-zinc-700">
              Imagen (URL)
              <span className="relative mt-2 block">
                <ImagePlus className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input type="url" value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} placeholder="https://..." className="h-12 w-full rounded-xl border border-zinc-200 pl-11 pr-4 text-sm font-normal outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" />
              </span>
            </label>

            <label className="mt-5 block text-sm font-semibold text-zinc-700">
              Enlace (opcional)
              <span className="relative mt-2 block">
                <ExternalLink className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input type="url" value={form.linkUrl} onChange={(event) => setForm({ ...form, linkUrl: event.target.value })} placeholder="https://..." className="h-12 w-full rounded-xl border border-zinc-200 pl-11 pr-4 text-sm font-normal outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" />
              </span>
            </label>

            <div className="mt-7 flex gap-3">
              <button type="submit" disabled={saving} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#006b55] px-5 text-sm font-semibold text-white transition hover:bg-[#005c49] disabled:opacity-60">
                {editingId ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {editingId ? "Guardar cambios" : "Publicar beneficio"}
              </button>
              {editingId && <button type="button" onClick={cancelEdit} className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-200 text-zinc-500 hover:bg-zinc-50" aria-label="Cancelar edición"><X className="h-4 w-4" /></button>}
            </div>
          </form>

          <section>
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">Publicados</h2>
                <p className="mt-1 text-sm text-zinc-500">{benefits.length} {benefits.length === 1 ? "beneficio" : "beneficios"} configurados</p>
              </div>
            </div>

            {benefits.length ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {benefits.map((benefit) => (
                  <article key={benefit.id} className={`overflow-hidden rounded-3xl border bg-white shadow-sm ${benefit.active ? "border-zinc-200" : "border-zinc-200 opacity-70"}`}>
                    {benefit.imageUrl ? <img src={benefit.imageUrl} alt="" className="h-36 w-full object-cover" /> : <div className="flex h-28 items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 text-emerald-700"><Gift className="h-8 w-8" /></div>}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${benefit.active ? "bg-emerald-50 text-emerald-800" : "bg-zinc-100 text-zinc-500"}`}>{benefit.active ? "Visible a socios" : "Pausado"}</span>
                          <h3 className="mt-3 font-bold text-[#092f35]">{benefit.title}</h3>
                        </div>
                      </div>
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-500">{benefit.description}</p>
                      <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3">
                        <button type="button" onClick={() => void toggleBenefit(benefit)} className="text-xs font-semibold text-emerald-800 hover:text-emerald-950">{benefit.active ? "Pausar" : "Publicar"}</button>
                        <div className="flex gap-1">
                          <button type="button" onClick={() => editBenefit(benefit)} aria-label="Editar beneficio" className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100"><Pencil className="h-4 w-4" /></button>
                          <button type="button" onClick={() => void deleteBenefit(benefit)} aria-label="Eliminar beneficio" className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-emerald-200 bg-white px-6 py-14 text-center">
                <Gift className="mx-auto h-9 w-9 text-emerald-700/70" />
                <h3 className="mt-4 font-bold">Todavía no publicaste beneficios</h3>
                <p className="mt-2 text-sm text-zinc-500">Creá el primero y aparecerá en el espacio de tus socios.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
