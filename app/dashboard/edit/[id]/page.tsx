"use client"
export const runtime = "edge"
export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const API_URL = "https://growcrm-api-production.up.railway.app"

export default function EditPropertyPage() {
  const { id } = useParams()
  const router = useRouter()

  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/property/${id}`)
      .then((r) => r.json())
      .then((data) => setProperty(data))
  }, [id])

  const handleSave = async () => {
    setLoading(true)

    await fetch(`${API_URL}/property/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: property.title,
        location: property.location,
        price: property.price,
        description: property.description,
        image: property.image,
        images: property.images,
        features: property.features,
        agentName: property.agentName,
        agentPhone: property.agentPhone,
        status: property.status,
      }),
    })

    setLoading(false)
    router.push("/dashboard?updated=1")
  }

  if (!property) return <div className="p-8">Cargando...</div>

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-xl font-bold">Editar propiedad</h1>

      <Input value={property.title || ""} onChange={(e) => setProperty({ ...property, title: e.target.value })} placeholder="Título" />

      <Input value={property.location || ""} onChange={(e) => setProperty({ ...property, location: e.target.value })} placeholder="Ubicación" />

      <Input value={property.price || ""} onChange={(e) => setProperty({ ...property, price: Number(e.target.value) })} placeholder="Precio" />

      <Input value={property.description || ""} onChange={(e) => setProperty({ ...property, description: e.target.value })} placeholder="Descripción" />

      <Input value={property.image || ""} onChange={(e) => setProperty({ ...property, image: e.target.value })} placeholder="Imagen principal URL" />

      <Input
        value={(property.images || []).join(",")}
        onChange={(e) =>
          setProperty({
            ...property,
            images: e.target.value.split(","),
          })
        }
        placeholder="Imágenes (coma separadas)"
      />

      <Input
        value={(property.features || []).join(",")}
        onChange={(e) =>
          setProperty({
            ...property,
            features: e.target.value.split(","),
          })
        }
        placeholder="Features (coma separadas)"
      />

      <Input value={property.agentName || ""} onChange={(e) => setProperty({ ...property, agentName: e.target.value })} placeholder="Agente" />

      <Input value={property.agentPhone || ""} onChange={(e) => setProperty({ ...property, agentPhone: e.target.value })} placeholder="Teléfono" />

      <Button onClick={handleSave} className="w-full">
        {loading ? "Guardando..." : "Guardar cambios"}
      </Button>
    </div>
  )
}
