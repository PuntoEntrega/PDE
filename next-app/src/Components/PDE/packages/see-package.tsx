"use client"

import { useState } from "react"
import { Card, CardContent } from "@/Components/ui/card"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs"
import { Badge } from "@/Components/ui/badge"
import {
    Search,
    Eye,
    MoreHorizontal,
    PackageCheck,
    Clock,
    CheckCircle,
    XCircle,
    User,
    Building,
    Truck,
    Calendar,
    DollarSign,
    ArrowLeft,
    Grid3X3,
    List,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/Components/ui/dropdown-menu"
import type { Package } from "@/lib/types/package"
import Image from "next/image"
import Link from "next/link"
import { PackageTable } from "./package-table"

interface VerPaquetesClientProps {
    packages: Package[]
}

export function VerPaquetesClient({ packages }: VerPaquetesClientProps) {
    const [activeTab, setActiveTab] = useState<"pendientes" | "entregados">("pendientes")
    const [searchTerm, setSearchTerm] = useState("")
    const [searchInput, setSearchInput] = useState("")
    const [viewMode, setViewMode] = useState<"table" | "cards">("cards")

    const handleSearch = () => {
        setSearchTerm(searchInput)
    }

    const filteredPackages = packages.filter((pkg) => {
        // Filtrar por tab
        const tabFilter =
            activeTab === "pendientes"
                ? pkg.statusName === "Pendiente" || pkg.statusName === "En Ruta"
                : pkg.statusName === "Entregado" || pkg.statusName === "Devuelto"

        // Filtrar por búsqueda
        const searchFilter =
            !searchTerm ||
            pkg.package_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pkg.recipient_name.toLowerCase().includes(searchTerm.toLowerCase())

        return tabFilter && searchFilter
    })

    return (
        <div className="p-6 bg-gray-50 min-h-full">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <Eye className="h-8 w-8 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Vista General Mis Puntos de Entrega</h1>
                            <p className="text-gray-600">Gestiona todos los paquetes de tu punto de entrega</p>
                        </div>
                    </div>

                    {/* Búsqueda y controles */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex gap-3 w-full sm:w-auto">
                            <div className="flex-1 sm:w-80">
                                <Input
                                    placeholder="Buscar por ID de paquete o nombre del destinatario..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                                />
                            </div>
                            <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
                                <Search className="h-4 w-4 mr-2" />
                                Buscar
                            </Button>
                        </div>

                        {/* Selector de vista */}
                        <div className="flex items-center bg-gray-100 rounded-lg p-1">
                            <Button
                                variant={viewMode === "table" ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setViewMode("table")}
                                className={`h-8 px-3 ${viewMode === "table" ? "bg-white shadow-sm" : ""}`}
                            >
                                <List className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === "cards" ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setViewMode("cards")}
                                className={`h-8 px-3 ${viewMode === "cards" ? "bg-white shadow-sm" : ""}`}
                            >
                                <Grid3X3 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Tabs y contenido */}
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "pendientes" | "entregados")}>
                    <TabsList className="grid w-full grid-cols-2 md:w-1/2">
                        <TabsTrigger value="pendientes" className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Pendientes
                        </TabsTrigger>
                        <TabsTrigger value="entregados" className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Entregados
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="pendientes" className="space-y-4">
                        <div className="bg-white rounded-lg shadow-sm border p-4">
                            <h3 className="font-semibold text-gray-900 mb-4">Paquetes Pendientes ({filteredPackages.length})</h3>
                            {viewMode === "table" ? (
                                <PackageTable packages={filteredPackages} />
                            ) : (
                                <PackageGrid packages={filteredPackages} />
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="entregados" className="space-y-4">
                        <div className="bg-white rounded-lg shadow-sm border p-4">
                            <h3 className="font-semibold text-gray-900 mb-4">
                                Paquetes Entregados y Devueltos ({filteredPackages.length})
                            </h3>
                            {viewMode === "table" ? (
                                <PackageTable packages={filteredPackages} />
                            ) : (
                                <PackageGrid packages={filteredPackages} />
                            )}
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Botón de regreso */}
                <div className="flex justify-start">
                    <Button variant="outline" asChild>
                        <Link href="/pde/paquetes">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver a Funciones PdE
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}

