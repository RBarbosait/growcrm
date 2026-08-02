export interface Property {
  id: string
  title: string
  type: string
  address: string
  operation: string
  image: string
  contact: string
  hasStreetView: boolean
  description: string
  features: string[]
  agent: string
  agentPhone: string
  status: "active" | "pending" | "expired"
  views: number
  createdAt: string
  userId?: string
  isUserGenerated?: boolean
}

// ======================
// MOCK (fallback)
// ======================
const defaultProperties: Property[] = [
  {
    id: "1",
    title: "Casa moderna en zona residencial",
    type: "Casa",
    address: "Av. 18 de Julio 1234, Montevideo",
    operation: "Venta",
    image: "/modern-house-exterior.png",
    contact: "+598 99 123 456",
    hasStreetView: true,
    description:
      "Hermosa casa de 3 dormitorios con jardín amplio.",
    features: ["3 dormitorios", "2 baños", "Jardín"],
    agent: "María González",
    agentPhone: "+598 99 123 456",
    status: "active",
    views: 45,
    createdAt: "2024-01-15",
    isUserGenerated: false,
  },
]

// ======================
// GET ALL (API + fallback)
// ======================
export const getAllProperties = async (): Promise<Property[]> => {
  try {
    const res = await fetch(
      "https://growcrm-api-production.up.railway.app/property",
      { cache: "no-store" }
    )

    const data = await res.json()

    const apiProperties: Property[] = data.map((p: any) => ({
      id: p.id,
      title: p.title || "Propiedad",
      type: "Propiedad",
      address: p.location || "",
      operation: p.operationType || "Venta",
      image: p.image || "/placeholder.svg",
      contact: p.agentPhone || "",
      hasStreetView: false,
      description: p.description || "",
      features: Array.isArray(p.features) ? p.features : [],
      agent: p.agentName || "",
      agentPhone: p.agentPhone || "",
      status: p.status || "active",
      views: 0,
      createdAt: p.createdAt || new Date().toISOString(),
      isUserGenerated: true,
    }))

    const userProperties = getUserProperties()

    return [...apiProperties, ...userProperties]
  } catch (error) {
    console.error("Error loading API properties:", error)

    const userProperties = getUserProperties()
    return [...defaultProperties, ...userProperties]
  }
}

// ======================
// GET BY ID
// ======================
export const getPropertyById = async (
  id: string
): Promise<Property | undefined> => {
  const allProperties = await getAllProperties()
  return allProperties.find((p) => p.id === id)
}

// ======================
// LOCAL STORAGE
// ======================
export const getUserProperties = (): Property[] => {
  if (typeof window === "undefined") return []

  const stored = localStorage.getItem("casadata_user_properties")
  return stored ? JSON.parse(stored) : []
}

// ======================
// CREATE LOCAL PROPERTY
// ======================
export const saveUserProperty = (
  property: Omit<Property, "id" | "views" | "createdAt" | "isUserGenerated">
): Property => {
  const userProperties = getUserProperties()

  const newProperty: Property = {
    ...property,
    id: crypto.randomUUID(),
    views: 0,
    createdAt: new Date().toISOString(),
    isUserGenerated: true,
    status: "active",
  }

  const updated = [...userProperties, newProperty]
  localStorage.setItem("casadata_user_properties", JSON.stringify(updated))

  return newProperty
}

// ======================
// UPDATE
// ======================
export const updateUserProperty = (
  id: string,
  updates: Partial<Property>
): Property | null => {
  const userProperties = getUserProperties()
  const index = userProperties.findIndex((p) => p.id === id)

  if (index === -1) return null

  userProperties[index] = { ...userProperties[index], ...updates }

  localStorage.setItem(
    "casadata_user_properties",
    JSON.stringify(userProperties)
  )

  return userProperties[index]
}

// ======================
// DELETE
// ======================
export const deleteUserProperty = (id: string): boolean => {
  const userProperties = getUserProperties()
  const filtered = userProperties.filter((p) => p.id !== id)

  if (filtered.length === userProperties.length) return false

  localStorage.setItem(
    "casadata_user_properties",
    JSON.stringify(filtered)
  )

  return true
}

// ======================
// VIEWS (LOCAL ONLY)
// ======================
export const incrementPropertyViews = (id: string): void => {
  const userProperties = getUserProperties()
  const index = userProperties.findIndex((p) => p.id === id)

  if (index !== -1) {
    userProperties[index].views += 1

    localStorage.setItem(
      "casadata_user_properties",
      JSON.stringify(userProperties)
    )
  }
}
