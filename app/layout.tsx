import type { ReactNode } from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "GrowCRM",
    template: "%s | GrowCRM",
  },
  description:
    "Plataforma de gestión para clubes. Administrá socios, reservas, productos, stock y comunicación desde un solo lugar.",
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${GeistSans.variable} font-sans`}>
        {children}
      </body>
    </html>
  )
}