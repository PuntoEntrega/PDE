import { CompanyList } from "@/Components/companies/company-list"
import { Button } from "@/Components/ui/button"
import type { Metadata } from "next"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Mis Empresas",
  description: "Visualiza y gestiona tus empresas registradas.",
}

export default function MyCompaniesPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mis Empresas</h1>
        <Button asChild>
          <Link href="/companies/create">
            <PlusCircle className="mr-2 h-4 w-4" /> Crear Nueva Empresa
          </Link>
        </Button>
      </div>
      <CompanyList />
    </div>
  )
}
