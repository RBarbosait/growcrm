import type { ReactNode } from "react"
import PushNotifications from "@/app/dashboard/push-notifications"

export default function MemberDashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  return <>{children}<PushNotifications /></>
}
