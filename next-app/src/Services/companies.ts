// src/Services/companies.ts

import axios from "axios"

export async function getCompaniesByUserId(userId: string) {
    const response = await axios.get(`/api/companies/by-user?user_id=${userId}`)
    return response.data
}

export async function getAssignableCompanies() {
  const res = await fetch("/api/companies/companies_relationed", {
    method: "GET",
    credentials: "include",
  })

  if (!res.ok) throw new Error("Error al cargar empresas asignables")
  return res.json()
}