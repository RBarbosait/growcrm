"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowLeft,
  Bath,
  BedDouble,
  CalendarDays,
  Copy,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Ruler,
  X,
} from "lucide-react"

export const runtime = "edge"

const API_URL = "https://growcrm-api-production.up.railway.app"

// =========================
// 🔥 SEND SAFE (FIX REAL)
// =========================
function sendData(url: string, data: any) {
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    keepalive: true,
  })
}

function getSessionId() {
  if (typeof window === "undefined") return "server"

  let session = localStorage.getItem("session")

  if (!session) {
    session =
      crypto.randomUUID() +
      "_" +
      Math.floor(Date.now() / 1000000)

    localStorage.setItem("session", session)
  }

  return session
}

function getVisitorId() {
  if (typeof window === "undefined") return "server"

  let id = localStorage.getItem("visitorId")

  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem("visitorId", id)
  }

  return id
}

function formatPrice(value: any) {
  const num = Number(value)
  if (!Number.isFinite(num) || num <= 0) return null

  return new Intl.NumberFormat("es-UY", {
    maximumFractionDigits: 0,
  }).format(num)
}

function toStringArray(value: any) {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => String(item).trim())
    .filter(Boolean)
}

function normalizePhone(value: any) {
  let phone = String(value || "").replace(/\D/g, "")

  // 🔥 quitar 0 inicial (ej: 095...)
  if (phone.startsWith("0")) {
    phone = phone.substring(1)
  }

  // 🔥 asegurar prefijo Uruguay
  if (!phone.startsWith("598")) {
    phone = "598" + phone
  }

  return phone
}

