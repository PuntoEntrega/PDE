// src/app/page.tsx
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth" // función server-side

export default async function Home() {
  const session = await getSession() // ✅ esto sí es válido en server

  if (session) {
    redirect("/dashboard") // o el dashboard según el rol si quieres
  } else {
    redirect("/login")
  }

  return null
}
