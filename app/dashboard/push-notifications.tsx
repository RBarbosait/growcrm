"use client"

import { useEffect, useState } from "react"
import { Bell, BellRing, X } from "lucide-react"
import { supabase } from "@/lib/supabase"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://growcrm-api-production.up.railway.app"

function decodeKey(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/")
  const binary = window.atob(normalized)
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

export default function PushNotifications() {
  const [supported, setSupported] = useState(false)
  const [enabled, setEnabled] = useState(false)
  const [working, setWorking] = useState(false)
  const [message, setMessage] = useState("")
  const [collapsed, setCollapsed] = useState(true)

  useEffect(() => {
    const available = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window
    setSupported(available)
    if (!available) return
    void navigator.serviceWorker.register("/push-sw.js", { scope: "/" }).then(async (registration) => {
      const subscription = await registration.pushManager.getSubscription()
      setEnabled(Boolean(subscription))
      setCollapsed(Boolean(subscription))
    }).catch((error) => console.error("PUSH SERVICE WORKER ERROR:", error))
  }, [])

  async function togglePush() {
    setWorking(true)
    setMessage("")
    try {
      let permission: NotificationPermission = Notification.permission
      if (!enabled) {
        const standalone = window.matchMedia("(display-mode: standalone)").matches || ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
        const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
        if (isIOS && !standalone) throw new Error("En iPhone: agregá GrowCRM a Inicio y abrilo desde ese ícono para activar push.")
        if (permission !== "granted") permission = await Notification.requestPermission()
        if (permission !== "granted") throw new Error("Permití las notificaciones del navegador para recibir avisos.")
      }
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error("Iniciá sesión para configurar las notificaciones.")
      const registration = await navigator.serviceWorker.ready
      const current = await registration.pushManager.getSubscription()
      if (current) {
        const response = await fetch(`${API_URL}/push/subscribe`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: current.endpoint }),
        })
        if (!response.ok) throw new Error("No se pudo desactivar el aviso en GrowCRM.")
        await current.unsubscribe()
        setEnabled(false)
        setMessage("Notificaciones desactivadas.")
        return
      }

      const keyResponse = await fetch(`${API_URL}/push/public-key`)
      const keyResult = await keyResponse.json().catch(() => ({}))
      if (!keyResponse.ok || !keyResult.publicKey) throw new Error("Las notificaciones todavía no están configuradas en el servidor.")
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: decodeKey(keyResult.publicKey) as BufferSource,
      })
      const saveResponse = await fetch(`${API_URL}/push/subscribe`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      })
      if (!saveResponse.ok) {
        await subscription.unsubscribe()
        const saveResult = await saveResponse.json().catch(() => ({}))
        throw new Error(saveResult.error || "No se pudo guardar la suscripción.")
      }
      setEnabled(true)
      setMessage("Listo. Te avisaremos cuando haya novedades importantes.")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudieron configurar las notificaciones.")
    } finally {
      setWorking(false)
    }
  }

  if (!supported) return null
  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setCollapsed(false)}
        aria-label="Ver configuración de notificaciones push"
        title="Notificaciones push"
        className="fixed bottom-4 right-4 z-[90] flex h-11 w-11 items-center justify-center rounded-full border border-emerald-100 bg-white text-emerald-700 shadow-lg shadow-emerald-950/10 transition hover:scale-105 hover:bg-emerald-50 sm:bottom-6 sm:right-6"
      >
        {enabled ? <BellRing className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
      </button>
    )
  }
  return (
    <aside className="fixed bottom-4 right-4 z-[90] max-w-[calc(100vw-2rem)] sm:bottom-6 sm:right-6">
      <div className="rounded-2xl border border-emerald-100 bg-white/95 p-3 shadow-lg shadow-emerald-950/10 backdrop-blur sm:p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            {enabled ? <BellRing className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[#123c38]">{enabled ? "Avisos push activos" : "No te pierdas novedades"}</p>
            <p className="text-xs text-zinc-500">{enabled ? "Te avisamos aunque cierres GrowCRM." : "Activá avisos de solicitudes y pedidos."}</p>
          </div>
          <button type="button" disabled={working} onClick={() => void togglePush()} className="shrink-0 rounded-xl bg-[#006b55] px-3 py-2 text-xs font-semibold text-white disabled:opacity-60">
            {working ? "Un momento…" : enabled ? "Desactivar" : "Activar"}
          </button>
          <button type="button" onClick={() => setCollapsed(true)} aria-label="Minimizar aviso de notificaciones" title="Minimizar" className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700">
            <X className="h-4 w-4" />
          </button>
        </div>
        {message && <div className="mt-3 flex items-start gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-900"><p className="flex-1">{message}</p><button aria-label="Cerrar aviso" onClick={() => setMessage("")}><X className="h-3.5 w-3.5" /></button></div>}
      </div>
    </aside>
  )
}
