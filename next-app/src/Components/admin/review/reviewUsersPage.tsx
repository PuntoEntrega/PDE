// v0 was here
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/Components/ui/card"
import { Badge } from "@/Components/ui/badge"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { Users, Search, Filter, Mail, Building2, User, Eye } from "lucide-react"
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

interface ReviewUsersClientProps {
  adminId: string
  onItemSelect: (item: { id: string; type: "users"; name: string }) => void
}

export default function ReviewUsersClient({ adminId, onItemSelect }: ReviewUsersClientProps) {
  const [statusFilter, setStatusFilter] = useState<string>("under_review")
  const [search, setSearch] = useState("")
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch("/api/users/review-list")
      .then((r) => r.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filteredUsers = users.filter(
    (user) => user.status === statusFilter && user.name?.toLowerCase().includes(search.toLowerCase()),
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
    return users.filter((user) => user.status === status).length
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="p-3 bg-blue-100 rounded-lg mr-3 shadow-sm">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Usuarios en Revisión</h2>
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
                    {getStatusCount(status)} usuarios en estado {getStatusLabel(status)}
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
                placeholder="Buscar por nombre de usuario..."
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

      {/* Lista de usuarios */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Cargando usuarios...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <Card key={user.id} className="border border-gray-200 hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-4 flex-1">
                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback className="bg-blue-100 text-blue-700">
                        {user.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2) || "U"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{user.name}</h3>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="font-medium mr-2">Email:</span>
                          <a href={`mailto:${user.email}`} className="text-blue-600 hover:underline">
                            {user.email}
                          </a>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="font-medium mr-2">Empresa:</span>
                          <span>{user.company || "No asignada"}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="font-medium mr-2">Razón actual:</span>
                          <span>{user.reason || "Sin especificar"}</span>
                        </div>
                      </div>
                      <div className="mt-3">{getStatusBadge(user.status)}</div>
                    </div>
                  </div>

                  <div className="ml-4">
                    <Button
                      onClick={() => onItemSelect({ id: user.id, type: "users", name: user.name })}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
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
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No se encontraron usuarios</h3>
            <p className="text-gray-500">
              {search || statusFilter !== "under_review"
                ? "No hay usuarios que coincidan con los filtros aplicados."
                : "No hay usuarios pendientes de revisión en este momento."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
