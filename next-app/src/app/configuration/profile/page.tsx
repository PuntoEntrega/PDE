"use client"

import { useState } from "react"
import { Sidebar } from "@/Components/Sidebar/Sidebar"
import { ConfigurationStepper } from "@/Components/configuration/ConfigurationStepper"
import { ProfileConfigForm } from "@/Components/configuration/ConfigForm"
import { ChangePasswordModal } from "@/Components/configuration/ChangePasswordModal"
import { Toaster } from "@/Components/ui/toaster"
import { useToast } from "@/Components/ui/use-toast"
import { useRouter } from "next/navigation"

export default function ProfileConfigPage() {
  const [activeTab, setActiveTab] = useState("datos-generales")
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSave = async () => {
    setIsSaving(true)

    // Simulación de guardado
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Perfil actualizado",
      description: "Tu información personal ha sido guardada correctamente.",
      variant: "success",
    })

    setIsSaving(false)
  }

  const handleNext = () => {
    handleSave().then(() => {
      router.push("/configuracion/empresa")
    })
  }

  return (
    <Sidebar userName="Juan Pérez Araya">
      <div className="min-h-full bg-gradient-to-br from-gray-50 to-blue-50/20 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Stepper */}
          <ConfigurationStepper currentStep={1} />

          {/* Main Content */}
          <div className="bg-white rounded-xl shadow-md mt-6 overflow-hidden">
            <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white p-6">
              <h1 className="text-2xl font-bold text-gray-800">Configuración Mi Perfil</h1>
              <p className="text-sm text-gray-500 mt-1">
                Completa tu información personal para continuar con la configuración
              </p>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex px-6">
                <button
                  onClick={() => setActiveTab("datos-generales")}
                  className={`py-4 px-3 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === "datos-generales"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Datos Generales
                </button>
                {/* Puedes agregar más tabs aquí si es necesario */}
              </nav>
            </div>

            {/* Form Content */}
            {activeTab === "datos-generales" && (
              <ProfileConfigForm
                onSave={handleSave}
                onNext={handleNext}
                onChangePassword={() => setIsPasswordModalOpen(true)}
                isSaving={isSaving}
              />
            )}
          </div>

          {/* Indicador de progreso */}
          <div className="mt-6 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full w-1/3"></div>
              </div>
              <span className="ml-4 text-sm font-medium text-gray-500">33% completado</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de cambio de contraseña */}
      <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} />

      <Toaster />
    </Sidebar>
  )
}