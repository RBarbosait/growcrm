"use client"

export const runtime = "edge"
export const dynamic = "force-dynamic"

import { supabase } from "@/lib/supabase"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Home,
  Plus,
  LogOut,
  Eye,
  Edit,
  Trash2,
  Crown,
  Gift,
  CheckCircle,
  Building2,
} from "lucide-react"

const API_URL = "https://growcrm-api-production.up.railway.app"

interface User {
  email: string
  name: string
  freePublicationUsed: boolean
  subscriptionType: string | null
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [properties, setProperties] = useState<any[]>([])
  const [insights, setInsights] = useState<any>({})
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const [checkingClub, setCheckingClub] = useState(true)


  const router = useRouter()
  const searchParams = useSearchParams()

useEffect(() => {
  let mounted = true

  const setUserFromSession = (session: any) => {
    if (!session || !mounted) return

    setUser({
      email: session.user.email!,
      name:
        session.user.user_metadata.full_name ||
        session.user.user_metadata.name ||
        session.user.email!.split("@")[0],
      freePublicationUsed: false,
      subscriptionType: null,
    })
  }

  const loadSession = async () => {
    console.log("Esperando sesión...")

    // 1. Intentar sesión existente
    const {
      data: { session: existingSession },
    } = await supabase.auth.getSession()

    console.log("GET SESSION:", existingSession)

if (!existingSession) {
  console.log("NO SESSION")
  return
}

const response = await fetch(`${API_URL}/user/sync`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: existingSession.user.email,
    name:
      existingSession.user.user_metadata.full_name ||
      existingSession.user.user_metadata.name ||
      existingSession.user.email?.split("@")[0],
  }),
})

if (!response.ok) {
  console.error("USER SYNC FAILED")
  setCheckingClub(false)
  return
}

const dbUser = await response.json()

console.log("DB USER:", dbUser)

setNeedsOnboarding(!dbUser.clubId)
setUserFromSession(existingSession)
setCheckingClub(false)

    // 2. Google volvió con tokens en el HASH
    const hash = window.location.hash

    console.log("OAUTH HASH:", hash ? "EXISTE" : "VACÍO")

    if (!hash) {
      console.log("NO SESSION")
      return
    }

    const params = new URLSearchParams(hash.substring(1))

    const accessToken = params.get("access_token")
    const refreshToken = params.get("refresh_token")

    console.log("ACCESS TOKEN:", accessToken ? "OK" : "NO")
    console.log("REFRESH TOKEN:", refreshToken ? "OK" : "NO")

    if (!accessToken || !refreshToken) {
      console.log("FALTAN TOKENS")
      return
    }

    console.log("CREANDO SESIÓN DESDE GOOGLE...")

    const {
      data,
      error,
    } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

    console.log("SET SESSION:", data)
    console.log("SET SESSION ERROR:", error)

    if (error) {
      console.error("ERROR CREANDO SESIÓN:", error)
      return
    }

    if (data.session) {
      console.log("SESIÓN CREADA CORRECTAMENTE")

      setUserFromSession(data.session)

      // Sacamos los tokens de la URL
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname
      )
    }
  }

  loadSession()

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    console.log("AUTH EVENT:", event)
    console.log("AUTH SESSION:", session)

    if (session) {
      setUserFromSession(session)
    }
  })

  fetch(`${API_URL}/property`)
    .then((r) => r.json())
    .then((data) => setProperties(data))

  fetch(`${API_URL}/insights`)
    .then((r) => r.json())
    .then((data) => setInsights(data || {}))
    .catch(() => setInsights({}))

  return () => {
    mounted = false
    subscription.unsubscribe()
  }
}, [])

const handleLogout = async () => {
  await supabase.auth.signOut()
  router.push("/")
}

  const getStatusColor = (status: string) => {
    if (status === "active") return "bg-green-100 text-green-800"
    return "bg-gray-100 text-gray-800"
  }

  const showPublishedAlert = searchParams.get("published")

