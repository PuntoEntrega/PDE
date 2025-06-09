import * as z from "zod"

export const legalRepresentativeSchema = z.object({
  full_name: z.string().min(1, "El nombre completo es requerido."),
  document_type_id: z.string().min(1, "El tipo de documento es requerido."),
  identification_number: z.string().min(1, "El número de identificación es requerido."),
  email: z.string().email({ message: "Email inválido." }).optional().or(z.literal("")),
  primary_phone: z.string().optional(),
  secondary_phone: z.string().optional(),
})

export type LegalRepresentativeFormData = z.infer<typeof legalRepresentativeSchema>

export const companySchema = z.object({
  legal_name: z.string().min(1, "La razón social es requerida."),
  trade_name: z.string().optional(),
  company_type: z.enum(["PdE", "Transportista"], {
    errorMap: () => ({ message: "Debe seleccionar un tipo de compañía." }),
  }),
  legal_id: z.string().min(1, "El ID legal (CUIT/RUC/etc.) es requerido."),
  fiscal_address: z.string().optional(),
  contact_email: z.string().email({ message: "Email de contacto inválido." }).optional().or(z.literal("")),
  contact_phone: z.string().optional(),
  logo_url: z.string().url({ message: "URL de logo inválida." }).optional().or(z.literal("")),
  legalRepresentatives: z.array(legalRepresentativeSchema).min(1, "Debe agregar al menos un representante legal."),
})

export type CompanyFormData = z.infer<typeof companySchema>

// Schema for updating a company (might be different, e.g. legal reps handled separately)
export const updateCompanySchema = companySchema.omit({ legalRepresentatives: true }) // Example
export type UpdateCompanyFormData = z.infer<typeof updateCompanySchema>
