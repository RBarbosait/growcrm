import { WaitOverlay } from "@/components/ui/wait-overlay"

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#f8faf9]">
      <WaitOverlay
        open
        label="Cargando GrowCRM"
        messages={[
          "Preparando GrowCRM...",
          "Cargando la información...",
          "Ya casi está listo...",
        ]}
      />
    </div>
  )
}
