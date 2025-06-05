// src/lib/types/auth.ts
export interface AuthUser {
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
  created_at: string
  updated_at: string
}
