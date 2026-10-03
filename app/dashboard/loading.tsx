import { WaitOverlay } from "@/components/ui/wait-overlay"

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#f8faf9]">
      <WaitOverlay
        open
        label="Cargando el dashboard"
        messages={[
          "Abriendo tu espacio de trabajo...",
          "Cargando los datos de tu club...",
          "Preparando el dashboard...",
        ]}
      />
    </div>
  )
}
