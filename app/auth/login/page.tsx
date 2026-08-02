"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"


export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  setIsLoading(true)

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  setIsLoading(false)

  if (error) {
    alert(error.message)
    return
  }

  router.push("/dashboard")
}

const handleGoogleLogin = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "http://localhost:3000/dashboard",
    },
  })

  if (error) {
    alert(error.message)
  }
}
  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-52 left-1/2 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-emerald-200/25 blur-[160px]" />
        <div className="absolute right-0 top-96 h-[400px] w-[400px] rounded-full bg-blue-200/20 blur-[140px]" />
      </div>

      <div className="flex min-h-screen flex-col items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>

          <div className="text-center">
            <h1 className="text-4xl font-bold">GrowCRM</h1>
          </div>

          <Card className="rounded-3xl border shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
              <CardDescription>Ingresá para administrar tu club.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
               <Button
  type="button"
  variant="outline"
  className="h-12 w-full rounded-xl"
  onClick={handleGoogleLogin}
>
  Continuar con Google
</Button>

                <div className="relative py-4">
                  <hr />
                  <span className="absolute left-1/2 -top-2 -translate-x-1/2 bg-white px-3 text-sm text-zinc-400">
                    o continuar con email
                  </span>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    className="h-12 rounded-xl"
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Input
                      className="h-12 rounded-xl"
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                </Button>
              </form>

              <div className="mt-6 space-y-2 text-center">
                <p className="text-sm text-muted-foreground">
                  ¿No tienes cuenta?{" "}
                  <Link href="/auth/register" className="text-primary hover:underline">
                    Regístrate aquí
                  </Link>
                </p>
                <Link href="/auth/forgot-password" className="block text-sm text-primary hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}