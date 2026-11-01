"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Mail } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      if (resetError) throw resetError
      setSent(true)
    } catch (resetError) {
      console.error("PASSWORD RESET REQUEST ERROR:", resetError)
      setError("No pudimos enviar el correo. Revisá la dirección e intentá nuevamente.")
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

        <div className="mt-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
          <Mail className="h-5 w-5" />
        </div>

        {sent ? (
          <>
            <h1 className="mt-5 text-2xl font-bold tracking-tight text-[#092f35]">Revisá tu correo</h1>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              Si existe una cuenta asociada a <strong>{email}</strong>, Supabase enviará un enlace para crear una contraseña nueva. Revisá también la carpeta de spam.
            </p>
            <button type="button" onClick={() => setSent(false)} className="mt-6 text-sm font-semibold text-emerald-800 underline underline-offset-4">
              Enviar otro enlace
            </button>
          </>
        ) : (
          <>
            <h1 className="mt-5 text-2xl font-bold tracking-tight text-[#092f35]">Recuperá tu contraseña</h1>
            <p className="mt-3 text-sm leading-6 text-zinc-600">Ingresá el correo de tu cuenta y te enviaremos un enlace seguro para elegir una contraseña nueva.</p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className="block text-sm font-semibold text-zinc-700" htmlFor="email">Correo electrónico</label>
              <input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tu@email.com" className="-mt-2 h-12 w-full rounded-xl border border-zinc-200 px-4 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10" />
              {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
              <button type="submit" disabled={loading} className="w-full rounded-xl bg-[#006b55] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#005c49] disabled:opacity-50">
                {loading ? "Enviando enlace…" : "Enviar enlace de recuperación"}
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  )
}
