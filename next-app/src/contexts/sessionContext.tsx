// src/contexts/SessionContext.tsx
"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { getUsuarios } from "@/Services/Usuarios"
import { Usuario } from "@/types/User"

type SessionContextType = {
  user: Usuario | null
  loading: boolean
}

const SessionContext = createContext<SessionContextType>({
  user: null,
  loading: true,
})

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getUsuarios()
      .then((u) => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  return (
    <SessionContext.Provider value={{ user, loading }}>
      {children}
    </SessionContext.Provider>
  )
}

export const useSessionContext = () => useContext(SessionContext)
