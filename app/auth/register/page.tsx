"use client"
import { useState } from "react"
import type React from "react"

import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault()

  if (formData.password !== formData.confirmPassword) {
    alert("Las contraseñas no coinciden")
    return
  }

  if (!formData.acceptTerms) {
    alert("Debes aceptar los términos y condiciones")
    return
  }

  setIsLoading(true)

  try {
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.name,
          name: formData.name,
        },
      },
    })

    if (error) {
      console.error("REGISTER ERROR:", error)
      alert(error.message)
      return
    }

    console.log("REGISTER SUCCESS:", data)

    if (!data.session) {
      alert(
        "Cuenta creada. Revisá tu email para confirmar tu cuenta antes de iniciar sesión."
      )

      router.push("/auth/login")
      return
    }

    router.push("/dashboard")
  } catch (error) {
    console.error("REGISTER ERROR:", error)
    alert("No se pudo crear la cuenta")
  } finally {
    setIsLoading(false)
  }
}
  

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
<div className="relative min-h-screen overflow-hidden bg-white text-zinc-900 flex items-center justify-center p-4">
  <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
  <div className="absolute -top-52 left-1/2 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-emerald-200/25 blur-[160px]" />
  <div className="absolute right-0 top-96 h-[400px] w-[400px] rounded-full bg-blue-200/20 blur-[140px]" />
</div>
        <div className="w-full max-w-md space-y-6">
        <div className="flex items-center justify-between">
          <Button
  variant="ghost"
  size="sm"
  onClick={() => router.back()}
  className="text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
<div className="flex items-center gap-3">
  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-800 text-sm font-bold text-white">
    G
  </div>

  <span className="text-xl font-bold tracking-tight">
    GrowCRM
  </span>
</div>
        </div>

        <Card className="rounded-3xl border-zinc-200 bg-white shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">
  Crear tu cuenta
</CardTitle>
            <CardDescription>
  Creá tu cuenta y empezá a gestionar tu club con GrowCRM.
</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Tu nombre"
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => updateFormData("password", e.target.value)}
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => updateFormData("acceptTerms", checked as boolean)}
                />
                <Label htmlFor="terms" className="text-sm">
                  Acepto los{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    términos y condiciones
                  </Link>
                </Label>
              </div>

              <Button
  type="submit"
  className="h-12 w-full rounded-full bg-emerald-900 font-semibold text-white hover:bg-emerald-800"
  disabled={isLoading}
>
                {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                ¿Ya tienes cuenta?{" "}
                <Link href="/auth/login" className="text-primary hover:underline">
                  Inicia sesión aquí
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
