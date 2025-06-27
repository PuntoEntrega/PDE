// (Contenido existente de user.ts ... se asume que ya existe y es correcto)
// Agregamos o ajustamos:

export interface User {
    id: string
    document_type_id?: string
    identification_number: string
    first_name: string
    last_name: string
    username: string
    email: string
    phone?: string
    avatar_url?: string
    role_id?: string // Este será el ID de RoleInfo
    password_hash: string // No lo usaremos en el frontend directamente
    active: boolean
    status: "draft" | "under_review" | "active" | "inactive" | "rejected"
    created_at: string
    updated_at: string
    verified: boolean
    global_company_context_id?: string // ID del supervisor/manager
}

export interface RoleInfo {
    id: string // UUID del rol
    name: string // Nombre legible, ej: "Administrador de Empresa"
    key: UserRoleKey // Clave única del rol, ej: "company_admin"
    description: string
    level: number // Para la jerarquía
    permissions: string[]
}

// Claves de roles para una fácil referencia y lógica
export type UserRoleKey = "moderator" | "company_owner" | "company_admin" | "delivery_point_admin" | "operator"

export interface UserWithRelations extends User {
    DocumentType?: { id: string; name: string }
    Role?: RoleInfo // Usamos RoleInfo aquí
    CompanyContexts?: CompanyContext[] // Un usuario puede estar en múltiples contextos de empresa
    Supervisor?: { id: string; first_name: string; last_name: string; email: string; Role?: RoleInfo }
}

export interface CompanyContext {
    id: string // ID del contexto (podría ser una tabla de unión UserCompanyRole)
    company: {
        id: string
        name: string // Nombre fantasia
        business_name: string // Razón social
        logo_url?: string
        delivery_points: DeliveryPoint[]
    }
    role_in_company: RoleInfo // El rol específico del usuario EN ESTA EMPRESA
    is_primary_context?: boolean // Si es el contexto por defecto del usuario
}

export interface DeliveryPoint {
    id: string
    name: string
    address: string
    company_id: string
}

export interface UserProfileFormData {
    first_name: string
    last_name: string
    username: string
    email: string
    phone?: string
    identification_number: string
    document_type_id?: string
}
