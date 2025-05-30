"use client"

import { createContext, useContext } from "react"

export interface User {
  sub: string
  role: string
  document_type_id: string
  identification_number: string
  first_name: string
  last_name: string
  username: string
  email: string
  phone: string
  avatar_url: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export const UserContext = createContext<User | null>(null)

export const useUser = () => useContext(UserContext)
