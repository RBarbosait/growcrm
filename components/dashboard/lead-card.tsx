"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

function formatRelativeTime(date: Date) {
  const diff = (Date.now() - date.getTime()) / 1000

  if (diff < 60) return "ahora"
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`

  return `${Math.floor(diff / 86400)}d`
}
export default function LeadCard({ lead }: any) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const isNew = !lead.seen
  const createdAt = new Date(lead.createdAt)

  // 🔥 detectar tipo de contacto
  const rawContact = lead.contact || ""
  const isEmail = rawContact.includes("@")
  const isPhone = !isEmail && rawContact.replace(/\D/g, "").length >= 7

  // 🔥 acciones
  const markAsSeen = async () => {
    await fetch(
      `https://growcrm-api-production.up.railway.app/lead/${lead.id}/seen`,
      { method: "PATCH" }
    )

    setOpen(false)
    router.refresh()
  }

  const openWhatsApp = () => {
    if (!isPhone) return
    const phone = rawContact.replace(/\D/g, "")
    window.open(`https://wa.me/${phone}`, "_blank")
  }

  const callUser = () => {
    if (!isPhone) return
    window.location.href = `tel:${rawContact}`
  }

  const sendEmail = () => {
    if (!isEmail) return
    window.location.href = `mailto:${rawContact}`
  }

  const copyContact = async () => {
    if (!rawContact) return
    await navigator.clipboard.writeText(rawContact)
  }
    const isHot = lead.type === "whatsapp"
  return (

    <>
      {/* CARD */}
 
    <div
  onClick={() => setOpen(true)}
  className={`p-4 border rounded-xl flex justify-between items-center cursor-pointer transition ${
    isHot
      ? "border-orange-400 bg-orange-50"
      : isNew
      ? "border-green-400 bg-green-50"
      : "bg-white hover:bg-gray-50"
  }`}
>
  {/* LEFT */}
  <div className="min-w-0">
    
    {/* TOP ROW */}
    <div className="flex items-center gap-2 mb-1">
      <span className="text-sm font-medium text-gray-900">
        {lead.type === "whatsapp" ? "WhatsApp" : "Formulario"}
      </span>

      {isNew && (
        <span className="text-[10px] px-2 py-0.5 rounded bg-green-200 text-green-800">
          Nuevo
        </span>
      )}

      {isHot && (
        <span className="text-[10px] px-2 py-0.5 rounded bg-orange-200 text-orange-800">
          🔥
        </span>
      )}
    </div>

    {/* CONTACT (principal) */}
    <p className="text-sm text-gray-800 truncate">
      {isEmail
        ? rawContact
        : rawContact.replace(/\d(?=\d{2})/g, "*")}
    </p>

    {/* META */}
    <p className="text-xs text-gray-400">
      {formatRelativeTime(createdAt)}
    </p>
  </div>

  {/* ACTION */}
  <div className="flex-shrink-0">
    {isPhone && (
      <button
        onClick={(e) => {
          e.stopPropagation()
          openWhatsApp()
        }}
        className="text-xs bg-green-600 text-white px-3 py-1.5 rounded"
      >
        WhatsApp
      </button>
    )}

    {isEmail && (
      <button
        onClick={(e) => {
          e.stopPropagation()
          sendEmail()
        }}
        className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded"
      >
        Email
      </button>
    )}
  </div>
</div>
    

    


      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-50">
          <div className="bg-white w-full md:max-w-md rounded-t-xl md:rounded-xl p-6 space-y-4">

            <h2 className="text-lg font-semibold">
              {lead.type === "whatsapp" ? "WhatsApp" : "Formulario"}
            </h2>

            {lead.name && <p><strong>Nombre:</strong> {lead.name}</p>}
            {lead.contact && <p><strong>Contacto:</strong> {lead.contact}</p>}

            <p className="text-sm text-gray-500">
              {createdAt.toLocaleString()}
            </p>

            {/* 🔥 ACCIONES DINÁMICAS */}
            <div className="grid grid-cols-3 gap-2 pt-2">

              {isPhone && (
                <>
                  <button
                    onClick={openWhatsApp}
                    className="bg-green-600 text-white py-2 rounded text-sm"
                  >
                    WhatsApp
                  </button>

                  <button
                    onClick={callUser}
                    className="bg-blue-600 text-white py-2 rounded text-sm"
                  >
                    Llamar
                  </button>
                </>
              )}

              {isEmail && (
                <button
                  onClick={sendEmail}
                  className="bg-purple-600 text-white py-2 rounded text-sm col-span-2"
                >
                  Email
                </button>
              )}

              <button
                onClick={copyContact}
                className="bg-gray-200 py-2 rounded text-sm"
              >
                Copiar
              </button>

            </div>

            {/* FOOTER */}
            <div className="flex justify-between pt-4">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 border rounded"
              >
                Cerrar
              </button>

              {isNew && (
                <button
                  onClick={markAsSeen}
                  className="px-4 py-2 bg-green-600 text-white rounded"
                >
                  Marcar visto
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  )
}
