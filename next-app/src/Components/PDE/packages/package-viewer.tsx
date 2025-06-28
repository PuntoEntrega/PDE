"use client"

import { useState, useMemo } from "react"
import { Input } from "@/Components/ui/input"
import { Button } from "@/Components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs"
import { PackageTable } from "./package-table"
import { PackageCards } from "./package-cards"
import type { Package } from "@/lib/types/package"
import { PlusCircle, Printer, Search, Download, Grid3X3, List } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription } from "@/Components/ui/card"

interface PackageViewerProps {
    initialPackages: Package[]
}

export function PackageViewer({ initialPackages }: PackageViewerProps) {
    const [activeTab, setActiveTab] = useState<"pendientes" | "entregados">("pendientes")
    const [searchTerm, setSearchTerm] = useState("")
    const [viewMode, setViewMode] = useState<"table" | "cards">("table")

    const filteredPackages = useMemo(() => {
        let packagesToFilter = initialPackages

        if (activeTab === "pendientes") {
            packagesToFilter = packagesToFilter.filter(
                (pkg) => pkg.statusName === "Pendiente" || pkg.statusName === "En Ruta",
            )
        } else if (activeTab === "entregados") {
            packagesToFilter = packagesToFilter.filter(
                (pkg) => pkg.statusName === "Entregado" || pkg.statusName === "Devuelto",
            )
        }

        if (searchTerm) {
            const lowerSearchTerm = searchTerm.toLowerCase()
            packagesToFilter = packagesToFilter.filter(
                (pkg) =>
                    pkg.package_number.toLowerCase().includes(lowerSearchTerm) ||
                    pkg.recipient_name.toLowerCase().includes(lowerSearchTerm) ||
                    pkg.Merchant.toLowerCase().includes(lowerSearchTerm) ||
                    pkg.pdeName?.toLowerCase().includes(lowerSearchTerm) ||
                    pkg.courierName?.toLowerCase().includes(lowerSearchTerm),
            )
        }
        return packagesToFilter
    }, [initialPackages, activeTab, searchTerm])

    return (
        <div className="space-y-6">
            <Card className="shadow-lg border-0 rounded-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-blue-50 via-slate-50 to-white p-5 sm:p-6 border-b">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800">
                                Vista General Mis Puntos de Entrega
                            </CardTitle>
                            <CardDescription className="text-sm text-gray-500 mt-1">
                                Gestiona los paquetes recibidos y entregados en tu PdE.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                <PlusCircle className="mr-2 h-4 w-4" /> Recepción de Paquetes
                            </Button>
                            <Button variant="outline">
                                <Printer className="mr-2 h-4 w-4" /> Imprimir
                            </Button>
                        </div>
                    </div>
                    <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Buscar paquete..."
                                className="pl-10 bg-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
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
                            <Button variant="outline">
                                <Download className="mr-2 h-4 w-4" /> Descargar
                            </Button>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "pendientes" | "entregados")}>
                <TabsList className="grid w-full grid-cols-2 md:w-1/2 lg:w-1/3">
                    <TabsTrigger value="pendientes">Pendientes</TabsTrigger>
                    <TabsTrigger value="entregados">Entregados y Devueltos</TabsTrigger>
                </TabsList>
                <TabsContent value="pendientes">
                    {viewMode === "table" ? (
                        <PackageTable packages={filteredPackages} />
                    ) : (
                        <PackageCards packages={filteredPackages} />
                    )}
                </TabsContent>
                <TabsContent value="entregados">
                    {viewMode === "table" ? (
                        <PackageTable packages={filteredPackages} />
                    ) : (
                        <PackageCards packages={filteredPackages} />
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
