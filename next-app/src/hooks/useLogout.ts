import { useRouter } from "next/navigation"

// src/hooks/useLogout.ts
const Router = useRouter()

export function useLogout() {
  return () => {
    localStorage.removeItem("token")
    localStorage.removeItem("relationedCompany")
    document.cookie = "token=; Max-Age=0; path=/"
    document.cookie = "relationedCompany=; Max-Age=0; path=/"
    Router.push("/login")
  }
}
