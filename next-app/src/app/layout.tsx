"use client"

import "./globals.css"
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { jwtDecode } from "jwt-decode"
import { UserContext, User } from "@/context/UserContext"
import { CompanyProvider } from "@/context/CompanyContext"

const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password", "/complete-registration",]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")

    if (PUBLIC_ROUTES.includes(pathname)) return
    if (!token) {
      router.push("/login")
      return
    }

    try {
      const decoded: any = jwtDecode(token)
      const isExpired = decoded.exp * 1000 < Date.now()

      if (isExpired) {
        localStorage.removeItem("token")
        router.push("/login")
        return
      }

      setUser(decoded as User)
      console.log("👤 Sesión activa:", decoded)
    } catch (error) {
      console.error("❌ Token inválido:", error)
      localStorage.removeItem("token")
      router.push("/login")
    }
  }, [pathname])

  return (
    <html lang="es">
      <body>
        <UserContext.Provider value={{ user, setUser }}>
          <CompanyProvider>
            {children}
          </CompanyProvider>
        </UserContext.Provider>
      </body>
    </html>
  )
}
