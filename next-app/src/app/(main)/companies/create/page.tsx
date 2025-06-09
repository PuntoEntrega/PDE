import { CreateCompanyForm } from "@/Components/companies/create-company-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Crear Empresa",
  description: "Formulario para crear una nueva empresa.",
}

export default function CreateCompanyPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <CreateCompanyForm />
    </div>
  )
}
