"use client"

import { createContext, useContext, useState, useEffect } from "react"

interface CompanyContextType {
  relationedGlobalCompanyId: string | null
  setRelationedGlobalCompanyId: (id: string | null) => void
}

const CompanyContext = createContext<CompanyContextType>({
  relationedGlobalCompanyId: null,
  setRelationedGlobalCompanyId: () => {},
})

export const useCompanyContext = () => useContext(CompanyContext)

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [relationedGlobalCompanyId, setRelationedGlobalCompanyId] = useState<string | null>(null)

  // Al montar, sincroniza con localStorage si ya existe
  useEffect(() => {
    const stored = localStorage.getItem("relationedCompany")
    if (stored) {
      setRelationedGlobalCompanyId(stored)
    }
  }, [])

  // Opcional: sincronizar en cada cambio
  useEffect(() => {
    if (relationedGlobalCompanyId) {
      localStorage.setItem("relationedCompany", relationedGlobalCompanyId)
    } else {
      localStorage.removeItem("relationedCompany")
    }
  }, [relationedGlobalCompanyId])

  return (
    <CompanyContext.Provider value={{ relationedGlobalCompanyId, setRelationedGlobalCompanyId }}>
      {children}
    </CompanyContext.Provider>
  )
}