function PackageGrid({ packages }: { packages: Package[] }) {
    const getStatusConfig = (statusName?: Package["statusName"]) => {
        switch (statusName) {
            case "Entregado":
                return {
                    icon: CheckCircle,
                    bgColor: "bg-green-100",
                    textColor: "text-green-800",
                    borderColor: "border-green-300",
                }
            case "Pendiente":
                return {
                    icon: Clock,
                    bgColor: "bg-amber-100",
                    textColor: "text-amber-800",
                    borderColor: "border-amber-300",
                }
            case "Devuelto":
                return {
                    icon: XCircle,
                    bgColor: "bg-red-100",
                    textColor: "text-red-800",
                    borderColor: "border-red-300",
                }
            case "En Ruta":
                return {
                    icon: Truck,
                    bgColor: "bg-blue-100",
                    textColor: "text-blue-800",
                    borderColor: "border-blue-300",
                }
            default:
                return {
                    icon: Clock,
                    bgColor: "bg-gray-100",
                    textColor: "text-gray-800",
                    borderColor: "border-gray-300",
                }
        }
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return "-"
        return new Date(dateString).toLocaleDateString("es-CR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        })
    }

    const formatCurrency = (amount?: number) => {
        if (amount === undefined || amount === null || amount === 0) return "Gratis"
        return new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC" }).format(amount)
    }

    if (packages.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full p-6 w-fit mx-auto mb-4">
                    <PackageCheck className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No hay paquetes</h3>
                <p className="text-gray-500">No se encontraron paquetes con los criterios de búsqueda.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.map((pkg) => {
                const statusConfig = getStatusConfig(pkg.statusName)
                const StatusIcon = statusConfig.icon

                return (
                    <Card key={pkg.idPackage} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                            {/* Header con estado */}
                            <div className="flex items-center justify-between mb-3">
                                <Badge
                                    className={`${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor} border`}
                                >
                                    <StatusIcon className="h-3 w-3 mr-1" />
                                    {pkg.statusName}
                                </Badge>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>Ver Detalles</DropdownMenuItem>
                                        {pkg.statusName === "Pendiente" && <DropdownMenuItem>Entregar Paquete</DropdownMenuItem>}
                                        <DropdownMenuItem>Imprimir Etiqueta</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Número de paquete */}
                            <h3 className="text-lg font-bold text-blue-600 mb-3">#{pkg.package_number}</h3>

                            {/* Información */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <User className="h-4 w-4 text-gray-400" />
                                    <span className="font-medium truncate">{pkg.recipient_name}</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                    <Building className="h-4 w-4 text-gray-400" />
                                    <span className="truncate">{pkg.Merchant}</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                    <Truck className="h-4 w-4 text-gray-400" />
                                    <div className="flex items-center gap-1 flex-1 min-w-0">
                                        {pkg.courierLogo && (
                                            <Image
                                                src={pkg.courierLogo || "/placeholder.svg"}
                                                alt={pkg.courierName || "Courier"}
                                                width={16}
                                                height={16}
                                                className="rounded-sm"
                                            />
                                        )}
                                        <span className="truncate">{pkg.courierName}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <span>{formatDate(pkg.received_at)}</span>
                                </div>
                            </div>

                            {/* Footer con precio */}
                            <div className="flex items-center justify-between mt-4 pt-3 border-t">
                                <div className="flex items-center gap-1">
                                    <DollarSign className="h-4 w-4 text-green-600" />
                                    <span className="font-semibold text-green-600">{formatCurrency(pkg.charge_amount)}</span>
                                </div>
                                <span className="text-xs text-gray-500">{pkg.pdeName}</span>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
