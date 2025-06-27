// v0 was here
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/Components/ui/card"
import { Badge } from "@/Components/ui/badge"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { Store, Search, Filter, Mail, MessageCircle, MapPin, Eye } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/Components/ui/tooltip"

const statuses = ["under_review", "active", "inactive", "rejected"] as const

// Función para traducir estados al español
const getStatusLabel = (status: string) => {
  const statusLabels = {
    under_review: "En Revisión",
    active: "Activo",
    inactive: "Inactivo",
    rejected: "Rechazado",
  }
  return statusLabels[status as keyof typeof statusLabels] || status
}

interface ReviewPDEPageClientProps {
  adminId: string
  onItemSelect: (item: { id: string; type: "pdes"; name: string }) => void
}

export default function ReviewPDEPageClient({ adminId, onItemSelect }: ReviewPDEPageClientProps) {
  const [statusFilter, setStatusFilter] = useState<string>("under_review")
  const [search, setSearch] = useState("")
  const [pdes, setPDEs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch("/api/pdes/review-list")
      .then(async (r) => {
        const txt = await r.text()
        try {
          const data = JSON.parse(txt)
          if (Array.isArray(data)) setPDEs(data)
          else console.error("Respuesta no array:", data)
        } catch (e) {
          console.error("JSON parse error:", e, txt)
        }
      })
      .catch((e) => console.error("Fetch error:", e))
      .finally(() => setLoading(false))
  }, [statusFilter])

  const filteredPDEs = pdes.filter(
    (pde) =>
      pde.status === statusFilter &&
      (pde.name?.toLowerCase().includes(search.toLowerCase()) ||
        pde.trade_name?.toLowerCase().includes(search.toLowerCase())),
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
            Activo
          </Badge>
        )
      case "inactive":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">
            Inactivo
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

  const getStatusCount = (status: string) => {
    return pdes.filter((pde) => pde.status === status).length
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="p-3 bg-purple-100 rounded-lg mr-3 shadow-sm">
            <Store className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Puntos de Entrega en Revisión</h2>
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
                    {getStatusCount(status)} PdE en estado {getStatusLabel(status)}
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
                placeholder="Buscar por nombre del PdE..."
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

      {/* Lista de PdE */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Cargando puntos de entrega...</p>
          </div>
        ) : filteredPDEs.length > 0 ? (
          filteredPDEs.map((pde) => (
            <Card key={pde.id} className="border border-gray-200 hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-4 flex-1">
                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm rounded-lg">
                      <AvatarImage
                        src={pde.logo_url || "/placeholder.svg?height=48&width=48&query=store+logo"}
                        alt={`Logo de ${pde.name}`}
                        className="object-contain p-1"
                      />
                      <AvatarFallback className="bg-purple-100 text-purple-700 rounded-lg">
                        {pde.name
                          ?.split(" ")
                          .map((n: any) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2) || "PD"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{pde.name}</h3>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Store className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="font-medium mr-2">Empresa:</span>
                          <span>{pde.trade_name || "No especificada"}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="font-medium mr-2">Email:</span>
                          <a href={`mailto:${pde.business_email}`} className="text-blue-600 hover:underline">
                            {pde.business_email || "No especificado"}
                          </a>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MessageCircle className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="font-medium mr-2">WhatsApp:</span>
                          <span>{pde.whatsapp_contact || "No especificado"}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="font-medium mr-2">Ubicación:</span>
                          <span>
                            {`${pde.province || ""}, ${pde.canton || ""}, ${pde.district || ""}`
                              .trim()
                              .replace(/^,|,$/, "") || "No especificada"}
                          </span>
                        </div>
                        <div className="flex items-start text-sm text-gray-600">
                          <Store className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                          <span className="font-medium mr-2">Razón actual:</span>
                          <span>{pde.reason || "Sin especificar"}</span>
                        </div>
                      </div>
                      <div className="mt-3">{getStatusBadge(pde.status)}</div>
                    </div>
                  </div>

                  <div className="ml-4">
                    <Button
                      onClick={() => onItemSelect({ id: pde.id, type: "pdes", name: pde.name })}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
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
            <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No se encontraron puntos de entrega</h3>
            <p className="text-gray-500">
              {search || statusFilter !== "under_review"
                ? "No hay PdE que coincidan con los filtros aplicados."
                : "No hay puntos de entrega pendientes de revisión en este momento."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
