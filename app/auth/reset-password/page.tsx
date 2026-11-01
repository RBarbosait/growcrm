"use client"

import { FormEvent, useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Check } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [hasRecoverySession, setHasRecoverySession] = useState(false)
  const [updated, setUpdated] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setHasRecoverySession(Boolean(data.session))
      setCheckingSession(false)
    }).catch(() => {
      if (active) setCheckingSession(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setHasRecoverySession(true)
    })
    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.")
      return
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.")
      return
    }

    setLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError
      setUpdated(true)
    } catch (updateError) {
      console.error("PASSWORD RESET ERROR:", updateError)
      setError("El enlace venció o ya fue usado. Solicitá uno nuevo e intentá otra vez.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5faf8] px-5 py-10">
      <section className="w-full max-w-md rounded-3xl border border-emerald-100 bg-white p-7 shadow-sm sm:p-9">
        <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-emerald-800">
          <ArrowLeft className="h-4 w-4" /> Volver al inicio de sesión
        </Link>
        {updated ? (
          <>
            <div className="mt-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><Check className="h-5 w-5" /></div>
            <h1 className="mt-5 text-2xl font-bold tracking-tight text-[#092f35]">Contraseña actualizada</h1>
            <p className="mt-3 text-sm leading-6 text-zinc-600">Ya podés iniciar sesión con tu contraseña nueva.</p>
            <Link href="/auth/login" className="mt-6 block rounded-xl bg-[#006b55] px-5 py-3.5 text-center text-sm font-bold text-white hover:bg-[#005c49]">Ir a iniciar sesión</Link>
          </>
        ) : checkingSession ? (
          <p className="mt-8 text-sm text-zinc-500">Verificando el enlace…</p>
        ) : !hasRecoverySession ? (
          <>
            <h1 className="mt-8 text-2xl font-bold tracking-tight text-[#092f35]">El enlace no es válido</h1>
            <p className="mt-3 text-sm leading-6 text-zinc-600">El enlace venció o ya fue utilizado. Pedí uno nuevo para recuperar tu contraseña.</p>
            <Link href="/auth/forgot-password" className="mt-6 block rounded-xl bg-[#006b55] px-5 py-3.5 text-center text-sm font-bold text-white hover:bg-[#005c49]">Pedir otro enlace</Link>
          </>
        ) : (
          <>
            <h1 className="mt-8 text-2xl font-bold tracking-tight text-[#092f35]">Elegí una contraseña nueva</h1>
            <p className="mt-3 text-sm leading-6 text-zinc-600">Usá al menos 8 caracteres y confirmala para guardar el cambio.</p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className="block text-sm font-semibold text-zinc-700" htmlFor="password">Nueva contraseña</label>
              <input id="password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} className="-mt-2 h-12 w-full rounded-xl border border-zinc-200 px-4 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10" />
              <label className="block text-sm font-semibold text-zinc-700" htmlFor="confirm-password">Repetir contraseña</label>
              <input id="confirm-password" type="password" autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="-mt-2 h-12 w-full rounded-xl border border-zinc-200 px-4 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10" />
              {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
              <button type="submit" disabled={loading} className="w-full rounded-xl bg-[#006b55] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#005c49] disabled:opacity-50">
                {loading ? "Guardando…" : "Guardar contraseña nueva"}
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  )
}
