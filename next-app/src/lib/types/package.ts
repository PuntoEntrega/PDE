export interface Package {
    idPackage: string
    PDE_Id: string // Se necesitará un lookup para el nombre del PdE
    pdeName?: string // Nombre del PdE (obtenido del lookup)
    package_number: string // Asumimos que package_number (JSON en DB) se resuelve a un string visible
    FKid_courier: number // Se necesitará un lookup para el nombre del Courier
    courierName?: string // Nombre del Courier
    courierLogo?: string // URL del logo del Courier
    recipient_name: string
    recipient_phone?: string
    recipient_email?: string
    size?: "XS" | "S" | "M" | "L" | "XL"
    weight?: number
    charge_amount?: number
    payment_method?: "EFECTIVO" | "TARJETA" | "SINPE"
    security_code?: string
    additional_info?: string
    FKid_packageStatus: number // Se necesitará un lookup para el texto del estado
    statusName?: "Pendiente" | "Entregado" | "Devuelto" | "En Ruta" // Texto del estado
    received_at: string // Formato ISO Date String
    delivered_at?: string // Formato ISO Date String
    created_at: string // Formato ISO Date String
    updated_at: string // Formato ISO Date String
    Merchant: string // Remitente o Tienda
}

export interface PackageFilters {
    searchTerm?: string
    status?: "Pendiente" | "Entregado" | "Todos"
    // Otros filtros que se puedan necesitar: courier, fecha, etc.
}
