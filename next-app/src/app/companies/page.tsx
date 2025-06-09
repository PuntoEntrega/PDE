"use client"

import { useState } from "react"
import { Button } from "@/Components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/Components/ui/dialog"
import { CreateCompanyForm } from "@/Components/companies/create-company-form"
import { ShowAllCompanies } from "@/Components/companies/show-all-companies"
import { PlusCircle } from "lucide-react"

export default function CompaniesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleSuccess = () => {
    setIsDialogOpen(false)
    setRefreshTrigger((prev) => prev + 1) // Dispara la actualización de la lista
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mis Empresas</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Crear Empresa
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] md:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Nueva Empresa</DialogTitle>
            </DialogHeader>
            <CreateCompanyForm onSuccess={handleSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <ShowAllCompanies refreshTrigger={refreshTrigger} />
    </div>
  )
}
