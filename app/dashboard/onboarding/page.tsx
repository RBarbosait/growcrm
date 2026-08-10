"use client"

import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Building2, Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function OnboardingPage() {
  const router = useRouter()
  
  const [userName, setUserName] = useState("")

useEffect(() => {
  
  const loadUser = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    

    if (!session) return

    setUserName(
      session.user.user_metadata.full_name ||
      session.user.user_metadata.name ||
      session.user.email?.split("@")[0] ||
      ""
    )
  }

  loadUser()
}, [])

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      {/* Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-52 left-1/2 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-emerald-200/25 blur-[160px]" />
        <div className="absolute right-0 top-96 h-[400px] w-[400px] rounded-full bg-blue-200/20 blur-[140px]" />
      </div>

      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-5xl">

<div className="mb-16 text-center">
  <div className="mb-4 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
    Primer paso
  </div>

  <h1 className="text-5xl font-bold tracking-tight text-zinc-900">
  Bienvenido{userName ? `, ${userName}` : ""} 👋

</h1>

<p className="mx-auto mt-6 mb-12 max-w-2xl text-xl leading-9 text-zinc-600">
Elegí cómo querés comenzar:  </p>

</div>

<div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
  {/* CREAR CLUB */}

  <div
    onClick={() => router.push("/dashboard/create-club")}
className="
group
flex
min-h-[430px]
flex-col
w-full
rounded-3xl
border
border-emerald-200
bg-white
p-8
text-center
transition-all
duration-300
hover:-translate-y-1
hover:border-emerald-300
hover:shadow-2xl
"
  >

<div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-100 to-teal-50 shadow-lg">
  <Building2 className="h-10 w-10 text-emerald-600" />
</div>
    

    <h2 className="text-3xl font-bold">
      Crear mi club
    </h2>

    <p className="mt-3 text-zinc-600 leading-7">
Creá el espacio desde donde vas a administrar productos, servicios, reservas y socios. En pocos minutos estará listo para comenzar.
    </p>

<div className="mt-auto pt-10">
      <Button
       className="
h-16
w-full
rounded-2xl
bg-gradient-to-r
from-emerald-700
to-teal-600
text-base
font-semibold
shadow-lg
transition-all
duration-300
hover:scale-[1.02]
hover:shadow-emerald-300/40
"
      >
        Empezar ahora →
      </Button>

    </div>

  </div>


  {/* DEMO */}

  <div
    onClick={() => router.push("/dashboard/demo")}
 className="
group
flex
min-h-[430px]
flex-col
w-full
rounded-3xl
border
border-emerald-200
bg-white
p-8
text-center
transition-all
duration-300
hover:-translate-y-1
hover:border-emerald-300
hover:shadow-2xl
"
  >

<div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-100 to-cyan-50 shadow-lg">
  <Eye className="h-10 w-10 text-blue-600" />
</div>


    <h2 className="text-3xl font-bold">
      Explorar demostración
    </h2>

    <p className="mt-3 text-zinc-600 leading-7">
Explorá un club ya configurado y descubrí cómo funciona GrowCRM antes de crear el tuyo.
    </p>

<div className="mt-auto pt-10">
<Button
  variant="outline"
  className="
    h-16
    w-full
    rounded-2xl
    border-blue-200
    text-base
    font-semibold
    hover:bg-blue-50
  "
>
  Abrir demo →
</Button>

    </div>

  </div>

</div>
        </div>
      </div>
    </div>
  )
}