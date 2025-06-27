import type { CollaboratorSummary, MockCurrentUser, CompanyOptionForInvitation } from "@/lib/types/collaborator"
import type { RoleInfo } from "@/lib/types/user"

export const ALL_ROLES_INFO: RoleInfo[] = [
    {
        id: "role_moderator",
        name: "Moderador",
        key: "moderator",
        description: "Modera contenido y usuarios.",
        level: 1,
        permissions: ["manage_users", "view_reports"],
    },
    {
        id: "role_company_owner",
        name: "Propietario",
        key: "company_owner",
        description: "Dueño de una o más empresas.",
        level: 2,
        permissions: ["manage_company", "invite_admins"],
    },
    {
        id: "role_company_admin",
        name: "Admin Empresa",
        key: "company_admin",
        description: "Administra una empresa específica.",
        level: 3,
        permissions: ["manage_company_staff", "view_company_reports"],
    },
    {
        id: "role_delivery_point_admin",
        name: "Admin PdE",
        key: "delivery_point_admin",
        description: "Administra un punto de entrega.",
        level: 4,
        permissions: ["manage_delivery_point_staff", "view_dp_reports"],
    },
    {
        id: "role_operator",
        name: "Operador",
        key: "operator",
        description: "Operario en un punto de entrega.",
        level: 5,
        permissions: ["process_orders"],
    },
]

export const MOCK_COMPANIES_FOR_INVITATION: CompanyOptionForInvitation[] = [
    {
        id: "company_alpha_123",
        trade_name: "Alpha Corp",
        delivery_points: [
            { id: "dp_alpha_a", name: "Sucursal Centro Alpha", address: 'Mock de adress', active: true},
            { id: "dp_alpha_b", name: "Depósito Norte Alpha", address: 'Mock de adress', active: true },
        ],
    },
    {
        id: "company_beta_456",
        trade_name: "Beta Solutions",
        delivery_points: [{ id: "dp_beta_x", name: "Punto Beta Principal", address: 'Mock de adress', active: true }],
    },
    {
        id: "company_gamma_789",
        trade_name: "Gamma Logistics",
        delivery_points: [
            { id: "dp_gamma_1", name: "Hub Gamma Este", address: 'Mock de adress', active: true },
            { id: "dp_gamma_2", name: "Almacén Gamma Oeste", address: 'Mock de adress', active: true },
            { id: "dp_gamma_3", name: "Centro Distribución Gamma Sur", address: 'Mock de adress', active: true },
        ],
    },
]

// Simulación de diferentes usuarios logueados
export const CURRENT_USER_AS_OWNER: MockCurrentUser = {
    id: "user_owner_001",
    first_name: "Ana",
    last_name: "Dueña",
    email: "ana.dueña@example.com",
    role: ALL_ROLES_INFO.find((r) => r.key === "company_owner")!,
    accessible_companies: [MOCK_COMPANIES_FOR_INVITATION[0], MOCK_COMPANIES_FOR_INVITATION[1]],
}

export const CURRENT_USER_AS_COMPANY_ADMIN: MockCurrentUser = {
    id: "user_admin_002",
    first_name: "Carlos",
    last_name: "Admin",
    email: "carlos.admin@example.com",
    role: ALL_ROLES_INFO.find((r) => r.key === "company_admin")!,
    accessible_companies: [MOCK_COMPANIES_FOR_INVITATION[0]],
}

export const CURRENT_USER_AS_DP_ADMIN: MockCurrentUser = {
    id: "user_dp_admin_003",
    first_name: "Luisa",
    last_name: "SupervisoraDP",
    email: "luisa.dp@example.com",
    role: ALL_ROLES_INFO.find((r) => r.key === "delivery_point_admin")!,
    accessible_companies: [MOCK_COMPANIES_FOR_INVITATION[1]],
}

const avatar_var = "/placeholder.svg?width=40&height=40"

