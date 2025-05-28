import { z } from "zod"

export const registerSchema = z
  .object({
    document_type_id: z.string().nonempty("Selecciona un tipo de documento"),
    identification_number: z
      .string()
      .nonempty("Ingresa tu número de identificación"),
    first_name: z.string().nonempty("Ingresa tu nombre"),
    last_name: z.string().nonempty("Ingresa tu apellido"),
    email: z.string().email("Email inválido").optional(),
    phone: z.string().min(1, "Teléfono inválido").optional(),
  })
  .refine(
    (data) => Boolean(data.email || data.phone),
    { message: "Debes proporcionar correo o teléfono", path: ["contact"] }
  )

export type RegisterFormData = z.infer<typeof registerSchema>
