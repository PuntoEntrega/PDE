"use client"

import "./globals.css"
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { jwtDecode } from "jwt-decode"
import { UserContext, User } from "@/context/UserContext"

const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")

    // ✅ Si estás en una ruta pública, no verifiques token
    if (PUBLIC_ROUTES.includes(pathname)) return

    // 🔒 Si no hay token, redirige
    if (!token) {
      console.log('layout');
      router.push("/login")
      return
    }

    try {
      const decoded: any = jwtDecode(token)
      const isExpired = decoded.exp * 1000 < Date.now()

      if (isExpired) {
        localStorage.removeItem("token")
        console.log('layout');
        router.push("/login")
        return
      }

      setUser(decoded as User)
      console.log("👤 Sesión activa:", decoded)
    } catch (error) {
      console.error("❌ Token inválido:", error)
      localStorage.removeItem("token")
      console.log('layout');
      router.push("/login")
    }
  }, [pathname]) // ✅ Reaccionar cuando cambia la ruta

  return (
    <html lang="es">
      <body>
        <UserContext.Provider value={{ user, setUser }}>
          {children}
        </UserContext.Provider>
      </body>
    </html>
  )
}
