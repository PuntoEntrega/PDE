'use client'

import { useEffect, useState } from 'react'

export interface SessionData {
  id: string
  role: string
  first_name: string
  last_name: string
  email: string
}

export function useSession() {
  const [session, setSession] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch('/api/me', {
          credentials: 'include'
        })
        if (res.ok) {
          const data = await res.json()
          setSession(data)
        } else {
          setSession(null)
        }
      } catch (err) {
        console.error('Error al obtener sesión', err)
        setSession(null)
      } finally {
        setLoading(false)
      }
    }

    fetchSession()
  }, [])

  return { session, loading }
}
