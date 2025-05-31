"use client"

import { useState } from "react"
import { Sidebar } from "@/Components/Sidebar/Sidebar"
import { ConfigurationStepper } from "@/Components/configuration/ConfigurationStepper"
import { CompanyGeneralForm } from "@/Components/company/company-general-form"
import { CompanyBillingForm } from "@/Components/company/company-billing-form"
import { Toaster } from "@/Components/ui/toaster"
import { useToast } from "@/Components/ui/use-toast"
import { useRouter } from "next/navigation"
import { Button } from "@/Components/ui/button"
import { ArrowLeft, ArrowRight } from "lucide-react"

export default function CompanyConfigPage() {
  const [activeTab, setActiveTab] = useState<"datos-generales" | "manejo-dinero">("datos-generales")
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const [companyData, setCompanyData] = useState<any>(null)
  const [legalRepData, setLegalRepData] = useState<any>(null)
  const [billingConfigData, setBillingConfigData] = useState<any>(null)
  const [bankAccountData, setBankAccountData] = useState<any>(null)

  const handleSave = async (formData: any, formType: string) => {
    setIsSaving(true)
    console.log(`Guardando ${formType}:`, formData)

    await new Promise((resolve) => setTimeout(resolve, 1500))

    if (formType === "datosGenerales") {
      setCompanyData(formData.company)
      setLegalRepData(formData.legalRepresentative)
    } else if (formType === "manejoDinero") {
      setBillingConfigData(formData.billing)
      setBankAccountData(formData.bankAccount)
    }

    toast({
      title: "Información Guardada",
      description:
        `Los datos de ${formType === "datosGenerales" ? "Datos Generales" : "Manejo de Dinero y Facturación"} han sido guardados.`,
      variant: "success",
    })

    setIsSaving(false)
  }

  const handleNext = () => {
    router.push("/configuracion/users")
  }

  const handleBack = () => {
    router.push("/configuration/profile")
  }

  return (
    <Sidebar userName="Juan Pérez Araya">
      <div className="min-h-full bg-gradient-to-br from-gray-50 to-blue-50/20 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <ConfigurationStepper currentStep={2} />

          <div className="bg-white rounded-xl shadow-xl mt-6 overflow-hidden">
            <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 via-white to-white p-5 sm:p-6">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Configuración de Mi Empresa</h1>
              <p className="text-sm text-gray-500 mt-1">
                Completa la información de tu empresa y los detalles de facturación.
              </p>
            </div>

            <div className="border-b border-gray-200">
              <nav className="flex px-4 sm:px-6 -mb-px">
                <button
                  onClick={() => setActiveTab("datos-generales")}
                  className={`py-3 sm:py-4 px-3 sm:px-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === "datos-generales"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Datos Generales
                </button>
                <button
                  onClick={() => setActiveTab("manejo-dinero")}
                  className={`py-3 sm:py-4 px-3 sm:px-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === "manejo-dinero"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Manejo de Dinero y Facturación
                </button>
              </nav>
            </div>

            <div className="p-4 sm:p-6">
              {activeTab === "datos-generales" && (
                <CompanyGeneralForm
                  initialCompanyData={companyData}
                  initialLegalRepData={legalRepData}
                  onSave={(data) => handleSave(data, "datosGenerales")}
                  isSaving={isSaving}
                />
              )}
              {activeTab === "manejo-dinero" && (
                <CompanyBillingForm
                  initialBillingData={billingConfigData}
                  initialBankAccountData={bankAccountData}
                  onSave={(data) => handleSave(data, "manejoDinero")}
                  isSaving={isSaving}
                />
              )}
            </div>
          </div>

          <div className="mt-6 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center mb-3">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full w-2/3 transition-all duration-500"></div>
              </div>
              <span className="ml-4 text-sm font-medium text-gray-500 whitespace-nowrap">66% completado</span>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-center pt-3 border-t">
              <Button
                variant="outline"
                className="px-5 py-2 text-sm border-gray-300 text-gray-700 hover:bg-gray-100 w-full sm:w-auto mb-2 sm:mb-0"
                onClick={handleBack}
                disabled={isSaving}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Atrás
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-sm w-full sm:w-auto"
                onClick={handleNext}
                disabled={isSaving}
              >
                Siguiente
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </Sidebar>
  )
}
