"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { ALL_ROLES_INFO } from "@/lib/mock-data/collaborators-mock"
import { CollaboratorCard } from "./collaborators-card"
import { CollaboratorsTable } from "./collaborators-table"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Badge } from "@/Components/ui/badge"
import { Skeleton } from "@/Components/ui/skeleton"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/Components/ui/collapsible"
import { Separator } from "@/Components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/Components/ui/tooltip"
import {
    Users,
    UserPlus,
    Search,
    Filter,
    SlidersHorizontal,
    RefreshCw,
    AlertCircle,
    Grid3X3,
    List,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    ChevronDown,
    Download,
    Settings,
    BarChart3,
} from "lucide-react"
import { Sidebar } from "../Sidebar/Sidebar"
import { useEffect } from "react"
import { getCollaborators, getCollaboratorFilters } from "@/Services/collaborators"
import { Collaborator } from "@/lib/types/collaborator"

const ITEMS_PER_PAGE = 6

export function CollaboratorsList() {
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [filter, setFilter] = useState("all")
    const [roleFilter, setRoleFilter] = useState("all")
    const [statusFilter, setStatusFilter] = useState("all")
    const [sortBy, setSortBy] = useState("name")
    const [error, setError] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE)
    const [filterOptions, setFilterOptions] = useState<{
        roles: { id: string; name: string; level: number }[]
        statuses: string[]
        companies: { id: string; name: string }[]
    } | null>(null)

    const [collaborators, setCollaborators] = useState<Collaborator[]>([])

    useEffect(() => {
        const loadData = async () => {
            setLoading(true)
            setError(null)
            try {
                const [collaboratorsData, filtersData] = await Promise.all([
                    getCollaborators(),
                    getCollaboratorFilters()
                ])
                setCollaborators(collaboratorsData)
                console.log("colaboradores data", collaboratorsData);

                setFilterOptions(filtersData)
            } catch (err: any) {
                setError(err.message || "Error al cargar colaboradores o filtros")
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [])

    useEffect(() => {
        if (!loading) {
            console.log("🔍 Colaboradores cargados:", collaborators)
        }
    }, [collaborators, loading])

    

    const filteredCollaborators = useMemo(() => {
        return collaborators.filter((collaborator) => {
            const nameMatches = `${collaborator.first_name || ""} ${collaborator.last_name || ""}`
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
            const emailMatches = (collaborator.email || "").toLowerCase().includes(searchTerm.toLowerCase())
            const usernameMatches = (collaborator.username || "").toLowerCase().includes(searchTerm.toLowerCase())

            const roleMatches = roleFilter === "all" || collaborator.role.id === roleFilter
            const statusMatches = statusFilter === "all" || collaborator.status === statusFilter
            const companyMatches = filter === "all" || collaborator.primary_company_name === filter

            return (nameMatches || emailMatches || usernameMatches) && roleMatches && statusMatches && companyMatches
        }).sort((a, b) => {
            if (sortBy === "name") {
                return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)
            } else if (sortBy === "email") {
                return a.email.localeCompare(b.email)
            } else if (sortBy === "role") {
                return a.role.name.localeCompare(b.role.name)
            }
            return 0
        })
    }, [collaborators, searchTerm, roleFilter, statusFilter, filter, sortBy])

    // Paginación
    const totalPages = Math.ceil(filteredCollaborators.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentCollaborators = filteredCollaborators.slice(startIndex, endIndex)

    // Reset página cuando cambian los filtros
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, filter, roleFilter, statusFilter, sortBy, itemsPerPage])

    const handleRefresh = () => {
        setLoading(true)
        setTimeout(() => setLoading(false), 1000) // Simular carga
    }

    const stats = useMemo(() => {
        const total = collaborators.length
        const active = collaborators.filter((c) => c.status === "active").length
        const pending = collaborators.filter((c) => c.status === "under_review").length
        const verified = collaborators.filter((c) => c.verified).length
        const owners = collaborators.filter((c) => c.role.name === "SuperAdminEmpresa").length

        return { total, active, pending, verified, owners }
    }, [collaborators])

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("es-CR", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }


    const PaginationControls = () => (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
            <div className="flex items-center gap-4">
                <div className="text-sm text-gray-700">
                    Mostrando {startIndex + 1} a {Math.min(endIndex, filteredCollaborators.length)} de{" "}
                    {filteredCollaborators.length} colaboradores
                </div>
                <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                    <SelectTrigger className="w-20 h-8">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="6">6</SelectItem>
                        <SelectItem value="12">12</SelectItem>
                        <SelectItem value="24">24</SelectItem>
                        <SelectItem value="48">48</SelectItem>
                    </SelectContent>
                </Select>
                <span className="text-sm text-gray-500">por página</span>
            </div>

            <div className="flex items-center gap-2">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1}
                                className="h-8 w-8 p-0"
                            >
                                <ChevronsLeft className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Primera página</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="h-8 w-8 p-0"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Página anterior</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNumber
                        if (totalPages <= 5) {
                            pageNumber = i + 1
                        } else if (currentPage <= 3) {
                            pageNumber = i + 1
                        } else if (currentPage >= totalPages - 2) {
                            pageNumber = totalPages - 4 + i
                        } else {
                            pageNumber = currentPage - 2 + i
                        }

                        return (
                            <Button
                                key={pageNumber}
                                variant={currentPage === pageNumber ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(pageNumber)}
                                className={`h-8 w-8 p-0 ${currentPage === pageNumber ? "bg-blue-600 text-white" : "hover:bg-gray-100"}`}
                            >
                                {pageNumber}
                            </Button>
                        )
                    })}
                </div>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="h-8 w-8 p-0"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Página siguiente</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={currentPage === totalPages}
                                className="h-8 w-8 p-0"
                            >
                                <ChevronsRight className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Última página</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    )

    return (
        <Sidebar>
            <div className="flex h-full">
                {/* Contenido principal */}
                <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "mr-80" : "mr-0"}`}>
                    <div className="w-full space-y-6 p-6">
                        {/* Header principal */}
                        <Card className="shadow-lg border-0 rounded-xl overflow-hidden">
                            <CardHeader className="bg-gradient-to-br from-blue-50 via-slate-50 to-white p-6 border-b">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="p-3 bg-blue-100 rounded-xl shadow-sm">
                                            <Users className="h-8 w-8 text-blue-600" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-2xl font-bold text-gray-800">Gestión de Colaboradores</CardTitle>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Administre y supervise todos los colaboradores del sistema.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => setSidebarOpen(!sidebarOpen)}
                                                        className="border-gray-300"
                                                    >
                                                        <BarChart3 className="h-4 w-4 text-gray-600" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{sidebarOpen ? "Ocultar" : "Mostrar"} panel de estadísticas</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                        <Link href="/collaborators/invite" passHref>
                                            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all duration-200 hover:translate-y-[-2px]">
                                                <UserPlus className="mr-2 h-5 w-5" /> Invitar Colaborador
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>

                        {/* Controles de búsqueda y filtros */}
                        <Card className="shadow-md border border-gray-200 rounded-xl overflow-hidden">
                            <div className="p-4 border-b bg-gray-50">
                                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                                    <div className="relative flex-1 max-w-md">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Buscar por nombre, email o usuario..."
                                            className="pl-10 bg-white border-gray-200 focus-visible:ring-blue-500"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex flex-wrap gap-2 items-center">
                                        <div className="flex items-center gap-2">
                                            <Filter className="h-4 w-4 text-gray-500" />
                                            <Select value={filter} onValueChange={setFilter}>
                                                <SelectTrigger className="w-[180px] bg-white border-gray-200">
                                                    <SelectValue placeholder="Filtrar por empresa" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Todas las empresas</SelectItem>
                                                    {filterOptions?.companies.map((c) => (
                                                        <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                                            <SelectTrigger className="w-[140px] bg-white border-gray-200">
                                                <SelectValue placeholder="Rol" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todos los roles</SelectItem>
                                                {filterOptions?.roles.map((role) => (
                                                    <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                                            <SelectTrigger className="w-[140px] bg-white border-gray-200">
                                                <SelectValue placeholder="Estado" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todos los estados</SelectItem>
                                                {filterOptions?.statuses.map((status) => (
                                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <div className="flex items-center gap-2">
                                            <SlidersHorizontal className="h-4 w-4 text-gray-500" />
                                            <Select value={sortBy} onValueChange={setSortBy}>
                                                <SelectTrigger className="w-[140px] bg-white border-gray-200">
                                                    <SelectValue placeholder="Ordenar por" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="name">Nombre</SelectItem>
                                                    <SelectItem value="email">Email</SelectItem>
                                                    <SelectItem value="role">Rol</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={handleRefresh}
                                                        disabled={loading}
                                                        className="border-gray-200"
                                                    >
                                                        <RefreshCw className={`h-4 w-4 text-gray-500 ${loading ? "animate-spin" : ""}`} />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Actualizar lista</TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="outline" size="icon" className="border-gray-200">
                                                        <Download className="h-4 w-4 text-gray-500" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Exportar datos</TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                </div>
                            </div>

                            <Tabs defaultValue="grid" className="w-full">
                                <div className="px-4 pt-3 pb-2 border-b bg-white">
                                    <div className="flex items-center justify-between">
                                        <TabsList className="bg-gray-100">
                                            <TabsTrigger value="grid" className="flex items-center gap-2">
                                                <Grid3X3 className="h-4 w-4" />
                                                Vista de Tarjetas
                                            </TabsTrigger>
                                            <TabsTrigger value="list" className="flex items-center gap-2">
                                                <List className="h-4 w-4" />
                                                Vista de Lista
                                            </TabsTrigger>
                                        </TabsList>

                                        <div className="flex items-center gap-4">
                                            <div className="text-sm text-gray-500">
                                                {filteredCollaborators.length}{" "}
                                                {filteredCollaborators.length === 1 ? "colaborador" : "colaboradores"}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <TabsContent value="grid" className="p-4 m-0">
                                    {loading ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                            {Array.from({ length: itemsPerPage }, (_, i) => (
                                                <Card key={i} className="h-[320px]">
                                                    <CardHeader className="p-5">
                                                        <div className="flex items-start gap-4">
                                                            <Skeleton className="h-16 w-16 rounded-lg" />
                                                            <div className="space-y-2 flex-1">
                                                                <Skeleton className="h-5 w-3/4" />
                                                                <Skeleton className="h-4 w-1/2" />
                                                                <div className="flex gap-2 pt-1">
                                                                    <Skeleton className="h-5 w-20" />
                                                                    <Skeleton className="h-5 w-24" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="p-5 space-y-4">
                                                        <Skeleton className="h-4 w-full" />
                                                        <Skeleton className="h-4 w-full" />
                                                        <Skeleton className="h-4 w-2/3" />
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : error ? (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                                            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-2" />
                                            <h3 className="text-lg font-semibold text-red-700 mb-1">Error al cargar colaboradores</h3>
                                            <p className="text-red-600 mb-4">{error}</p>
                                            <Button
                                                variant="outline"
                                                onClick={handleRefresh}
                                                className="border-red-300 text-red-700 hover:bg-red-50"
                                            >
                                                <RefreshCw className="mr-2 h-4 w-4" /> Intentar nuevamente
                                            </Button>
                                        </div>
                                    ) : currentCollaborators.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                            {currentCollaborators.map((collaborator) => (
                                                <CollaboratorCard key={collaborator.id} collaborator={collaborator} />
                                            ))}
                                        </div>
                                    ) : searchTerm || filter !== "all" || roleFilter !== "all" || statusFilter !== "all" ? (
                                        <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
                                            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold text-gray-700 mb-2">No se encontraron resultados</h3>
                                            <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                                No hay colaboradores que coincidan con tu búsqueda o filtros. Intenta con otros términos o
                                                criterios.
                                            </p>
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setSearchTerm("")
                                                    setFilter("all")
                                                    setRoleFilter("all")
                                                    setStatusFilter("all")
                                                }}
                                                className="border-gray-300"
                                            >
                                                Limpiar filtros
                                            </Button>
                                        </div>
                                    ) : (
                                        <Card className="shadow-md">
                                            <CardContent className="text-center py-16">
                                                <div className="p-4 bg-blue-100 rounded-full inline-block mb-4">
                                                    <Users className="h-10 w-10 text-blue-600" />
                                                </div>
                                                <h2 className="text-xl font-semibold text-gray-800 mb-2">No hay colaboradores registrados</h2>
                                                <p className="text-gray-600 mt-2 mb-6 max-w-md mx-auto">
                                                    Empieza por invitar tu primer colaborador para verlo aquí.
                                                </p>
                                                <Link href="/collaborators/invite" passHref>
                                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                                                        <UserPlus className="mr-2 h-5 w-5" /> Invitar Colaborador
                                                    </Button>
                                                </Link>
                                            </CardContent>
                                        </Card>
                                    )}
                                </TabsContent>

                                <TabsContent value="list" className="p-0 m-0">
                                    <CollaboratorsTable collaborators={currentCollaborators} />
                                </TabsContent>

                                {/* Paginación */}
                                {filteredCollaborators.length > 0 && !loading && <PaginationControls />}
                            </Tabs>
                        </Card>
                    </div>
                </div>

                {/* Sidebar desplegable */}
                <div
                    className={`fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-xl transform transition-transform duration-300 z-40 ${sidebarOpen ? "translate-x-0" : "translate-x-full"
                        }`}
                >
                    <div className="p-6 space-y-6 h-full overflow-y-auto">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-800">Panel de Control</h3>
                            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>

                        <Collapsible defaultOpen>
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                                    <div className="flex items-center gap-2">
                                        <BarChart3 className="h-4 w-4 text-blue-600" />
                                        <span className="font-medium">Estadísticas</span>
                                    </div>
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="space-y-4 mt-4">
                                <Card className="shadow-sm">
                                    <CardContent className="p-4 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Total colaboradores:</span>
                                            <Badge variant="outline" className="bg-gray-100">
                                                {stats.total}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Colaboradores activos:</span>
                                            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                                                {stats.active}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">En revisión:</span>
                                            <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300">
                                                {stats.pending}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Verificados:</span>
                                            <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                                                {stats.verified}
                                            </Badge>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Propietarios:</span>
                                            <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                                                {stats.owners}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            </CollapsibleContent>
                        </Collapsible>

                        <Collapsible defaultOpen>
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                                    <div className="flex items-center gap-2">
                                        <Settings className="h-4 w-4 text-blue-600" />
                                        <span className="font-medium">Acciones Rápidas</span>
                                    </div>
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="space-y-3 mt-4">
                                <Link href="/collaborators/invite" passHref>
                                    <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white">
                                        <UserPlus className="mr-2 h-4 w-4" /> Invitar Colaborador
                                    </Button>
                                </Link>
                                <Button variant="outline" className="w-full justify-start border-gray-300">
                                    <Download className="mr-2 h-4 w-4 text-gray-600" /> Exportar Datos
                                </Button>
                                <Button variant="outline" className="w-full justify-start border-gray-300">
                                    <Filter className="mr-2 h-4 w-4 text-gray-600" /> Filtros Avanzados
                                </Button>
                                <Button variant="outline" className="w-full justify-start border-gray-300">
                                    <Settings className="mr-2 h-4 w-4 text-gray-600" /> Configuración
                                </Button>
                            </CollapsibleContent>
                        </Collapsible>
                    </div>
                </div>

                {/* Overlay para cerrar sidebar en móvil */}
                {sidebarOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
                )}
            </div>
        </Sidebar>
    )
}
