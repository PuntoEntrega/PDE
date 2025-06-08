import { z } from "zod"

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "El usuario es requerido")
    .refine(
      (value) => {
        // Validar si es email o username
        const isEmail = z.string().email().safeParse(value).success
        const isUsername = value.length >= 3
        return isEmail || isUsername
      },
      {
        message: "Ingresa un usuario válido o correo electrónico",
      },
    ),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
})

export const forgotPasswordSchema = z.object({
  username: z
    .string()
    .min(1, "El usuario es requerido")
    .refine(
      (value) => {
        // Validar si es email o username
        const isEmail = z.string().email().safeParse(value).success
        const isUsername = value.length >= 3
        return isEmail || isUsername
      },
      {
        message: "Ingresa un usuario válido o correo electrónico",
      },
    ),
})

export const registerSchema = z
  .object({
    document_type_id: z.string().optional(),
    identification_number: z
      .string()
      .min(9, "El número de identificación debe tener al menos 9 caracteres")
      .regex(/^[0-9-]+$/, "El número de identificación solo puede contener números y guiones"),
    first_name: z
      .string()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El nombre solo puede contener letras"),
    last_name: z
      .string()
      .min(2, "El apellido debe tener al menos 2 caracteres")
      .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El apellido solo puede contener letras"),
    email: z.string().email("Correo electrónico inválido").optional().or(z.literal("")),
    phone: z
      .string()
      .regex(/^[0-9-]*$/, "El teléfono solo puede contener números y guiones")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => {
      // Al menos uno de los dos debe estar presente
      return !!data.email || !!data.phone
    },
    {
      message: "Debes proporcionar al menos un método de contacto (correo electrónico o teléfono)",
      path: ["contact"], // Este error se mostrará de forma general
    },
  )

export type LoginFormData = z.infer<typeof loginSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
