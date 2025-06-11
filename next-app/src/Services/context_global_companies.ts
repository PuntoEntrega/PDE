import axios from "axios"

export async function getCompaniesByGlobalContext() {
  const response = await axios.get("/api/companies/by_global_context")
  return response.data.companies
}
