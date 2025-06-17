"use client"

import { useEffect, useState, useCallback } from "react"
import { patchPDEParcelData } from "@/Services/pde/edit"
import { useToast } from "@/Components/ui/use-toast"
import { DeliveryPointParcelData } from "@/types/pde"
import PdeParcelServiceForm from "@/Components/stepperConfig/PDEConfig/parcel-service-form"
import { Button } from "@/Components/ui/button"
import { Save, Loader2 } from "lucide-react"

interface PdeParcelServiceEditProps {
  pde: {
    id: string
    storage_area_m2: number
    accepts_xs: boolean
    accepts_s: boolean
    accepts_m: boolean
    accepts_l: boolean
    accepts_xl: boolean
    accepts_xxl: boolean
    accepts_xxxl: boolean
  }
}

export default function PdeParcelServiceEdit({ pde }: PdeParcelServiceEditProps) {
  const { toast } = useToast()

  /* -------- semilla -------- */
  const [initialData, setInitialData] = useState<DeliveryPointParcelData>({
    storage_area_m2: pde.storage_area_m2,
    accepts_xs: pde.accepts_xs,
    accepts_s: pde.accepts_s,
    accepts_m: pde.accepts_m,
    accepts_l: pde.accepts_l,
    accepts_xl: pde.accepts_xl,
    accepts_xxl: pde.accepts_xxl,
    accepts_xxxl: pde.accepts_xxxl,
  })

  /* -------- editable -------- */
  const [formData, setFormData] = useState(initialData)

  /*  re-hidrata si pde cambia  */
  useEffect(() => {
    const fresh = {
      storage_area_m2: pde.storage_area_m2,
      accepts_xs: pde.accepts_xs,
      accepts_s: pde.accepts_s,
      accepts_m: pde.accepts_m,
      accepts_l: pde.accepts_l,
      accepts_xl: pde.accepts_xl,
      accepts_xxl: pde.accepts_xxl,
      accepts_xxxl: pde.accepts_xxxl,
    }
    setInitialData(fresh)
    setFormData(fresh)
  }, [pde])

  const handleFormChange = useCallback(
    (data: DeliveryPointParcelData) =>
      setFormData((prev) => ({ ...prev, ...data })),
    []
  )

  /* -------- guardar -------- */
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      await patchPDEParcelData(pde.id, formData)
      toast({
        title: "Guardado exitoso",
        description:
          "Los datos de paquetería fueron actualizados correctamente.",
      })
    } catch (err: any) {
      console.error(err)
      toast({
        title: "Error al guardar",
        description:
          err?.response?.data?.error || "Ocurrió un error inesperado.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  /* --------------------------- return (markup idéntico) --------------------------- */
  return (
    <div className="space-y-4">
      <PdeParcelServiceForm
        initialData={initialData}
        onChange={handleFormChange}
      />
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Guardar cambios
        </Button>
      </div>
    </div>
  )
}
