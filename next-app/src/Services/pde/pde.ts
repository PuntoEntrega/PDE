// v0 was here
import axios from "axios"

export const getPDEList = async (userId: string) => {
  const response = await axios.get(`/api/pdes?user_id=${userId}`)
  return response.data
}

export const getPDEById = async (id: string) => {
  const response = await axios.get(`/api/pdes/${id}/full-detail`)
  return response.data
}

export const updatePDE = async (pdeId: string, data: any) => {
  const response = await axios.patch(`/api/pdes/${pdeId}/edit`, data)
  return response.data
}



export interface PdeUser {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  role: string
  status: string
  lastLogin?: string
  active: boolean
}

/**
 * Obtiene los usuarios asociados a un punto de entrega.
 * @param pdeId ID del punto de entrega
 */
export async function getPdeUsers(pdeId: string): Promise<PdeUser[]> {
  const response = await axios.get(`/api/pdes/${pdeId}/users`)
  return response.data.map((user: any) => ({
    id: user.id,
    name: user.first_name,
    email: user.email,
    phone: user.phone,
    avatar: user.avatar_url,
    role: user.role_id, // si deseas traducir `role_id` a nombre real, aquí harías el mapping
    status: user.status,
    active: !!user.active,          // ← convierte undefined / null en false
    lastLogin: user.last_login ?? null,
  }))
}

export const togglePdeUserActive = async (
  pdeId: string,
  userId: string,
  active: boolean,
) => {
  const res = await axios.patch(
    `/api/pdes/${pdeId}/users/toggle-active`,
    { user_id: userId, active }          // 🔑  igual que el backend
  )
  return res.data as { success: boolean; updated: { id: string; active: boolean } }
}