"use client"

import { useState } from "react"
import { Sidebar } from "@/Components/Sidebar/Sidebar"
import { ConfigurationStepper } from "@/Components/stepperConfig/steppers/ConfigurationStepper"
import PdeGeneralDataForm from "@/Components/stepperConfig/PDEConfig/general-data-form"
import PdeParcelServiceForm from "@/Components/stepperConfig/PDEConfig/parcel-service-form"
import { Toaster } from "@/Components/ui/toaster"
import { useToast } from "@/Components/ui/use-toast"
import { useRouter } from "next/navigation"
import { Button } from "@/Components/ui/button"
import { ArrowLeft, Send } from "lucide-react"
import { useUser } from "@/context/UserContext"
import { useStepProgress } from "@/hooks/useStepProgress"   // ➊

export default function PdeConfigComponent() {
  const [activeTab, setActiveTab] = useState<"datos-generales" | "paqueteria">("datos-generales")
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const { user } = useUser()
  const { goToStep } = useStepProgress()                      // ➋

  const handleSave = async () => {
    setIsSaving(true)

    try {
      const res = await fetch(`/api/users/${user?.sub}/submit-review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          changed_by_id: user?.sub,
          reason: "El usuario ha completado la configuración y enviado la solicitud.",
        }),
      })

      if (!res.ok) throw new Error("Error al enviar a revisión")

      toast({
        title: "Solicitud Enviada",
        description: "Has enviado tu cuenta para revisión. Te notificaremos pronto.",
        variant: "success",
      })

      await goToStep(3)             // ➌ — marca el Paso 3 como completado en Redis

    } catch (err) {
      toast({
        title: "Error al enviar",
        description: "Ocurrió un problema. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
      router.push("/configuration/status-info")
    }
  }

  const handleBack = () => {
    router.push("/configuration/company")
  }

  return (
    <Sidebar userName="Juan Pérez Araya">
      <div className="min-h-full bg-gradient-to-br from-gray-50 to-blue-50/20 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Ya no pasamos currentStep como prop, el stepper lo lee del hook */}
          <ConfigurationStepper />

          <div className="bg-white rounded-xl shadow-xl mt-6 overflow-hidden">
            <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 via-white to-white p-5 sm:p-6">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Mis PDEs</h1>
              <p className="text-sm text-gray-500 mt-1">
                Para crear un nuevo PDE es obligatorio completar la información de{" "}
                <span className="font-semibold">Datos Generales</span> y{" "}
                <span className="font-semibold">Paquetería</span>. Será enviado a{" "}
                <span className="font-semibold text-blue-600">Asistencia PDE</span> para su revisión.
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
                  onClick={() => setActiveTab("paqueteria")}
                  className={`py-3 sm:py-4 px-3 sm:px-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === "paqueteria"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Paquetería
                </button>
              </nav>
            </div>

            <div className="p-4 sm:p-6">
              {activeTab === "datos-generales" && <PdeGeneralDataForm />}
              {activeTab === "paqueteria" && <PdeParcelServiceForm />}
            </div>
          </div>

          <div className="mt-6 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center mb-3">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                {/* 100% completado */}
                <div className="bg-blue-600 h-2.5 rounded-full w-full transition-all duration-500" />
              </div>
              <span className="ml-4 text-sm font-medium text-gray-500 whitespace-nowrap">
                100% completado
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
                onClick={handleSave}     
                disabled={isSaving}
              >
                {isSaving ? "Enviando..." : "Enviar a Aprobación"}
                <Send className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </Sidebar>
  )
}
