// v0 was here
"use client"

import { useEffect, useState } from "react"
import { getPDEList } from "@/Services/pde/pde"
import { useUser } from "@/context/UserContext"
import { Sidebar } from "../Sidebar/Sidebar"
import { PDECard } from "./pde-card"
import {
  Store,
  PlusCircle,
  Search,
  Filter,
  SlidersHorizontal,
  RefreshCw,
  AlertCircle,
  Eye,
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
  Calendar,
  Mail,
  Phone,
  MapPin,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Input } from "@/Components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs"
import { Badge } from "@/Components/ui/badge"
import { Skeleton } from "@/Components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/Components/ui/collapsible"
import { Separator } from "@/Components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/Components/ui/tooltip"

const ITEMS_PER_PAGE = 6

export function PDEList() {
  const { user } = useUser()
  const [pdes, setPDEs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE)

  useEffect(() => {
    async function fetchData() {
      if (!user?.sub) return
      setLoading(true)
      setError(null)

      try {
        const data = await getPDEList(user.sub)
        setPDEs(data)
      } catch (err) {
        console.error("Error fetching PDEs:", err)
        setError("No se pudieron cargar los puntos de entrega. Intente nuevamente.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user?.sub])

  // Filtrar y ordenar PDEs
  const filteredPDEs = pdes
    .filter((pde) => {
      const searchMatch =
        pde.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pde.company?.trade_name?.toLowerCase().includes(searchTerm.toLowerCase())

      const filterMatch =
        filter === "all" ||
        (filter === "active" && pde.active) ||
        (filter === "inactive" && !pde.active) ||
        (filter === "under_review" && pde.status === "under_review") ||
        (filter === "approved" && pde.status === "approved") ||
        (filter === "rejected" && pde.status === "rejected")

      return searchMatch && filterMatch
    })
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name)
      } else if (sortBy === "date") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      } else if (sortBy === "company") {
        return a.company?.trade_name?.localeCompare(b.company?.trade_name || "")
      }
      return 0
    })

  // Paginación
  const totalPages = Math.ceil(filteredPDEs.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPDEs = filteredPDEs.slice(startIndex, endIndex)

  // Reset página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filter, sortBy, itemsPerPage])

  const handleRefresh = async () => {
    if (!user?.sub) return
    setLoading(true)
    setError(null)

    try {
      const data = await getPDEList(user.sub)
      setPDEs(data)
    } catch (err) {
      setError("No se pudieron actualizar los puntos de entrega. Intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  const activeCount = pdes.filter((p) => p.active).length
  const inactiveCount = pdes.filter((p) => !p.active).length
  const underReviewCount = pdes.filter((p) => p.status === "under_review").length
  const approvedCount = pdes.filter((p) => p.status === "approved").length
  const rejectedCount = pdes.filter((p) => p.status === "rejected").length

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "under_review":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300">
            En Revisión
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
            Aprobado
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
            Rechazado
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">
            Desconocido
          </Badge>
        )
    }
  }

  const PaginationControls = () => (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-700">
          Mostrando {startIndex + 1} a {Math.min(endIndex, filteredPDEs.length)} de {filteredPDEs.length} puntos de
          entrega
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
                      <Store className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-800">Puntos de Entrega</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        Visualiza y gestiona todos tus puntos de entrega registrados.
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

                    <Link href="/pde/create" passHref>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all duration-200 hover:translate-y-[-2px]">
                        <PlusCircle className="mr-2 h-5 w-5" /> Registrar Nuevo PdE
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
                      placeholder="Buscar por nombre, email o empresa..."
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
                          <SelectValue placeholder="Filtrar por" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los PdE</SelectItem>
                          <SelectItem value="active">PdE activos</SelectItem>
                          <SelectItem value="inactive">PdE inactivos</SelectItem>
                          <SelectItem value="under_review">En revisión</SelectItem>
                          <SelectItem value="approved">Aprobados</SelectItem>
                          <SelectItem value="rejected">Rechazados</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="h-4 w-4 text-gray-500" />
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-[180px] bg-white border-gray-200">
                          <SelectValue placeholder="Ordenar por" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="name">Nombre</SelectItem>
                          <SelectItem value="date">Fecha de creación</SelectItem>
                          <SelectItem value="company">Empresa</SelectItem>
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
                        {filteredPDEs.length} {filteredPDEs.length === 1 ? "punto de entrega" : "puntos de entrega"}
                      </div>
                    </div>
                  </div>
                </div>

                <TabsContent value="grid" className="p-4 m-0">
                  {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {Array.from({ length: itemsPerPage }, (_, i) => (
                        <Card key={i} className="h-[280px]">
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
                      <h3 className="text-lg font-semibold text-red-700 mb-1">Error al cargar puntos de entrega</h3>
                      <p className="text-red-600 mb-4">{error}</p>
                      <Button
                        variant="outline"
                        onClick={handleRefresh}
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" /> Intentar nuevamente
                      </Button>
                    </div>
                  ) : currentPDEs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {currentPDEs.map((pde) => (
                        <PDECard key={pde.id} pde={pde} />
                      ))}
                    </div>
                  ) : searchTerm || filter !== "all" ? (
                    <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
                      <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">No se encontraron resultados</h3>
                      <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        No hay puntos de entrega que coincidan con tu búsqueda o filtros. Intenta con otros términos o
                        criterios.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchTerm("")
                          setFilter("all")
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
                          <Store className="h-10 w-10 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">
                          No tienes puntos de entrega registrados
                        </h2>
                        <p className="text-gray-600 mt-2 mb-6 max-w-md mx-auto">
                          Empieza por registrar tu primer punto de entrega para verlo aquí.
                        </p>
                        <Link href="/pde/create" passHref>
                          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                            <PlusCircle className="mr-2 h-5 w-5" /> Registrar Punto de Entrega
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="list" className="p-0 m-0">
                  <div className="bg-white rounded-lg border-0 overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b font-medium text-gray-600 text-sm">
                      <div className="col-span-3">Punto de Entrega</div>
                      <div className="col-span-2">Contacto</div>
                      <div className="col-span-2">Empresa</div>
                      <div className="col-span-1">Estado</div>
                      <div className="col-span-2">Ubicación</div>
                      <div className="col-span-1">Fecha</div>
                      <div className="col-span-1 text-right">Acciones</div>
                    </div>

                    {loading ? (
                      <div className="p-4 space-y-4">
                        {Array.from({ length: itemsPerPage }, (_, i) => (
                          <div key={i} className="grid grid-cols-12 gap-4 p-3 border-b border-gray-100">
                            <div className="col-span-3 flex items-center gap-3">
                              <Skeleton className="h-10 w-10 rounded-md" />
                              <div className="space-y-1">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-24" />
                              </div>
                            </div>
                            <div className="col-span-2 space-y-1">
                              <Skeleton className="h-4 w-28" />
                              <Skeleton className="h-3 w-20" />
                            </div>
                            <div className="col-span-2">
                              <Skeleton className="h-4 w-28" />
                            </div>
                            <div className="col-span-1">
                              <Skeleton className="h-6 w-16" />
                            </div>
                            <div className="col-span-2">
                              <Skeleton className="h-4 w-24" />
                            </div>
                            <div className="col-span-1">
                              <Skeleton className="h-4 w-16" />
                            </div>
                            <div className="col-span-1 text-right">
                              <Skeleton className="h-8 w-20 ml-auto" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : error ? (
                      <div className="p-8 text-center">
                        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                        <p className="text-red-600">{error}</p>
                      </div>
                    ) : currentPDEs.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                        {currentPDEs.map((pde) => (
                          <div
                            key={pde.id}
                            className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 transition-colors"
                          >
                            <div className="col-span-3 flex items-center gap-3">
                              <Avatar className="h-10 w-10 rounded-md border border-gray-200">
                                <AvatarImage
                                  src={pde.company?.logo_url || "/placeholder.svg?height=40&width=40&query=store+logo"}
                                  alt={`Logo de ${pde.name}`}
                                  className="object-contain p-1"
                                />
                                <AvatarFallback className="text-xs bg-blue-100 text-blue-700 rounded-md">
                                  {pde.name
                                    .split(" ")
                                    .map((n: any) => n[0])
                                    .join("")
                                    .toUpperCase()
                                    .slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <div className="font-medium text-gray-800 truncate" title={pde.name}>
                                  {pde.name}
                                </div>
                                <div className="text-xs text-gray-500 truncate">{getStatusBadge(pde.status)}</div>
                              </div>
                            </div>

                            <div className="col-span-2 text-sm">
                              <div className="flex items-center gap-1 mb-1">
                                <Mail className="h-3 w-3 text-gray-400" />
                                <a
                                  href={`mailto:${pde.business_email}`}
                                  className="text-blue-600 hover:underline truncate"
                                  title={pde.business_email}
                                >
                                  {pde.business_email?.length > 20
                                    ? `${pde.business_email.substring(0, 20)}...`
                                    : pde.business_email}
                                </a>
                              </div>
                              {pde.whatsapp_contact && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3 text-gray-400" />
                                  <span className="text-gray-600">{pde.whatsapp_contact}</span>
                                </div>
                              )}
                            </div>

                            <div className="col-span-2">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6 rounded-md">
                                  <AvatarImage
                                    src={
                                      pde.company?.logo_url || "/placeholder.svg?height=24&width=24&query=company+logo"
                                    }
                                    alt={`Logo de ${pde.company?.trade_name}`}
                                  />
                                  <AvatarFallback className="text-[10px] bg-gray-100 text-gray-700 rounded-md">
                                    {pde.company?.trade_name?.substring(0, 2).toUpperCase() || "CO"}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-gray-700 truncate" title={pde.company?.trade_name}>
                                  {pde.company?.trade_name || "N/A"}
                                </span>
                              </div>
                            </div>

                            <div className="col-span-1">
                              <Badge
                                variant={pde.active ? "default" : "destructive"}
                                className={`text-xs ${
                                  pde.active
                                    ? "bg-green-100 text-green-700 border-green-300"
                                    : "bg-red-100 text-red-700 border-red-300"
                                }`}
                              >
                                {pde.active ? "Activo" : "Inactivo"}
                              </Badge>
                            </div>

                            <div className="col-span-2 text-sm">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-gray-400" />
                                <span
                                  className="text-gray-700 truncate"
                                  title={`${pde.province}, ${pde.canton}, ${pde.district}`}
                                >
                                  {`${pde.province}, ${pde.canton}`}
                                </span>
                              </div>
                            </div>

                            <div className="col-span-1 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-gray-400" />
                                <span>{formatDate(pde.created_at)}</span>
                              </div>
                            </div>

                            <div className="col-span-1 flex justify-end gap-2">
                              <Link href={`/pde/${pde.id}`} passHref>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button size="sm" className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white">
                                        <Eye className="h-3.5 w-3.5 mr-1" /> Ver
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Ver detalles</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <p className="text-gray-500">No se encontraron puntos de entrega.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Paginación */}
                {filteredPDEs.length > 0 && !loading && <PaginationControls />}
              </Tabs>
            </Card>
          </div>
        </div>

        {/* Sidebar desplegable */}
        <div
          className={`fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-xl transform transition-transform duration-300 z-40 ${
            sidebarOpen ? "translate-x-0" : "translate-x-full"
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
                      <span className="text-sm text-gray-600">Total de PdE:</span>
                      <Badge variant="outline" className="bg-gray-100">
                        {pdes.length}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">PdE activos:</span>
                      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                        {activeCount}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">PdE inactivos:</span>
                      <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                        {inactiveCount}
                      </Badge>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">En revisión:</span>
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300">
                        {underReviewCount}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Aprobados:</span>
                      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                        {approvedCount}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Rechazados:</span>
                      <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                        {rejectedCount}
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
                <Link href="/pde/create" passHref>
                  <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white">
                    <PlusCircle className="mr-2 h-4 w-4" /> Registrar Nuevo PdE
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
