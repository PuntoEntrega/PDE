import type { Package } from "@/lib/types/package"

const today = new Date()
const yesterday = new Date(today)
yesterday.setDate(today.getDate() - 1)
const twoDaysAgo = new Date(today)
twoDaysAgo.setDate(today.getDate() - 2)
const threeDaysAgo = new Date(today)
threeDaysAgo.setDate(today.getDate() - 3)

export const MOCK_PACKAGES: Package[] = [
    {
        idPackage: "pkg_000001",
        PDE_Id: "pde_super_pueblo",
        pdeName: "1 - Super El Pueblo",
        package_number: "000001",
        FKid_courier: 1,
        courierName: "Moovin",
        courierLogo: "/placeholder.svg?width=30&height=30",
        recipient_name: "Esteban Artavia Rodríguez",
        Merchant: "Tiendamia",
        FKid_packageStatus: 2, // Entregado
        statusName: "Entregado",
        charge_amount: 3500,
        received_at: threeDaysAgo.toISOString(),
        delivered_at: yesterday.toISOString(),
        created_at: threeDaysAgo.toISOString(),
        updated_at: yesterday.toISOString(),
    },
    {
        idPackage: "pkg_000002",
        PDE_Id: "pde_super_pueblo",
        pdeName: "1 - Super El Pueblo",
        package_number: "000002",
        FKid_courier: 2,
        courierName: "Amazon Logistics",
        courierLogo: "/placeholder.svg?width=30&height=30",
        recipient_name: "Sofía Rodríguez Morales",
        Merchant: "Amazon",
        FKid_packageStatus: 1, // Pendiente
        statusName: "Pendiente",
        charge_amount: 0,
        received_at: twoDaysAgo.toISOString(),
        created_at: twoDaysAgo.toISOString(),
        updated_at: twoDaysAgo.toISOString(),
    },
    {
        idPackage: "pkg_A00003",
        PDE_Id: "pde_super_pueblo",
        pdeName: "1 - Super El Pueblo",
        package_number: "A00003",
        FKid_courier: 3,
        courierName: "Correos CR",
        courierLogo: "/placeholder.svg?width=30&height=30",
        recipient_name: "Valentina Rodríguez de la Cruz García",
        Merchant: "Wish",
        FKid_packageStatus: 2, // Entregado
        statusName: "Entregado",
        charge_amount: 35150,
        received_at: twoDaysAgo.toISOString(),
        delivered_at: today.toISOString(),
        created_at: twoDaysAgo.toISOString(),
        updated_at: today.toISOString(),
    },
    {
        idPackage: "pkg_A00004",
        PDE_Id: "pde_super_amigo",
        pdeName: "2 - Super Amigo",
        package_number: "A00004",
        FKid_courier: 4,
        courierName: "DHL",
        courierLogo: "/placeholder.svg?width=30&height=30",
        recipient_name: "Benjamín Fernández Soto del Rosario",
        Merchant: "Omnilife",
        FKid_packageStatus: 2, // Entregado
        statusName: "Entregado",
        charge_amount: 21100,
        received_at: threeDaysAgo.toISOString(),
        delivered_at: yesterday.toISOString(),
        created_at: threeDaysAgo.toISOString(),
        updated_at: yesterday.toISOString(),
    },
    {
        idPackage: "pkg_000006",
        PDE_Id: "pde_abastecedor_rr",
        pdeName: "3 - Abastecedor RR",
        package_number: "000006",
        FKid_courier: 1,
        courierName: "Moovin",
        courierLogo: "/placeholder.svg?width=30&height=30",
        recipient_name: "Sofía Rodríguez Morales",
        Merchant: "Amazon",
        FKid_packageStatus: 1, // Pendiente
        statusName: "Pendiente",
        charge_amount: 0,
        received_at: yesterday.toISOString(),
        created_at: yesterday.toISOString(),
        updated_at: yesterday.toISOString(),
    },
    {
        idPackage: "pkg_000007",
        PDE_Id: "pde_abastecedor_rr",
        pdeName: "3 - Abastecedor RR",
        package_number: "000007",
        FKid_courier: 1,
        courierName: "Moovin",
        courierLogo: "/placeholder.svg?width=30&height=30",
        recipient_name: "Gabriela Navarro López de la Vega",
        Merchant: "Amazon",
        FKid_packageStatus: 3, // Devuelto
        statusName: "Devuelto",
        charge_amount: 0,
        received_at: threeDaysAgo.toISOString(),
        delivered_at: yesterday.toISOString(), // Fecha de intento de entrega o devolución
        created_at: threeDaysAgo.toISOString(),
        updated_at: yesterday.toISOString(),
    },
    {
        idPackage: "pkg_000008",
        PDE_Id: "pde_abastecedor_rr",
        pdeName: "3 - Abastecedor RR",
        package_number: "000008",
        FKid_courier: 1,
        courierName: "Moovin",
        courierLogo: "/placeholder.svg?width=30&height=30",
        recipient_name: "Valentina Santos Ramírez",
        Merchant: "Moovin",
        FKid_packageStatus: 1, // Pendiente
        statusName: "Pendiente",
        charge_amount: 0,
        received_at: today.toISOString(),
        created_at: today.toISOString(),
        updated_at: today.toISOString(),
    },
]
