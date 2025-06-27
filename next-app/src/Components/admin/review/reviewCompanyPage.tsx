// v0 was here
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/Components/ui/card"
import { Badge } from "@/Components/ui/badge"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { Building2, Search, Filter, Mail, FileText, Eye } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/Components/ui/tooltip"

const statuses = ["under_review", "active", "inactive", "rejected"] as const

// Función para traducir estados al español
const getStatusLabel = (status: string) => {
  const statusLabels = {
    under_review: "En Revisión",
    active: "Activa",
    inactive: "Inactiva",
    rejected: "Rechazada",
  }
  return statusLabels[status as keyof typeof statusLabels] || status
}

interface ReviewCompaniesClientProps {
  adminId: string
  onItemSelect: (item: { id: string; type: "companies"; name: string }) => void
}

export default function ReviewCompaniesClient({ adminId, onItemSelect }: ReviewCompaniesClientProps) {
  const [statusFilter, setStatusFilter] = useState<string>("under_review")
  const [search, setSearch] = useState("")
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch("/api/companies/review-list")
      .then(async (r) => {
        const txt = await r.text()
        try {
          const data = JSON.parse(txt)
          if (Array.isArray(data)) setCompanies(data)
          else console.error("Respuesta no array:", data)
        } catch (e) {
          console.error("JSON parse error:", e, txt)
        }
      })
      .catch((e) => console.error("Fetch error:", e))
      .finally(() => setLoading(false))
  }, [statusFilter])

  const filteredCompanies = companies.filter(
    (c) =>
      c.status === statusFilter &&
      (c.legal_name?.toLowerCase().includes(search.toLowerCase()) ||
        c.trade_name?.toLowerCase().includes(search.toLowerCase())),
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "under_review":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300">
            En Revisión
          </Badge>
        )
      case "active":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
            Activa
          </Badge>
        )
      case "inactive":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">
            Inactiva
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
            Rechazada
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

  const getStatusCount = (status: string) => {
    return companies.filter((company) => company.status === status).length
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="p-3 bg-green-100 rounded-lg mr-3 shadow-sm">
            <Building2 className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Empresas en Revisión</h2>
            <p className="text-sm text-gray-600 mt-1">Haz clic en "Revisar" para ver los detalles completos</p>
          </div>
        </div>
        <div className="flex gap-2">
          {statuses.map((status) => (
            <TooltipProvider key={status}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-center p-2 bg-white rounded-lg border border-gray-200 min-w-[60px] shadow-sm">
                    <div className="text-lg font-bold text-gray-800">{getStatusCount(status)}</div>
                    <div className="text-xs text-gray-500">{getStatusLabel(status)}</div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {getStatusCount(status)} empresas en estado {getStatusLabel(status)}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>

      {/* Controles de filtrado */}
      <Card className="shadow-sm border border-gray-200 rounded-xl">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por razón social o nombre comercial..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white border-gray-200 focus-visible:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] bg-white border-gray-200">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {getStatusLabel(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de empresas */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Cargando empresas...</p>
          </div>
        ) : filteredCompanies.length > 0 ? (
          filteredCompanies.map((company) => (
            <Card key={company.id} className="border border-gray-200 hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-4 flex-1">
                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm rounded-lg">
                      <AvatarImage
                        src={company.logo_url || "/placeholder.svg?height=48&width=48&query=company+logo"}
                        alt={`Logo de ${company.legal_name}`}
                        className="object-contain p-1"
                      />
                      <AvatarFallback className="bg-green-100 text-green-700 rounded-lg">
                        {company.legal_name
                          ?.split(" ")
                          .map((n: any) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2) || "EM"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{company.legal_name}</h3>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="font-medium mr-2">Nombre Comercial:</span>
                          <span>{company.trade_name || "No especificado"}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <FileText className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="font-medium mr-2">Cédula Jurídica:</span>
                          <span>{company.legal_id || "No especificada"}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="font-medium mr-2">Email:</span>
                          <a href={`mailto:${company.contact_email}`} className="text-blue-600 hover:underline">
                            {company.contact_email || "No especificado"}
                          </a>
                        </div>
                        <div className="flex items-start text-sm text-gray-600">
                          <FileText className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                          <span className="font-medium mr-2">Razón actual:</span>
                          <span>{company.reason || "Sin especificar"}</span>
                        </div>
                      </div>
                      <div className="mt-3">{getStatusBadge(company.status)}</div>
                    </div>
                  </div>

                  <div className="ml-4">
                    <Button
                      onClick={() => onItemSelect({ id: company.id, type: "companies", name: company.legal_name })}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Revisar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No se encontraron empresas</h3>
            <p className="text-gray-500">
              {search || statusFilter !== "under_review"
                ? "No hay empresas que coincidan con los filtros aplicados."
                : "No hay empresas pendientes de revisión en este momento."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