export const MOCK_COLLABORATORS: CollaboratorSummary[] = [
    {
        id: "collab_1",
        avatar_url: avatar_var,
        first_name: "Juan",
        last_name: "Pérez",
        username: "juan.perez",
        phone: "+54 11 1234-5678",
        email: "juan.perez@example.com",
        role: ALL_ROLES_INFO.find((r) => r.key === "company_admin")!,
        companies: [
            {
                id: "company_alpha_123",
                name: "Alpha Corp",
                role_in_company: ALL_ROLES_INFO.find((r) => r.key === "company_admin")!,
            },
        ],
        primary_company_name: "Alpha Corp",
        status: "active",
        verified: true,
        created_at: new Date(2023, 0, 15).toISOString(),
    },
    {
        id: "collab_2",
        avatar_url: "/placeholder.svg?width=40&height=40",
        first_name: "Maria",
        last_name: "González",
        username: "maria.gonzalez",
        phone: "+54 11 2345-6789",
        email: "maria.gonzalez@example.com",
        role: ALL_ROLES_INFO.find((r) => r.key === "delivery_point_admin")!,
        companies: [
            {
                id: "company_alpha_123",
                name: "Alpha Corp",
                role_in_company: ALL_ROLES_INFO.find((r) => r.key === "delivery_point_admin")!,
            },
        ],
        primary_company_name: "Alpha Corp",
        status: "active",
        verified: true,
        created_at: new Date(2023, 1, 20).toISOString(),
    },
    {
        id: "collab_3",
        avatar_url: "/placeholder.svg?width=40&height=40",
        first_name: "Carlos",
        last_name: "López",
        username: "carlos.lopez",
        phone: "+54 11 3456-7890",
        email: "carlos.lopez@example.com",
        role: ALL_ROLES_INFO.find((r) => r.key === "operator")!,
        companies: [
            {
                id: "company_beta_456",
                name: "Beta Solutions",
                role_in_company: ALL_ROLES_INFO.find((r) => r.key === "operator")!,
            },
        ],
        primary_company_name: "Beta Solutions",
        status: "inactive",
        verified: false,
        created_at: new Date(2023, 2, 10).toISOString(),
    },
    {
        id: "collab_4",
        first_name: "Laura",
        last_name: "Martínez",
        avatar_url: avatar_var,
        username: "laura.martinez",
        phone: "+54 11 4567-8901",
        email: "laura.martinez@example.com",
        role: ALL_ROLES_INFO.find((r) => r.key === "company_owner")!,
        companies: [
            {
                id: "company_gamma_789",
                name: "Gamma Logistics",
                role_in_company: ALL_ROLES_INFO.find((r) => r.key === "company_owner")!,
            },
        ],
        primary_company_name: "Gamma Logistics",
        status: "active",
        verified: true,
        created_at: new Date(2022, 11, 5).toISOString(),
    },
    {
        id: "collab_5",
        avatar_url: "/placeholder.svg?width=40&height=40",
        first_name: "Pedro",
        last_name: "Sánchez",
        username: "pedro.sanchez",
        phone: "+54 11 5678-9012",
        email: "pedro.sanchez@example.com",
        role: ALL_ROLES_INFO.find((r) => r.key === "operator")!,
        companies: [
            {
                id: "company_alpha_123",
                name: "Alpha Corp",
                role_in_company: ALL_ROLES_INFO.find((r) => r.key === "operator")!,
            },
        ],
        primary_company_name: "Alpha Corp",
        status: "under_review",
        verified: false,
        created_at: new Date(2023, 3, 1).toISOString(),
    },
    {
        id: "collab_6",
        avatar_url: "/placeholder.svg?width=40&height=40",
        first_name: "Ana",
        last_name: "Martín",
        username: "ana.martin",
        phone: "+54 11 6789-0123",
        email: "ana.martin@example.com",
        role: ALL_ROLES_INFO.find((r) => r.key === "moderator")!,
        companies: [],
        primary_company_name: "Sistema",
        status: "active",
        verified: true,
        created_at: new Date(2023, 4, 12).toISOString(),
    },
]
