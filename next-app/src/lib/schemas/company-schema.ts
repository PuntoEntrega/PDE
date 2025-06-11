import { z } from "zod"

export const companyInfoSchema = z.object({
    legal_name: z.string().min(3, "El nombre legal es requerido (mín. 3 caracteres)."),
    trade_name: z.string().optional(),
    legal_id: z.string().min(5, "La cédula jurídica es requerida (mín. 5 caracteres)."),
    company_type: z.enum(["PdE", "Transportista"], {
        errorMap: () => ({ message: "Debe seleccionar un tipo de empresa." }),
    }),
    logo_url: z.string().url("URL de logo inválida.").optional().or(z.literal("")),
    parent_company_id: z.string().optional(),
})

export const contactInfoSchema = z.object({
    contact_email: z.string().email("Correo electrónico de contacto inválido."),
    contact_phone: z
        .string()
        .min(8, "El teléfono de contacto debe tener al menos 8 dígitos.")
        .optional()
        .or(z.literal("")),
    fiscal_address: z.string().min(10, "La dirección fiscal es requerida (mín. 10 caracteres)."),
})

export const legalRepSchema = z.object({
    document_type_id: z.string().nonempty("Tipo de Identificación es obligatorio"),
    full_name: z.string().nonempty("Nombre Completo es obligatorio"),
    identification_number: z.string().nonempty("Número de Identificación es obligatorio"),
    email: z.string().email("Correo inválido"),
    primary_phone: z.string().nonempty("Teléfono Principal es obligatorio"),
    secondary_phone: z.string().optional(),
})

export const fullCompanySchema = companyInfoSchema.merge(contactInfoSchema).extend({
    legal_representative: legalRepSchema,
})

export type FullCompanyFormData = z.infer<typeof fullCompanySchema>

export interface LegalRepresentative {
    id: string
    company_id: string
    full_name: string
    identification_number: string
    email: string
    primary_phone: string
    secondary_phone: string | null
    document_type_id: string
    created_at: string
    updated_at: string
}

export interface CompanyApiResponse {
    id: string
    legal_name: string
    trade_name?: string
    legal_id: string
    company_type: string
    contact_email: string
    contact_phone?: string
    fiscal_address: string
    logo_url?: string
    active: boolean
    parent_company_id?: string | null
    owner_user_id: string
    created_at: string
    updated_at: string
    legal_representative: {
        id: string
        full_name: string
        identification_number: string
        email: string
        primary_phone: string
        secondary_phone?: string
        document_type_id: string
        created_at: string
        updated_at: string
    }
}

