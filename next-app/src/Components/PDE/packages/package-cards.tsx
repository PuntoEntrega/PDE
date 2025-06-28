"use client"

import { Card, CardContent } from "@/Components/ui/card"
import { Badge } from "@/Components/ui/badge"
import { Button } from "@/Components/ui/button"
import type { Package } from "@/lib/types/package"
import {
    MoreHorizontal,
    PackageSearch,
    Calendar,
    User,
    Building,
    Truck,
    Clock,
    CheckCircle,
    AlertCircle,
    XCircle,
    DollarSign,
} from "lucide-react"
import Image from "next/image"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/Components/ui/dropdown-menu"
import { useState } from "react"
import { cn } from "../../../../lib/utils"

interface PackageCardsProps {
    packages: Package[]
}

const ITEMS_PER_PAGE = 12

export function PackageCards({ packages }: PackageCardsProps) {
    const [currentPage, setCurrentPage] = useState(1)

    const totalPages = Math.ceil(packages.length / ITEMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    const currentPackages = packages.slice(startIndex, endIndex)

    const formatDate = (dateString?: string) => {
        if (!dateString) return "-"
        return new Date(dateString).toLocaleDateString("es-CR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        })
    }

    const formatCurrency = (amount?: number) => {
        if (amount === undefined || amount === null) return "Gratis"
        return new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC" }).format(amount)
    }

    const getStatusConfig = (statusName?: Package["statusName"]) => {
        switch (statusName) {
            case "Entregado":
                return {
                    icon: CheckCircle,
                    bgColor: "bg-emerald-50",
                    borderColor: "border-emerald-200",
                    textColor: "text-emerald-700",
                    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
                    iconColor: "text-emerald-600",
                }
            case "Pendiente":
                return {
                    icon: Clock,
                    bgColor: "bg-amber-50",
                    borderColor: "border-amber-200",
                    textColor: "text-amber-700",
                    badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
                    iconColor: "text-amber-600",
                }
            case "Devuelto":
                return {
                    icon: XCircle,
                    bgColor: "bg-red-50",
                    borderColor: "border-red-200",
                    textColor: "text-red-700",
                    badgeColor: "bg-red-100 text-red-800 border-red-300",
                    iconColor: "text-red-600",
                }
            case "En Ruta":
                return {
                    icon: Truck,
                    bgColor: "bg-blue-50",
                    borderColor: "border-blue-200",
                    textColor: "text-blue-700",
                    badgeColor: "bg-blue-100 text-blue-800 border-blue-300",
                    iconColor: "text-blue-600",
                }
            default:
                return {
                    icon: AlertCircle,
                    bgColor: "bg-gray-50",
                    borderColor: "border-gray-200",
                    textColor: "text-gray-700",
                    badgeColor: "bg-gray-100 text-gray-800 border-gray-300",
                    iconColor: "text-gray-600",
                }
        }
    }

    if (packages.length === 0) {
        return (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border">
                <div className="bg-gray-100 rounded-full p-6 w-fit mx-auto mb-6">
                    <PackageSearch className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay paquetes para mostrar</h3>
                <p className="text-gray-500">Intenta ajustar tus filtros o revisa más tarde.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentPackages.map((pkg) => {
                    const statusConfig = getStatusConfig(pkg.statusName)
                    const StatusIcon = statusConfig.icon

                    return (
                        <Card
                            key={pkg.idPackage}
                            className={cn(
                                "group hover:shadow-xl transition-all duration-300 border-2 hover:scale-[1.02] cursor-pointer overflow-hidden",
                                statusConfig.borderColor,
                                statusConfig.bgColor,
                            )}
                        >
                            {/* Header con estado y acciones */}
                            <div className="p-4 pb-0">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className={cn("p-1.5 rounded-lg", statusConfig.bgColor)}>
                                            <StatusIcon className={cn("h-4 w-4", statusConfig.iconColor)} />
                                        </div>
                                        <Badge className={cn("text-xs font-medium", statusConfig.badgeColor)}>
                                            {pkg.statusName || `ID: ${pkg.FKid_packageStatus}`}
                                        </Badge>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>Ver Detalles</DropdownMenuItem>
                                            <DropdownMenuItem>Editar Paquete</DropdownMenuItem>
                                            <DropdownMenuItem>Imprimir Etiqueta</DropdownMenuItem>
                                            {pkg.statusName === "Pendiente" && <DropdownMenuItem>Marcar como Entregado</DropdownMenuItem>}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {/* Número de paquete destacado */}
                                <div className="mb-4">
                                    <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                                        #{pkg.package_number}
                                    </h3>
                                    <p className="text-sm text-gray-500 font-medium">{pkg.pdeName || pkg.PDE_Id}</p>
                                </div>
                            </div>

                            <CardContent className="p-4 pt-0 space-y-4">
                                {/* Información principal */}
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="bg-white rounded-lg p-2 shadow-sm">
                                            <User className="h-4 w-4 text-gray-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{pkg.recipient_name}</p>
                                            <p className="text-xs text-gray-500">Destinatario</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="bg-white rounded-lg p-2 shadow-sm">
                                            <Building className="h-4 w-4 text-gray-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{pkg.Merchant}</p>
                                            <p className="text-xs text-gray-500">Remitente</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="bg-white rounded-lg p-2 shadow-sm">
                                            <Truck className="h-4 w-4 text-gray-600" />
                                        </div>
                                        <div className="flex-1 min-w-0 flex items-center gap-2">
                                            {pkg.courierLogo && (
                                                <Image
                                                    src={pkg.courierLogo || "/placeholder.svg"}
                                                    alt={pkg.courierName || "Courier"}
                                                    width={20}
                                                    height={20}
                                                    className="rounded-sm flex-shrink-0"
                                                />
                                            )}
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {pkg.courierName || `ID: ${pkg.FKid_courier}`}
                                                </p>
                                                <p className="text-xs text-gray-500">Courier</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer con fecha y precio */}
                                <div className="pt-3 border-t border-gray-200/60">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Calendar className="h-4 w-4" />
                                            <span className="text-sm">{formatDate(pkg.received_at)}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <DollarSign className="h-4 w-4 text-green-600" />
                                            <span
                                                className={cn(
                                                    "text-sm font-semibold",
                                                    pkg.charge_amount && pkg.charge_amount > 0 ? "text-green-600" : "text-gray-500",
                                                )}
                                            >
                                                {formatCurrency(pkg.charge_amount)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Paginación mejorada */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm border">
                    <div className="text-sm text-gray-700">
                        Mostrando {Math.min(startIndex + 1, packages.length)} a {Math.min(endIndex, packages.length)} de{" "}
                        {packages.length} paquetes
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="h-9"
                        >
                            Anterior
                        </Button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const pageNum = i + 1
                                return (
                                    <Button
                                        key={pageNum}
                                        variant={currentPage === pageNum ? "default" : "ghost"}
                                        size="sm"
                                        onClick={() => setCurrentPage(pageNum)}
                                        className="h-9 w-9"
                                    >
                                        {pageNum}
                                    </Button>
                                )
                            })}
                            {totalPages > 5 && <span className="text-gray-400">...</span>}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="h-9"
                        >
                            Siguiente
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
