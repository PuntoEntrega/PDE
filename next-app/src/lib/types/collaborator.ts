import type { UserRoleKey, RoleInfo } from "./user"

export interface RoleOptionForInvitation {
    id: string // ID de RoleInfo
    name: string // Nombre legible del rol
    key: UserRoleKey
    level: number
    description?: string // Descripción del rol
    create_at: string
    update_at: string
}

export interface InvitationFormData {
    email: string
    role_id: string // ID de RoleOptionForInvitation (que es el ID de RoleInfo)
    company_ids?: string[]
    delivery_point_ids?: string[]
    first_name?: string
    last_name?: string
}

export interface DeliveryPoint {
    id: string
    name: string
    active: boolean
    status: string
    location: {
        province: string
        canton: string
        district: string
    }
}

// Datos para simular el usuario logueado y sus permisos/contextos
export interface MockCurrentUser {
    id: string
    first_name: string
    last_name: string
    email: string
    role: RoleInfo // Rol global o el más alto que tenga
    // Empresas a las que el usuario actual tiene acceso para gestionar/invitar
    accessible_companies: CompanyOptionForInvitation[]
}

export interface Role {
    id: string
    name: string
    level: number
    description?: string
    create_at: string
    update_at: string
}

export interface DeliveryPoint {
    id: string
    name: string
    active: boolean
    status: string
    location: {
        province: string
        canton: string
        district: string
    }
}

export interface CompanyWithRole {
    id: string
    name: string
    role_in_company: {
        id: string
        name: string
        level: number
    }
    puntos_de_entrega?: DeliveryPoint[]
}

export interface CollaboratorSummary {
    id: string
    avatar_url: string | null
    first_name: string
    last_name: string
    username: string
    phone: string | null
    email: string
    active?: boolean
    role: {
        id: string
        name: string
        level: number
        description: string
    }
    status: "draft" | "under_review" | "active" | "inactive" | "rejected"
    verified: boolean
    created_at: string
    companies: CompanyWithRole[]
    primary_company_name?: string
}

// Tipos para invitaciones
export interface RoleOptionForInvitation {
    id: string
    name: string
    level: number
    create_at: string
    update_at: string
}

export interface CompanyOptionForInvitation {
    id: string
    trade_name: string
    delivery_points?: DeliveryPointOption[]
}

export interface DeliveryPointOption {
    id: string
    name: string
    address: string
    active: boolean
}

export interface DeliveryPointWithCompany extends DeliveryPointOption {
    company_id: string
    company_name: string
}

export interface InvitationFormData {
    email: string
    role_id: string
    company_ids?: string[]
    delivery_point_ids?: string[]
    first_name?: string
    last_name?: string
    message?: string
}


export interface Collaborator {
    id: string
    avatar_url: string | null
    first_name: string
    last_name: string
    username: string
    phone: string | null
    email: string
    role: {
        id: string
        name: string
        description: string
        level: number
    }
    companies: CompanyWithRole[]
    primary_company_name: string
    status: "active" | "inactive" | "under_review" | "draft" | "rejected"
    verified: boolean
    created_at: string
}