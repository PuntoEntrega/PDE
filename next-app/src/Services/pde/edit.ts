// src/Services/pde/edit.ts
import axios from "axios"

export async function patchPDEParcelData(pdeId: string, data: ParcelPatchData) {
  const res = await axios.patch(`/api/pdes/${pdeId}/edit/parcel`, data)
  return res.data
}

export async function patchPDEGeneralData(pdeId: string, data: GeneralPatchData) {
  const res = await axios.patch(`/api/pdes/${pdeId}/edit/general`, data)
  return res.data
}

// Tipos locales si no los tenés aún importados
interface ParcelPatchData {
  storage_area_m2?: number
  accepts_xs?: boolean
  accepts_s?: boolean
  accepts_m?: boolean
  accepts_l?: boolean
  accepts_xl?: boolean
  accepts_xxl?: boolean
  accepts_xxxl?: boolean
}

interface GeneralPatchData {
  name?: string
  trade_name?: string
  business_email?: string
  whatsapp_contact?: string
  manager_name?: string
  manager_email?: string
  manager_phone?: string
  province?: string
  canton?: string
  district?: string
  exact_address?: string
  postal_code?: string
}
