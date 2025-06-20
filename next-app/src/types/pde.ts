// src/types/pde.ts

export interface PDEGeneralData {
  company_id: string,  
  name?: string;
  trade_name?: string;
  business_email?: string;
  whatsapp_contact?: string;
  manager_name?: string;
  manager_email?: string;
  manager_phone?: string;
  province?: string;
  canton?: string;
  district?: string;
  exact_address?: string;
  postal_code?: string;
}

export interface DeliveryPointParcelData {
  storage_area_m2: number;
  accepts_xs: boolean;
  accepts_s: boolean;
  accepts_m: boolean;
  accepts_l: boolean;
  accepts_xl: boolean;
  accepts_xxl: boolean;
  accepts_xxxl: boolean;
}

export interface PDEFullDetail
  extends PDEGeneralData,
    DeliveryPointParcelData {
  id: string;
}