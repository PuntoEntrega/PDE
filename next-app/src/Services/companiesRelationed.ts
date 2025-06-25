// src/Services/companiesRelationed.ts
import axios from "axios"

export async function getCompaniesRelationed() {
  const response = await axios.get("/api/companies/companies_relationed")
  return response.data // <— ¡Esto es el array directo!
}