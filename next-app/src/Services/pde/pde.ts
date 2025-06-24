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
  phone: string | null
  avatar: string | null
  role: string
  status: "active" | "inactive" | "pending" | string
  lastLogin: string | null
}

export async function getPdeUsers(pdeId: string) {
  const { data } = await axios.get<PdeUser[]>(`/api/pdes/${pdeId}/users`)
  return data
}
