// Asumimos que tienes un schema de Zod para la validación del formulario
// que se puede inferir o crear explícitamente.
// Por ahora, usaremos `any` para simplificar, pero deberías tiparlo correctamente.
type CreateCompanyDto = any // Reemplazar con el tipo derivado de tu schema de Zod

export const getCompanies = async () => {
  const response = await fetch("/api/companies")
  if (!response.ok) {
    throw new Error("Failed to fetch companies")
  }
  return response.json()
}

export const createCompany = async (data: CreateCompanyDto) => {
  const response = await fetch("/api/companies", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Failed to create company")
  }
  return response.json()
}
