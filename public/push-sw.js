self.addEventListener("push", (event) => {
  let payload = {}
  try { payload = event.data ? event.data.json() : {} } catch { payload = { body: event.data?.text() || "Hay novedades en tu club." } }
  const title = payload.title || "Novedades de tu club"
  const options = {
    body: payload.body || "Entrá a GrowCRM para ver los detalles.",
    icon: "/casadata-logo.png",
    badge: "/casadata-logo.png",
    data: { url: payload.url || "/dashboard" },
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const target = new URL(event.notification.data?.url || "/dashboard", self.location.origin).href
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true })
    for (const client of windows) {
      if ("focus" in client) {
        await client.focus()
        if ("navigate" in client) await client.navigate(target)
        return
      }
    }
    await self.clients.openWindow(target)
  })())
})
