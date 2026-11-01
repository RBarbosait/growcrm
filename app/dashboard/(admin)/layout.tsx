import type { ReactNode } from "react"
import PushNotifications from "@/app/dashboard/push-notifications"

export default function AdminDashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  return <>{children}<PushNotifications /></>
}
