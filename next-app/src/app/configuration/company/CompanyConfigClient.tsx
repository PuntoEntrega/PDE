// src/app/configuration/company/CompanyConfigClient.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/Components/Sidebar/Sidebar"
import { ConfigurationStepper } from "@/Components/stepperConfig/steppers/ConfigurationStepper"
import { CompanyGeneralForm } from "@/Components/stepperConfig/CompanieConfig/company-general-form"
import { Toaster } from "@/Components/ui/toaster"
import { useToast } from "@/Components/ui/use-toast"
import { Button } from "@/Components/ui/button"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useStepProgress } from "@/hooks/useStepProgress"
import { useAlert } from "@/Components/alerts/use-alert"

export default function CompanyConfigClient() {
  const [activeTab, setActiveTab] = useState("datos-generales")
  const [isSaving, setIsSaving] = useState(false)
  const [companyData, setCompanyData] = useState<any>(null)
  const [legalRepData, setLegalRepData] = useState<any>(null)
  const { toast } = useToast()
  const { showAlert } = useAlert()
  const router = useRouter()
  const { goToStep } = useStepProgress()

  const handleSave = async (formData: any, formType: string) => {
    setIsSaving(true)
    console.log(`Guardando ${formType}:`, formData)

    // Simulación de guardado en tu backend/Redis
    await new Promise((resolve) => setTimeout(resolve, 1500))

    if (formType === "datosGenerales") {
      setCompanyData(formData.company)
      setLegalRepData(formData.legalRepresentative)
    }

    toast({
      title: "Información Guardada",
      description: `Los datos de ${formType === "datosGenerales" ? "Datos Generales" : "Otra sección"
        } han sido guardados.`,
      variant: "default",
    })

    setIsSaving(false)
  }

  const handleNext = () => {
    // 1) Primero validamos/guardamos el Paso 3 en Redis
    goToStep(3)
    // 2) Luego navegamos a /configuration/pde (Paso 3)
    router.push("/configuration/pde")
  }

  const handleBack = () => {
    router.push("/configuration/profile")
  }

  return (
    <Sidebar userName="Juan Pérez Araya">
      <div className="min-h-full bg-gradient-to-br from-gray-50 to-blue-50/20 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Stepper dinámico que lee currentStep del hook */}
          <ConfigurationStepper />

          <div className="bg-white rounded-xl shadow-xl mt-6 overflow-hidden">
            <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 via-white to-white p-5 sm:p-6">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                Configuración de Mi Empresa
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Completa la información de tu empresa y los detalles de facturación.
              </p>
            </div>

            <div className="border-b border-gray-200">
              <nav className="flex px-4 sm:px-6 -mb-px">
                <button
                  onClick={() => setActiveTab("datos-generales")}
                  className={`py-3 sm:py-4 px-3 sm:px-4 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === "datos-generales"
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                >
                  Datos Generales
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
            </div>
          </div>

          <div className="mt-6 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center mb-3">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                {/* 2 de 3 pasos = 66% */}
                <div className="bg-blue-600 h-2.5 rounded-full w-2/3 transition-all duration-500" />
              </div>
              <span className="ml-4 text-sm font-medium text-gray-500 whitespace-nowrap">
                66% completado
              </span>
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
