"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table"
import { Badge } from "@/Components/ui/badge"
import { Button } from "@/Components/ui/button"
import type { Package } from "@/lib/types/package"
import { MoreHorizontal, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, PackageSearch } from 'lucide-react'
import Image from "next/image"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/Components/ui/dropdown-menu"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
// import PackageSearch from "@/Components/ui/package-search" // Declared the PackageSearch component

interface PackageTableProps {
    packages: Package[]
}

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20, 50]

export function PackageTable({ packages }: PackageTableProps) {
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE_OPTIONS[1])

    const totalPages = Math.ceil(packages.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
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
        if (amount === undefined || amount === null) return "-"
        return new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC" }).format(amount)
    }

    const getStatusBadgeVariant = (
        statusName?: Package["statusName"],
    ): "default" | "secondary" | "destructive" | "outline" => {
        switch (statusName) {
            case "Entregado":
                return "default" // Verde (shadcn default es azulado, se puede customizar)
            case "Pendiente":
                return "secondary" // Amarillo/Naranja
            case "Devuelto":
                return "destructive" // Rojo
            case "En Ruta":
                return "outline" // Azul claro
            default:
                return "outline"
        }
    }

    if (packages.length === 0) {
        return (
            <div className="text-center py-10 bg-white rounded-lg shadow border">
                <PackageSearch className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700">No hay paquetes para mostrar</h3>
                <p className="text-gray-500">Intenta ajustar tus filtros o revisa más tarde.</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-lg shadow-md border overflow-hidden">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead className="whitespace-nowrap">ID Paquete/Orden</TableHead>
                            <TableHead className="whitespace-nowrap">Punto de Entrega</TableHead>
                            <TableHead className="whitespace-nowrap">Fecha Recepción</TableHead>
                            <TableHead className="whitespace-nowrap">Destinatario</TableHead>
                            <TableHead className="whitespace-nowrap">Remitente</TableHead>
                            <TableHead className="whitespace-nowrap">Courier</TableHead>
                            <TableHead className="whitespace-nowrap">Estado</TableHead>
                            <TableHead className="whitespace-nowrap text-right">Cobro</TableHead>
                            <TableHead className="text-center">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentPackages.map((pkg) => (
                            <TableRow key={pkg.idPackage} className="hover:bg-gray-50">
                                <TableCell className="font-medium text-blue-600 hover:underline cursor-pointer whitespace-nowrap">
                                    {pkg.package_number}
                                </TableCell>
                                <TableCell className="whitespace-nowrap">{pkg.pdeName || pkg.PDE_Id}</TableCell>
                                <TableCell className="whitespace-nowrap">{formatDate(pkg.received_at)}</TableCell>
                                <TableCell className="whitespace-nowrap">{pkg.recipient_name}</TableCell>
                                <TableCell className="whitespace-nowrap">{pkg.Merchant}</TableCell>
                                <TableCell className="whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        {pkg.courierLogo && (
                                            <Image
                                                src={pkg.courierLogo || "/placeholder.svg"}
                                                alt={pkg.courierName || "Courier"}
                                                width={20}
                                                height={20}
                                                className="rounded-sm"
                                            />
                                        )}
                                        <span>{pkg.courierName || `ID: ${pkg.FKid_courier}`}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={getStatusBadgeVariant(pkg.statusName)}
                                        className={
                                            pkg.statusName === "Entregado"
                                                ? "bg-green-100 text-green-700 border-green-300"
                                                : pkg.statusName === "Pendiente"
                                                    ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                                                    : pkg.statusName === "Devuelto"
                                                        ? "bg-red-100 text-red-700 border-red-300"
                                                        : pkg.statusName === "En Ruta"
                                                            ? "bg-blue-100 text-blue-700 border-blue-300"
                                                            : ""
                                        }
                                    >
                                        {pkg.statusName || `ID: ${pkg.FKid_packageStatus}`}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right whitespace-nowrap">{formatCurrency(pkg.charge_amount)}</TableCell>
                                <TableCell className="text-center">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
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
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            {/* Paginación */}
            <div className="flex items-center justify-between px-4 py-3 border-t">
                <div className="text-sm text-gray-700">
                    Mostrando {Math.min(startIndex + 1, packages.length)} a {Math.min(endIndex, packages.length)} de{" "}
                    {packages.length} paquetes
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 mr-2">Filas por página:</span>
                    <Select
                        value={itemsPerPage.toString()}
                        onValueChange={(value) => {
                            setItemsPerPage(Number(value))
                            setCurrentPage(1) // Reset to first page on changing items per page
                        }}
                    >
                        <SelectTrigger className="w-20 h-8 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option.toString()} className="text-xs">
                                    {option}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronsLeft className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>
                    <span className="text-sm text-gray-700">
                        Página {currentPage} de {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronsRight className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
