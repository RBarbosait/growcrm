"use client"

import { useEffect, useRef, useState } from "react"
import { Camera, ImagePlus, LoaderCircle } from "lucide-react"

const CLOUD_NAME = "dvlfzrpeq"
const UPLOAD_PRESET = "casadata"
const MAX_IMAGE_SIZE = 10 * 1024 * 1024

export default function ProductImageField({
  value,
  onChange,
}: {
  value: string
  onChange: (url: string) => void
}) {
  const galleryInput = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraError, setCameraError] = useState("")
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!cameraOpen) return

    let cancelled = false
    let stream: MediaStream | null = null

    async function startCamera() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Tu navegador no permite acceder a la cámara desde esta página.")
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        })

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
      } catch (cameraAccessError) {
        if (!cancelled) {
          setCameraError(
            cameraAccessError instanceof Error && cameraAccessError.name === "NotAllowedError"
              ? "No se autorizó el acceso a la cámara. Revisá los permisos del navegador."
              : cameraAccessError instanceof Error
                ? cameraAccessError.message
                : "No se pudo activar la cámara."
          )
        }
      }
    }

    void startCamera()
    return () => {
      cancelled = true
      stream?.getTracks().forEach((track) => track.stop())
      if (videoRef.current) videoRef.current.srcObject = null
    }
  }, [cameraOpen])

  async function upload(file?: File) {
    if (!file) return
    setError("")

    if (!file.type.startsWith("image/")) {
      setError("Elegí un archivo de imagen.")
      return
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError("La imagen debe pesar menos de 10 MB.")
      return
    }

    setUploading(true)
    try {
      const body = new FormData()
      body.append("file", file)
      body.append("upload_preset", UPLOAD_PRESET)
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body,
      })
      const result = await response.json().catch(() => null)
      if (!response.ok || typeof result?.secure_url !== "string") {
        throw new Error("No se pudo subir la imagen. Probá de nuevo.")
      }
      onChange(result.secure_url)
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "No se pudo subir la imagen.")
    } finally {
      setUploading(false)
    }
  }

  async function capturePhoto() {
    const video = videoRef.current
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      setCameraError("La cámara todavía no está lista. Esperá un momento y volvé a intentar.")
      return
    }

    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height)
    const image = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9))
    if (!image) {
      setCameraError("No se pudo capturar la foto. Volvé a intentar.")
      return
    }

    setCameraOpen(false)
    await upload(new File([image], `producto-${Date.now()}.jpg`, { type: "image/jpeg" }))
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="h-28 w-full shrink-0 overflow-hidden rounded-2xl bg-zinc-100 sm:h-28 sm:w-36">
          {value ? <img src={value} alt="Vista previa del producto" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-zinc-400"><ImagePlus className="h-8 w-8" /></div>}
        </div>
        <div className="flex flex-1 flex-wrap gap-2">
          <button type="button" disabled={uploading} onClick={() => galleryInput.current?.click()} className="inline-flex h-10 items-center gap-2 rounded-xl border border-zinc-200 px-3 text-sm font-semibold text-zinc-700 transition hover:border-emerald-300 hover:bg-emerald-50 disabled:opacity-50"><ImagePlus className="h-4 w-4 text-emerald-700" />Elegir foto</button>
          <button type="button" disabled={uploading} onClick={() => { setCameraError(""); setCameraOpen(true) }} className="inline-flex h-10 items-center gap-2 rounded-xl border border-zinc-200 px-3 text-sm font-semibold text-zinc-700 transition hover:border-emerald-300 hover:bg-emerald-50 disabled:opacity-50"><Camera className="h-4 w-4 text-emerald-700" />Tomar foto</button>
          {uploading && <span role="status" className="inline-flex items-center gap-2 px-2 text-sm text-zinc-500"><LoaderCircle className="h-4 w-4 animate-spin" />Subiendo…</span>}
        </div>
      </div>

      <input ref={galleryInput} type="file" accept="image/*" className="hidden" onChange={(event) => { void upload(event.target.files?.[0]); event.currentTarget.value = "" }} />

      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <p className="text-xs text-zinc-400">Formatos de imagen, hasta 10 MB. En el celular podés elegir una foto o usar la cámara.</p>

      {cameraOpen && <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-label="Tomar foto del producto">
        <div className="w-full max-w-2xl rounded-2xl bg-white p-4 shadow-2xl sm:p-6">
          <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold text-zinc-900">Tomar foto del producto</h2><button type="button" onClick={() => setCameraOpen(false)} className="rounded-lg px-3 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-100">Cerrar</button></div>
          <video ref={videoRef} autoPlay muted playsInline className="aspect-video w-full rounded-xl bg-black object-cover" />
          {cameraError && <p role="alert" className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">{cameraError}</p>}
          <button type="button" disabled={Boolean(cameraError) || uploading} onClick={() => void capturePhoto()} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 py-3 font-semibold text-white hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50">{uploading ? <><LoaderCircle className="h-4 w-4 animate-spin" />Subiendo…</> : <><Camera className="h-4 w-4" />Capturar foto</>}</button>
        </div>
      </div>}
    </div>
  )
}
