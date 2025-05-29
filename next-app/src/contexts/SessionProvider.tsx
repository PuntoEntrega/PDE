"use client"

import { ReactNode, createContext, useContext, useEffect, useState } from "react"
import { getCurrentUser } from "@/lib/auth" // función que obtiene los datos del usuario desde la cookie
import { Usuario } from "@/types"

type SessionContextType = {
  user: Usuario | null
  loading: boolean
}

const SessionContext = createContext<SessionContextType>({
  user: null,
  loading: true,
})

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUser() {
      try {
        const user = await getCurrentUser()
        setUser(user)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

  return (
    <SessionContext.Provider value={{ user, loading }}>
      {children}
    </SessionContext.Provider>
  )
}

export const useSession = () => useContext(SessionContext)
