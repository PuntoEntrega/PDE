//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 1.
// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 2. Login Schema
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

interface SessionPayload {
  sub: string
  role: string
  document_type_id: string
  identification_number: string
  first_name: string
  last_name: string
  username: string
  email: string
  phone: string
  avatar_url: string
  active: boolean
  verified: boolean
  created_at: string | Date
  updated_at: string | Date
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return null

  const JWT_SECRET = process.env.JWT_SECRET
  if (!JWT_SECRET) throw new Error("❌ JWT_SECRET no definido")

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded as SessionPayload
  } catch (err) {
    console.error("❌ Sesión inválida:", err)
    return null
  }
}
