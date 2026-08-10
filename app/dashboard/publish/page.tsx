"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import type React from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

const API_URL = "https://growcrm-api-production.up.railway.app"

// 🔥 CONFIG CLOUDINARY
const CLOUD_NAME = "dvlfzrpeq"
const UPLOAD_PRESET = "casadata"

interface User {
  email: string
  name: string
  phone?: string
  freePublicationUsed: boolean
  subscriptionType: string | null
}

export default function PublishPage() {
  const [user, setUser] = useState<User | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    address: "",
    description: "",
    contact: "",
    operation: "Venta",
    price: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    features: "",
  })

  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // =========================
  // USER
  // =========================
useEffect(() => {
  const test = async () => {
    console.log("URL COMPLETA:", window.location.href)
    console.log("HASH:", window.location.hash)

    const result = await supabase.auth.exchangeCodeForSession(window.location.href)

    console.log("exchangeCodeForSession", result)

    const session = await supabase.auth.getSession()

    console.log("SESSION", session)
  }

  test()
}, [])
useEffect(() => {
  const loadUser = async () => {
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
      phone: "",
      freePublicationUsed: false,
      subscriptionType: null,
    })
  }

  loadUser()
}, [router])

  // =========================
  // IMAGE SELECT (MULTI)
  // =========================
  const handleImages = (selectedFiles: FileList) => {
    const newFiles = Array.from(selectedFiles).filter((f) =>
      f.type.startsWith("image/")
    )

    setFiles((prev) => [...prev, ...newFiles])

    const newPreviews = newFiles.map((file) =>
      URL.createObjectURL(file)
    )

    setPreviews((prev) => [...prev, ...newPreviews])
  }

  const removeImage = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  // =========================
  // CLOUDINARY UPLOAD
  // =========================
  const uploadImage = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("upload_preset", UPLOAD_PRESET)

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      )

      const data = await res.json()

      console.log("🔥 CLOUDINARY:", data)

      if (!data.secure_url) {
        throw new Error("Cloudinary upload failed")
      }

      return data.secure_url
    } catch (err) {
      console.error("❌ Upload error:", err)
      return null
    }
  }

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)

    try {
      console.log("🚀 START SUBMIT")

      // 🔥 subir imágenes
      const uploadedImagesRaw = await Promise.all(
        files.map((file) => uploadImage(file))
      )

      const uploadedImages = uploadedImagesRaw.filter(Boolean) as string[]

      console.log("📸 IMAGES:", uploadedImages)

      const mainImage =
        uploadedImages[0] ||
        "https://images.unsplash.com/photo-1560185007-cde436f6a4d0"

      // 🔥 REQUEST
      const payload = {
        title: formData.title,
        address: formData.address,
        description: formData.description,

        image: mainImage,
        images: uploadedImages,

        operationType: formData.operation,
        price: Number(formData.price) || null,
        bedrooms: Number(formData.bedrooms) || null,
        bathrooms: Number(formData.bathrooms) || null,
        area: Number(formData.area) || null,

        features: formData.features
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean),

        agentName: user.name,
        agentPhone: formData.contact,

        source: "user",
        status: "active",
      }

      console.log("📦 PAYLOAD:", payload)

      const res = await fetch(`${API_URL}/property`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      console.log("📡 RESPONSE STATUS:", res.status)

      if (!res.ok) {
        const text = await res.text()
        console.error("❌ BACKEND ERROR:", text)
        throw new Error("Backend error")
      }

      const newProperty = await res.json()

      console.log("✅ CREATED PROPERTY:", newProperty)

      if (!newProperty?.id) {
        throw new Error("No ID returned")
      }

      router.push(`/inmueble/${newProperty.id}`)

    } catch (err) {
      console.error("❌ SUBMIT ERROR:", err)
      alert("Error al publicar. Revisá consola.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-6">

        <Card>
          <CardHeader>
            <CardTitle>Nueva propiedad</CardTitle>
            <CardDescription>
              Publicá con imágenes reales 🚀
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">

              <Input
                placeholder="Título"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />

              <Input
                placeholder="Dirección"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                required
              />

              <Input
                placeholder="Precio"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />

              <div className="grid grid-cols-3 gap-2">
                <Input
                  placeholder="Dormitorios"
                  value={formData.bedrooms}
                  onChange={(e) =>
                    setFormData({ ...formData, bedrooms: e.target.value })
                  }
                />
                <Input
                  placeholder="Baños"
                  value={formData.bathrooms}
                  onChange={(e) =>
                    setFormData({ ...formData, bathrooms: e.target.value })
                  }
                />
                <Input
                  placeholder="m²"
                  value={formData.area}
                  onChange={(e) =>
                    setFormData({ ...formData, area: e.target.value })
                  }
                />
              </div>

              <Textarea
                placeholder="Descripción"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />

              <Input
                placeholder="Características (coma separadas)"
                value={formData.features}
                onChange={(e) =>
                  setFormData({ ...formData, features: e.target.value })
                }
              />

              <Input
                placeholder="Teléfono o WhatsApp"
                value={formData.contact}
                onChange={(e) =>
                  setFormData({ ...formData, contact: e.target.value })
                }
                required
              />

              {/* 🔥 MULTI IMAGE */}
              <div>
                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  onChange={(e) =>
                    e.target.files && handleImages(e.target.files)
                  }
                />

                <div className="grid grid-cols-3 gap-2 mt-3">
                  {previews.map((src, i) => (
                    <div key={i} className="relative">
                      <img
                        src={src}
                        className="h-24 w-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 bg-black/70 text-white text-xs px-1 rounded"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Publicando..." : "Publicar"}
              </Button>

            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
