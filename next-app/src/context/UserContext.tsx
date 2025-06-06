// context/UserContext.tsx
"use client"

import { createContext, useContext } from "react"

export interface User {
  sub: string
  role: string
  level: number
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

interface UserContextType {
  user: User | null
  setUser: (user: User | null) => void
}

export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
})

export const useUser = () => useContext(UserContext)
