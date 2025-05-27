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

export type LoginFormData = z.infer<typeof loginSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