if (!user || checkingClub) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-zinc-500">
        Cargando...
      </div>
    </div>
  )
}

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <img src="/casadata-logo.png" className="w-8 h-8" />
            <span className="font-bold text-xl">casaData</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/inmuebles">
              <Button variant="ghost" size="sm">
                <Home className="w-4 h-4 mr-2" />
                Ver inmuebles
              </Button>
            </Link>

            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback>
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{user.name}</span>
            </div>

            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
 {needsOnboarding && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
    {/* Fondo */}
    <div className="absolute inset-0 bg-black/20 backdrop-blur-md" />

    {/* Modal */}
    <div className="relative z-10 w-full max-w-6xl rounded-[28px] bg-white p-8 shadow-2xl md:p-10">

      {/* HEADER */}
      <div className="mb-10 text-center">

        <div className="mb-5 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
          Primer paso
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 md:text-5xl">
          Bienvenido, {user.name} 👋
        </h1>

        <p className="mt-5 text-lg text-zinc-500 md:text-xl">
          Elegí cómo querés comenzar:
        </p>

      </div>

      {/* OPTIONS */}
      <div className="grid gap-6 md:grid-cols-2">

        {/* CREAR CLUB */}
        <div className="flex min-h-[400px] flex-col items-center rounded-[24px] border border-emerald-200 bg-white p-8 text-center shadow-sm">

          <div className="mb-7 flex h-20 w-20 items-center justify-center rounded-[24px] bg-emerald-50 shadow-sm">
            <Building2 className="h-10 w-10 text-emerald-600" />
          </div>

          <h2 className="text-3xl font-bold text-zinc-800">
            Crear mi club
          </h2>

          <p className="mt-4 max-w-md text-base leading-7 text-zinc-500 md:text-lg">
            Creá el espacio desde donde vas a administrar productos,
            servicios, reservas y socios. En pocos minutos estará listo
            para comenzar.
          </p>

          <div className="mt-auto w-full max-w-md pt-8">
            <Button
              className="h-16 w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 text-base font-bold shadow-lg hover:from-emerald-700 hover:to-teal-600"
              onClick={() =>
                router.push("/dashboard/create-club")
              }
            >
              Empezar ahora →
            </Button>
          </div>

        </div>

        {/* DEMO */}
        <div className="flex min-h-[400px] flex-col items-center rounded-[24px] border border-emerald-200 bg-white p-8 text-center shadow-sm">

          <div className="mb-7 flex h-20 w-20 items-center justify-center rounded-[24px] bg-blue-50 shadow-sm">
            <Eye className="h-10 w-10 text-blue-600" />
          </div>

          <h2 className="text-3xl font-bold text-zinc-800">
            Explorar demostración
          </h2>

          <p className="mt-4 max-w-md text-base leading-7 text-zinc-500 md:text-lg">
            Explorá un club ya configurado y descubrí cómo funciona
            GrowCRM antes de crear el tuyo.
          </p>

          <div className="mt-auto w-full max-w-md pt-8">
            <Button
              variant="outline"
              className="h-16 w-full rounded-2xl border-blue-200 bg-white text-base font-bold text-zinc-700 hover:bg-blue-50 hover:text-blue-700"
              onClick={() => router.push("/dashboard/demo")}
            >
              Abrir demo →
            </Button>
          </div>

        </div>

      </div>

    </div>
  </div>
)}
     </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* ALERT */}
        {showPublishedAlert && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Publicación creada 🚀
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* SIDEBAR */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Mi cuenta</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {!user.freePublicationUsed && (
                  <div className="bg-emerald-50 border p-3 rounded-lg">
                    <Gift className="w-4 h-4 inline mr-2" />
                    Publicación gratis disponible
                  </div>
                )}

                {user.subscriptionType && (
                  <div className="bg-yellow-50 border p-3 rounded-lg">
                    <Crown className="w-4 h-4 inline mr-2" />
                    {user.subscriptionType}
                  </div>
                )}

                <Link href="/dashboard/publish">
                  <Button className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Publicar
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* MAIN */}
          <div className="lg:col-span-3 space-y-6">
            {/* KPI */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-gray-500">Propiedades</p>
                  <p className="text-xl font-bold">{properties.length}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-gray-500">Visitas</p>
                  <p className="text-xl font-bold">
                    {insights.totalVisits || 0}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-gray-500">Leads</p>
                  <p className="text-xl font-bold">
                    {insights.totalLeads || 0}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* LIST */}
            <Card>
              <CardHeader className="items-center text-center">
                <div>
                  <CardTitle>Mis propiedades</CardTitle>
                  <CardDescription className="mt-2 text-center text-base leading-7">
                    Rendimiento real
                  </CardDescription>
                </div>

                <Link href="/dashboard/publish">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva
                  </Button>
                </Link>
              </CardHeader>

              <CardContent>
                {properties.length === 0 ? (
                  <div className="text-center py-12">
                    <Home className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No tienes propiedades aún</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {properties.map((p) => (
                      <div
                        key={p.id}
                        className="border p-4 rounded-lg flex justify-between items-center"
                      >
                        <div>
                          <h4 className="font-medium">{p.title}</h4>
                          <p className="text-sm text-gray-500">
                            {p.location}
                          </p>

                          <div className="text-xs text-gray-500 mt-1">
                            👀 {p.visits?.length || 0} visitas · 💬{" "}
                            {p.leads?.length || 0} interesados
                          </div>

                          <Badge className={getStatusColor(p.status)}>
                            {p.status}
                          </Badge>
                        </div>

                      <div className="flex gap-2">
  {/* VER PUBLICO */}
  <Button
    size="sm"
    variant="ghost"
    onClick={() => router.push(`/inmueble/${p.id}`)}
  >
    <Eye className="w-4 h-4" />
  </Button>

  {/* 👉 NUEVO: DASHBOARD PROPIEDAD */}
  <Button
    size="sm"
    variant="ghost"
    onClick={() => router.push(`/dashboard/inmueble/${p.id}`)}
  >
    📊
  </Button>

  {/* EDIT */}
  <Button
    size="sm"
    variant="ghost"
    onClick={() => router.push(`/dashboard/edit/${p.id}`)}
  >
    <Edit className="w-4 h-4" />
  </Button>

  {/* DELETE */}
  <Button
    size="sm"
    variant="ghost"
    onClick={async () => {
      if (!confirm("¿Eliminar propiedad?")) return

      const res = await fetch(`${API_URL}/property/${p.id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        alert("Error al eliminar")
        return
      }

      setProperties((prev) =>
        prev.filter((x) => x.id !== p.id)
      )
    }}
  >
    <Trash2 className="w-4 h-4 text-red-500" />
  </Button>
</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
