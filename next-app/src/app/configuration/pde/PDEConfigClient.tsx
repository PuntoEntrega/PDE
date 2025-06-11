// src/app/components/PdeConfigComponent.tsx
"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/Components/Sidebar/Sidebar"
import { ConfigurationStepper } from "@/Components/stepperConfig/steppers/ConfigurationStepper"
import PdeGeneralDataForm, {
  DeliveryPointGeneralData,
} from "@/Components/stepperConfig/PDEConfig/general-data-form"
import PdeParcelServiceForm, {
  DeliveryPointParcelData,
} from "@/Components/stepperConfig/PDEConfig/parcel-service-form"
import { Button } from "@/Components/ui/button"
import { ArrowLeft, Send } from "lucide-react"
import { useToast } from "@/Components/ui/use-toast"
import { useUser } from "@/context/UserContext"
import { useStepProgress } from "@/hooks/useStepProgress"

export default function PdeConfigComponent() {
  const [activeTab, setActiveTab] = useState<"datos-generales" | "paqueteria">(
    "datos-generales"
  )
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const { user } = useUser()
  const { goToStep } = useStepProgress()

  // Estados para recoger datos de los formularios hijos
  const [generalData, setGeneralData] = useState<
    Partial<DeliveryPointGeneralData>
  >({})
  const [parcelData, setParcelData] = useState<
    Partial<DeliveryPointParcelData>
  >({})

  const handleBack = () => {
    router.push("/configuration/company")
  }

  function isParcelSectionComplete(p: Partial<DeliveryPointParcelData>) {
    return (
      typeof p.storage_area_m2 === "number" &&
      ["accepts_xs", "accepts_s", "accepts_m",
        "accepts_l", "accepts_xl", "accepts_xxl", "accepts_xxxl"]
        .every((k) => typeof (p as any)[k] === "boolean")
    )
  }

  const handleSave = async () => {
    if (!isParcelSectionComplete(parcelData)) {
      // Puedes usar toast…
      toast({
        title: "Completa Paquetería",
        description: "Debes indicar el área de bodega y los tamaños aceptados.",
        variant: "destructive",
      })
      // …o un alert nativo:
      // alert("Debes completar la sección Paquetería antes de continuar.");

      setActiveTab("paqueteria")     // ← envía al usuario a la pestaña
      return                          // Detiene el guardado
    }
    setIsSaving(true)
    try {
      console.log('AAAAAAAAAA🔴🔴🔴AAAAAAAAAAAH', generalData, parcelData)
      // 1) Guardar el PDE
      const pdePayload = {
        ...generalData,
        ...parcelData,
      }
      const pdeRes = await fetch("/api/pdes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pdePayload),
      })
      if (!pdeRes.ok) throw new Error("Error al guardar el PDE")

      // 2) Enviar solicitud de revisión
      const revRes = await fetch(`/api/users/${user?.sub}/submit-review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          changed_by_id: user?.sub,
          reason:
            "El usuario ha completado la configuración y enviado la solicitud.",
        }),
      })
      if (!revRes.ok) throw new Error("Error al enviar a revisión")

      toast({
        title: "¡Éxito!",
        description:
          "Tu PDE se guardó correctamente y la solicitud de revisión fue enviada.",
        variant: "success",
      })

      await goToStep(3)
      router.push("/configuration/status-info")
    } catch (err: any) {
      toast({
        title: "Error",
        description:
          err.message || "Ocurrió un problema al guardar o enviar solicitud.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Sidebar userName={`${user?.first_name} ${user?.last_name}`}>
      <div className="min-h-full bg-gradient-to-br from-gray-50 to-blue-50/20 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Stepper lee el paso actual desde Redis */}
          <ConfigurationStepper />

          {/* Tarjeta principal */}
          <div className="bg-white rounded-xl shadow-xl mt-6 overflow-hidden">
            <div className="border-b border-gray-200 p-5 sm:p-6 bg-gradient-to-r from-blue-50 to-white">
              <h1 className="text-2xl font-bold text-gray-800">Mis PDEs</h1>
              <p className="mt-1 text-sm text-gray-500">
                Completa <strong>Datos Generales</strong> y{" "}
                <strong>Paquetería</strong> antes de enviar a revisión.
              </p>
            </div>

            {/* Tabs */}
            <nav className="flex border-b bg-white">
              <button
                onClick={() => setActiveTab("datos-generales")}
                className={`px-4 py-3 text-sm font-medium border-b-2 ${activeTab === "datos-generales"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:border-gray-300"
                  }`}
              >
                Datos Generales
              </button>
              <button
                onClick={() => setActiveTab("paqueteria")}
                className={`ml-4 px-4 py-3 text-sm font-medium border-b-2 ${activeTab === "paqueteria"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:border-gray-300"
                  }`}
              >
                Paquetería
              </button>
            </nav>

            {/* Contenido de Tab */}
            <div className="p-6">
              {activeTab === "datos-generales" && (
                <PdeGeneralDataForm onChange={setGeneralData} />
              )}
              {activeTab === "paqueteria" && (
                <PdeParcelServiceForm onChange={setParcelData} />
              )}
            </div>
          </div>

          {/* Barra de progreso y botones */}
          <div className="mt-6 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center mb-3">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="w-full h-2.5 bg-blue-600 rounded-full transition-all" />
              </div>
              <span className="ml-4 text-sm font-medium text-gray-500">
                100% completado
              </span>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-center pt-3 border-t">
              <Button
                variant="outline"
                className="w-full sm:w-auto mb-2 sm:mb-0"
                onClick={handleBack}
                disabled={isSaving}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Atrás
              </Button>
              <Button
                className="w-full sm:w-auto"
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
    </Sidebar>
  )
}