export default function PropertyPage() {
  const params = useParams()
  const router = useRouter()
  const propertyId = params.id as string

  const [property, setProperty] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState("")
  const [contact, setContact] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [selectedImage, setSelectedImage] = useState("")
  const [showFullDescription, setShowFullDescription] = useState(false)

  const [pageLoading, setPageLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  const demoProperty = {
    title: "Alquiler Cordón 1 dorm balcón garage a estrenar",
    price: 30000,
    operationType: "Alquiler",
    address: "Avenida Uruguay 1500, Cordón, Montevideo",
    location: "Avenida Uruguay 1500, Cordón, Montevideo",
    bedrooms: 1,
    bathrooms: 1,
    area: 55.5,
    expenses: 4100,
    floor: "5to piso",
    parking: "Garage incluido",
    orientation: "Norte",
    code: "940051134-233",
    createdAt: new Date().toISOString(),
    description:
      "Apartamento a estrenar en Cordón Norte con balcón y garage. Excelente luminosidad, distribución cómoda y terminaciones modernas. Ideal para vivir o invertir.",
    highlights: [
      "A estrenar",
      "Balcón",
      "Garage",
      "Muy luminoso",
      "Excelente ubicación",
    ],
    services: [
      "Ascensor",
      "Seguridad",
      "Garaje",
      "Cerca de transporte",
      "Aire acondicionado",
      "Placares",
    ],
    extras: [
      "Acepta mascotas",
      "No amueblado",
      "Disponible de inmediato",
      "Gastos comunes: $4.100",
    ],
    image:
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
    ],
    agent: {
      name: "Rodrigo de la Boya",
      role: "Asesor inmobiliario",
      photo: "https://randomuser.me/api/portraits/women/44.jpg",
      phone: "59895083633",
      email: "rbarbosa@casadata.uy",
    },
  }

  const gallery: string[] = Array.from(
    new Set(
      [
        property?.image,
        ...(Array.isArray(property?.images) ? property.images : []),
        ...(demoProperty.images || []),
      ].filter(Boolean)
    )
  )

  const priceFormatted = formatPrice(property?.price ?? demoProperty.price)

  const highlights = toStringArray(
    property?.highlights ||
      property?.amenities ||
      property?.features ||
      demoProperty.highlights
  )

  const services = toStringArray(
    property?.services ||
      property?.serviceList ||
      demoProperty.services
  )

  const agent = {
    name:
      property?.agentName ||
      property?.agent?.name ||
      demoProperty.agent.name,

    role:
      property?.agentRole ||
      property?.agent?.role ||
      demoProperty.agent.role,

    photo:
      property?.agentPhoto ||
      property?.agent?.photo ||
      demoProperty.agent.photo,

    phone:
      property?.agentPhone ||
      property?.agent?.phone ||
      demoProperty.agent.phone,

    email:
      property?.agentEmail ||
      property?.agent?.email ||
      demoProperty.agent.email,
  }

  const extras = toStringArray(
    property?.extras ||
      property?.detailsList ||
      demoProperty.extras
  )

  const activeProperty = property || demoProperty
  const activeGallery = gallery.length > 0 ? gallery : demoProperty.images

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // =========================
  // LOAD PROPERTY
  // =========================
  useEffect(() => {
    let mounted = true

    setPageLoading(true)
    setProgress(0)

    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) return p
        if (p < 40) return p + 8
        if (p < 70) return p + 4
        return p + 2
      })
    }, 120)

    fetch(`${API_URL}/property/${propertyId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed")
        return r.json()
      })
      .then((data) => {
        if (!mounted) return
        setProperty(data)
      })
      .catch(() => {
        if (!mounted) return
        setProperty(demoProperty)
      })
      .finally(() => {
        if (!mounted) return

        setTimeout(() => {
          setProgress(100)

          setTimeout(() => {
            if (!mounted) return
            setPageLoading(false)
          }, 200)
        }, 200)
      })

    return () => {
      mounted = false
      clearInterval(timer)
    }
  }, [propertyId])

  useEffect(() => {
    if (gallery.length > 0) {
      setSelectedImage(gallery[0])
    } else if (demoProperty.image) {
      setSelectedImage(demoProperty.image)
    }
  }, [propertyId, property?.image, property?.images])

  // =========================
  // VISIT TRACK
  // =========================
  useEffect(() => {
    if (!property) return
    const sessionId = getSessionId()
    const visitorId = getVisitorId()
    const key = `last_visit_${propertyId}_${sessionId}`
    const lastVisit = Number(localStorage.getItem(key) || 0)

    if (!lastVisit || Date.now() - lastVisit > 15000) {
      localStorage.setItem(key, String(Date.now()))

      sendData(`${API_URL}/track`, {
        propertyId,
        source:
          new URLSearchParams(window.location.search).get("src") || "web",
        sessionId,
        visitorId,
      })
    }

    const timer = window.setTimeout(() => setShowModal(true), 1500)

    return () => window.clearTimeout(timer)
  }, [property, propertyId])

  // =========================
  // 🔥 TIME TRACK (PRO)
  // =========================
  useEffect(() => {
    if (!propertyId) return

    const sessionId = getSessionId()
    const visitorId = getVisitorId()
    let last = Date.now()

    const interval = setInterval(() => {
      if (document.hidden) return

      const now = Date.now()
      const delta = now - last
      last = now

      if (delta < 500) return

      sendData(`${API_URL}/track-time`, {
        propertyId,
        sessionId,
        timeSpent: delta,
        visitorId,
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [propertyId])

  // =========================
  // 🔥 REACH TRACK
  // =========================
  useEffect(() => {
    if (!propertyId) return

    const sessionId = getSessionId()
    const visitorId = getVisitorId()
    const sections = ["hero", "details", "location", "features", "contact"]
    const seen = new Set<string>()

    let timeout: any

    const send = () => {
      sendData(`${API_URL}/track-reach`, {
        propertyId,
        sessionId,
        visitorId,
        sections: Array.from(seen),
      })
    }

    const onScroll = () => {
      let changed = false

      sections.forEach((id) => {
        const el = document.getElementById(id)
        if (!el) return

        const rect = el.getBoundingClientRect()

        if (rect.height === 0) return

        const visiblePx =
          Math.min(rect.bottom, window.innerHeight) -
          Math.max(rect.top, 0)

        const visibleRatio = visiblePx / rect.height

        if (visibleRatio > 0.4) {
          if (!seen.has(id)) {
            seen.add(id)
            changed = true
          }
        }
      })

      if (changed) {
        clearTimeout(timeout)
        timeout = setTimeout(send, 800)
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true })

    setTimeout(onScroll, 300)

    return () => {
      window.removeEventListener("scroll", onScroll)
      clearTimeout(timeout)
    }
  }, [propertyId])

  // =========================
  // CONTACT TRACK
  // =========================
  const trackContact = () => {
    sendData(`${API_URL}/track-reach`, {
      propertyId,
      sessionId: getSessionId(),
      visitorId: getVisitorId(),
      sections: ["contact"],
    })
  }

  // =========================
  // LEADS
  // =========================
  const handleSubmitLead = async () => {
    const safeName = name.trim()
    const safeContact = contact.trim()

    if (!safeName || !safeContact) return

    trackContact()
    setLoading(true)

    await fetch(`${API_URL}/lead`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        propertyId,
        type: "form",
        name: safeName,
        contact: safeContact,
        sessionId: getSessionId(),
        visitorId: getVisitorId(),
      }),
    })

    setLoading(false)
    setSent(true)
  }

  const handleWhatsApp = async () => {
  if (!agent.phone) return

  const phone = normalizePhone(agent.phone)

  // 🔥 URL ACTUAL DEL INMUEBLE
  const propertyUrl =
    typeof window !== "undefined" ? window.location.href : ""

  // 🔥 MENSAJE
  const message = `Hola, estoy viendo este inmueble en casaData: ${propertyUrl} y me gustaría recibir más información.`

  // 🔥 ENCODE
  const encodedMessage = encodeURIComponent(message)

  const url = `https://wa.me/${phone}?text=${encodedMessage}`

  trackContact()

  fetch(`${API_URL}/lead`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      propertyId,
      type: "whatsapp",
      sessionId: getSessionId(),
      visitorId: getVisitorId(),
    }),
  }).catch(() => {})

  // 🔥 IMPORTANTE → esto evita bloqueos en mobile
  window.location.href = url
}

  const handleEmail = async () => {
    if (!agent.email) return

    trackContact()

    await fetch(`${API_URL}/lead`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        propertyId,
        type: "form",
        sessionId: getSessionId(),
        visitorId: getVisitorId(),
      }),
    })

    window.location.href = `mailto:${agent.email}`
  }

  const copyPropertyLink = async () => {
    if (typeof window === "undefined") return
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  // =========================
  // UI
  // =========================
  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="w-full max-w-md space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">
              Cargando propiedad...
            </p>
            <p className="text-sm font-semibold text-gray-900">
              {Math.round(progress)}%
            </p>
          </div>

          <div className="h-3 w-full rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Preparando ficha
          </p>
        </div>
      </div>
    )
  }

  const quickFacts: Array<{
    label: string
    value: string
    icon: any
  }> = [
    activeProperty.operationType
      ? {
          label: "Operación",
          value: activeProperty.operationType,
          icon: CalendarDays,
        }
      : null,
    priceFormatted
      ? { label: "Precio", value: `$${priceFormatted}`, icon: CalendarDays }
      : null,
    activeProperty.bedrooms
      ? {
          label: "Dormitorios",
          value: String(activeProperty.bedrooms),
          icon: BedDouble,
        }
      : null,
    activeProperty.bathrooms
      ? {
          label: "Baños",
          value: String(activeProperty.bathrooms),
          icon: Bath,
        }
      : null,
    activeProperty.area
      ? {
          label: "Superficie",
          value: `${activeProperty.area} m²`,
          icon: Ruler,
        }
      : null,
  ].filter(Boolean) as any

  const displayHighlights = highlights.length
    ? highlights
    : toStringArray(activeProperty.highlights || demoProperty.highlights)

  const displayServices = services.length
    ? services
    : toStringArray(activeProperty.services || demoProperty.services)

  const displayExtras = extras.length
    ? extras
    : toStringArray(activeProperty.extras || demoProperty.extras)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* TOP BAR */}
      <div className="border-b bg-white/90 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <button
            onClick={() => router.push("/inmuebles")}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-black"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>

          <button
            onClick={copyPropertyLink}
            className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg border bg-white hover:bg-gray-50"
          >
            <Copy className="w-4 h-4" />
            {copied ? "Copiado" : "Compartir"}
          </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-6 md:py-8 pb-36 lg:pb-24">
        <div className="grid lg:grid-cols-[minmax(0,1.55fr)_380px] gap-8 items-start">
          {/* LEFT */}
          <div className="space-y-6">
            {/* TITLE / CONTEXT */}
            <section className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wider text-gray-500">
                <span>Ficha del inmueble</span>
                {activeProperty.operationType && (
                  <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                    {activeProperty.operationType}
                  </span>
                )}
                {activeProperty.code && (
                  <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                    Código {activeProperty.code}
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900">
                {activeProperty.title}
              </h1>

              {priceFormatted && (
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-3xl md:text-4xl font-bold text-gray-900">
                    ${priceFormatted}
                  </p>

                  {activeProperty.operationType && (
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                      {activeProperty.operationType}
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-start gap-2 text-gray-600">
                <MapPin className="w-4 h-4 mt-1 shrink-0" />
                <p className="text-sm md:text-base">
                  {activeProperty.address || activeProperty.location}
                </p>
              </div>
            </section>

            {/* HERO */}
            <section id="hero">
              <Card className="overflow-hidden shadow-sm">
                <div className="relative">
                  <img
                    src={selectedImage || activeProperty.image}
                    alt={activeProperty.title}
                    className="w-full aspect-[16/11] object-cover"
                  />

                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    {activeProperty.operationType && (
                      <span className="rounded-full bg-black/70 text-white px-3 py-1 text-xs backdrop-blur">
                        {activeProperty.operationType}
                      </span>
                    )}

                    {priceFormatted && (
                      <span className="rounded-full bg-white/90 text-gray-900 px-3 py-1 text-xs font-medium">
                        ${priceFormatted}
                      </span>
                    )}
                  </div>
                </div>

                {activeGallery.length > 1 && (
                  <div className="p-4 border-t bg-white">
                    <div className="flex gap-3 overflow-x-auto pb-1">
                      {activeGallery.map((img: string, idx: number) => (
                        <button
                          key={`${img}-${idx}`}
                          onClick={() => setSelectedImage(img)}
                          className={`shrink-0 rounded-lg overflow-hidden border-2 transition ${
                            selectedImage === img
                              ? "border-gray-900"
                              : "border-transparent opacity-70 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={img}
                            alt={`${activeProperty.title} ${idx + 1}`}
                            className="w-24 h-16 object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </section>

            {/* QUICK FACTS */}
            {quickFacts.length > 0 && (
              <section>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {quickFacts.map((fact) => {
                    const Icon = fact.icon
                    return (
                      <div
                        key={fact.label}
                        className="rounded-xl border bg-white p-4 shadow-sm hover:shadow-md transition"
                      >
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                          <Icon className="w-4 h-4" />
                          <span>{fact.label}</span>
                        </div>
                        <p className="font-medium text-gray-900">
                          {fact.value}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {/* DETAILS */}
            <section id="details">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Detalles clave</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  {activeProperty.createdAt && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <CalendarDays className="w-4 h-4" />
                      <span>
                        Publicado{" "}
                        {new Date(activeProperty.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-3">
                    {activeProperty.floor && (
                      <div className="rounded-xl bg-gray-50 border p-4">
                        <p className="text-sm font-medium text-gray-900">Piso</p>
                        <p className="text-sm text-gray-700 mt-1">
                          {activeProperty.floor}
                        </p>
                      </div>
                    )}

                    {activeProperty.expenses && (
                      <div className="rounded-xl bg-gray-50 border p-4">
                        <p className="text-sm font-medium text-gray-900">
                          Gastos comunes
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                          ${activeProperty.expenses}
                        </p>
                      </div>
                    )}

                    {activeProperty.parking && (
                      <div className="rounded-xl bg-gray-50 border p-4">
                        <p className="text-sm font-medium text-gray-900">
                          Garage
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                          {activeProperty.parking}
                        </p>
                      </div>
                    )}

                    {activeProperty.orientation && (
                      <div className="rounded-xl bg-gray-50 border p-4">
                        <p className="text-sm font-medium text-gray-900">
                          Orientación
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                          {activeProperty.orientation}
                        </p>
                      </div>
                    )}

                    {activeProperty.code && (
                      <div className="rounded-xl bg-gray-50 border p-4">
                        <p className="text-sm font-medium text-gray-900">
                          Código de publicación
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                          {activeProperty.code}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* LOCATION */}
            <section id="location">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Ubicación</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="text-gray-700 text-sm md:text-base">
                    {activeProperty.address || activeProperty.location}
                  </div>

                  <div className="rounded-2xl overflow-hidden border bg-white h-64">
                    <iframe
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://www.google.com/maps?q=${encodeURIComponent(
                        activeProperty.address || activeProperty.location
                      )}&output=embed`}
                    />
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* DESCRIPTION */}
            <section id="features">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Descripción</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  {activeProperty.description ? (
                    <>
                      <p
                        className={`text-gray-700 leading-relaxed whitespace-pre-line text-[15px] ${
                          showFullDescription ? "" : "line-clamp-4"
                        }`}
                      >
                        {activeProperty.description}
                      </p>

                      <button
                        onClick={() => setShowFullDescription((v) => !v)}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900 hover:underline"
                      >
                        {showFullDescription ? "Ver menos" : "Ver más"} +
                      </button>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Aún no hay descripción cargada.
                    </p>
                  )}

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="rounded-xl bg-green-50 border border-green-100 p-4">
                      <p className="text-sm font-medium text-green-900">
                        Vista rápida
                      </p>
                      <p className="text-sm text-green-800 mt-1">
                        La información clave está arriba; esta sección ayuda a
                        vender mejor la intención.
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 border p-4">
                      <p className="text-sm font-medium text-slate-900">
                        Siguiente paso
                      </p>
                      <p className="text-sm text-slate-700 mt-1">
                        Abrí contacto, dejá datos o continuá navegando.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* HIGHLIGHTS */}
            {displayHighlights.length > 0 && (
              <section>
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle>Características destacadas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {displayHighlights.map((item) => (
                        <span
                          key={item}
                          className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </section>
            )}

            {/* SERVICES */}
            {displayServices.length > 0 && (
              <section>
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle>Amenities / servicios</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {displayServices.map((item) => (
                        <div
                          key={item}
                          className="rounded-xl border bg-white px-3 py-2 text-sm text-gray-700"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </section>
            )}

            {/* EXTRAS */}
            {displayExtras.length > 0 && (
              <section>
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle>Información adicional</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-2">
                      {displayExtras.map((item) => (
                        <div
                          key={item}
                          className="rounded-xl border bg-gray-50 px-3 py-2 text-sm text-gray-700"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </section>
            )}
          </div>

          {/* RIGHT / CONTACT */}
          <div id="contact" className="lg:sticky lg:top-24 space-y-4">
            <Card className="shadow-sm border-2 border-slate-200">
              <CardHeader>
                <CardTitle>Contacto</CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                {agent.phone && (
                  <>
                    {/* AGENTE */}
                    <div className="flex items-center gap-3 mb-4">
                      <img
                        src={agent.photo}
                        className="w-12 h-12 rounded-full object-cover border"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{agent.name}</p>
                        <p className="text-sm text-gray-500">{agent.role}</p>
                        <p className="text-xs text-green-600 font-medium">
                          ● Responde en minutos
                        </p>
                      </div>
                    </div>

                    {/* WHATSAPP */}
                    <Button
                      onClick={handleWhatsApp}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-base font-medium"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>

                    {/* LLAMAR */}
                    <Button
                      onClick={() => {
                        const phone = normalizePhone(agent.phone)
                        window.location.href = `tel:${phone}`
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Llamar
                    </Button>
                  </>
                )}

                {agent.email && (
                  <Button
                    onClick={handleEmail}
                    variant="outline"
                    className="w-full"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                )}

                <Button
                  onClick={() => setShowModal(true)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                >
                  Dejar datos
                </Button>

                <button
                  onClick={copyPropertyLink}
                  className="w-full text-sm text-gray-600 hover:text-black inline-flex items-center justify-center gap-2 py-2"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? "Enlace copiado" : "Copiar enlace"}
                </button>

                <div className="rounded-xl bg-slate-50 border p-4 text-sm text-slate-700">
                  <p className="font-medium text-slate-900">Respuesta rápida</p>
                  <p className="mt-1">
                    Dejá tu email o celular y te contactamos. El mismo input acepta cualquiera de los dos.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Resumen de la ficha</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-700">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Título</span>
                  <span className="text-right font-medium">
                    {activeProperty.title}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Ubicación</span>
                  <span className="text-right font-medium">
                    {activeProperty.address || activeProperty.location}
                  </span>
                </div>
                {priceFormatted && (
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Precio</span>
                    <span className="text-right font-medium">
                      ${priceFormatted}
                    </span>
                  </div>
                )}
                {activeProperty.operationType && (
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Operación</span>
                    <span className="text-right font-medium">
                      {activeProperty.operationType}
                    </span>
                  </div>
                )}
                {activeProperty.code && (
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Código</span>
                    <span className="text-right font-medium">
                      {activeProperty.code}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* MOBILE STICKY BAR */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white shadow-lg p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] flex gap-2 lg:hidden"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
      >
        {agent.phone && (
          <button
            onClick={handleWhatsApp}
            className="flex-1 rounded-xl bg-green-600 text-white py-3 text-sm font-medium"
          >
            WhatsApp
          </button>
        )}

        {agent.phone && (
          <button
            onClick={() => {
              const phone = normalizePhone(agent.phone)
              window.location.href = `tel:${phone}`
            }}
            className="flex-1 rounded-xl border py-3 text-sm font-medium"
          >
            Llamar
          </button>
        )}

        <button
          onClick={() => setShowModal(true)}
          className="flex-1 rounded-xl bg-slate-900 text-white py-3 text-sm font-medium"
        >
          Contactar
        </button>
      </div>

      {/* MODAL */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 p-3"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white w-full max-w-md rounded-2xl p-6 relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>

            {!sent ? (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold">Dejá tus datos</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Podés dejar tu email o tu celular en el mismo campo.
                  </p>
                </div>

                <input
                  className="w-full border rounded-xl p-3"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nombre"
                />

                <input
                  className="w-full border rounded-xl p-3"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Email o celular"
                />

                <Button
                  onClick={handleSubmitLead}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                >
                  {loading ? "Enviando..." : "Enviar"}
                </Button>
              </div>
            ) : (
              <div className="py-8 text-center space-y-3">
                <p className="text-2xl">✅</p>
                <h2 className="text-xl font-semibold">Enviado</h2>
                <p className="text-sm text-gray-500">
                  Ya recibimos tus datos.
                </p>
                <Button
                  onClick={() => setShowModal(false)}
                  variant="outline"
                  className="mt-2"
                >
                  Cerrar
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
