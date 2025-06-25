"use client"

import { useEffect, useState, useCallback } from "react"
import { patchPDEGeneralData } from "@/Services/pde/edit"
import { useToast } from "@/Components/ui/use-toast"
import PdeGeneralDataForm from "@/Components/stepperConfig/PDEConfig/general-data-form"
import { Button } from "@/Components/ui/button"
import { Save, Loader2 } from "lucide-react"
import { PDEGeneralData } from "@/types/pde"

interface Props {
  pde: PDEGeneralData & { id: string }
}

export default function PdeGeneralDataEdit({ pde }: Props) {
  const { toast } = useToast()

  /* ---------- semilla que se actualiza SOLO cuando cambia `pde` ---------- */
  const [initialData, setInitialData] = useState<Omit<PDEGeneralData, "id">>({
    company_id: pde.company_id,
    name: pde.name,
    trade_name: pde.trade_name,
    business_email: pde.business_email,
    whatsapp_contact: pde.whatsapp_contact,
    manager_name: pde.manager_name,
    manager_email: pde.manager_email,
    manager_phone: pde.manager_phone,
    province: pde.province,
    canton: pde.canton,
    district: pde.district,
    exact_address: pde.exact_address,
    postal_code: pde.postal_code,
  })

  /* ---------- estado editable que cambia al tipear ----------------------- */
  const [formData, setFormData] = useState(initialData)

  /* ---------- re-hidrata si llega otro PDE ------------------------------- */
  useEffect(() => {
    const fresh = {
      company_id: pde.company_id,
      name: pde.name,
      trade_name: pde.trade_name,
      business_email: pde.business_email,
      whatsapp_contact: pde.whatsapp_contact,
      manager_name: pde.manager_name,
      manager_email: pde.manager_email,
      manager_phone: pde.manager_phone,
      province: pde.province,
      canton: pde.canton,
      district: pde.district,
      exact_address: pde.exact_address,
      postal_code: pde.postal_code,
    }
    setInitialData(fresh)
    setFormData(fresh)
  }, [pde])

  /* ---------- lista real (solo una empresa en este contexto) ------------- */
  const companies = [
    {
      id: pde.company_id,
      trade_name: pde.company?.trade_name || "Empresa sin nombre",
      logo_url: pde.company?.logo_url || null,
      company_type: pde.company?.company_type || "Desconocido",
      active: pde.company?.active ?? true,
    },
  ]

  /* ---------- callback estable para el formulario ------------------------ */
  const handleFormChange = useCallback(
    (data: Partial<PDEGeneralData>) =>
      setFormData((prev) => ({ ...prev, ...data })),
    []
  )

  /* ---------- guardar ----------------------------------------------------- */
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      await patchPDEGeneralData(pde.id, formData)         /* ← /api/pdes */
      toast({
        title: "Guardado exitoso",
        description: "Los datos generales fueron actualizados correctamente.",
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

  /* --------------------------- return (sin cambios visuales) --------------------------- */
  return (
    <div className="space-y-4">
      <PdeGeneralDataForm
        initialData={initialData}
        onChange={handleFormChange}
        companies={companies}          /* ✅ pasa la lista real */
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
