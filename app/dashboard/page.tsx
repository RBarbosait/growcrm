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

  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
 const loadSession = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    router.push("/auth/login")
    return
  }

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

loadSession()

    fetch(`${API_URL}/property`)
      .then((r) => r.json())
      .then((data) => setProperties(data))

    fetch(`${API_URL}/insights`)
      .then((r) => r.json())
      .then((data) => setInsights(data || {}))
      .catch(() => setInsights({}))
  }, [router])

const handleLogout = async () => {
  await supabase.auth.signOut()
  router.push("/")
}

  const getStatusColor = (status: string) => {
    if (status === "active") return "bg-green-100 text-green-800"
    return "bg-gray-100 text-gray-800"
  }

  const showPublishedAlert = searchParams.get("published")

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Cargando...
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
              <CardHeader className="flex justify-between flex-row items-center">
                <div>
                  <CardTitle>Mis propiedades</CardTitle>
                  <CardDescription>
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
