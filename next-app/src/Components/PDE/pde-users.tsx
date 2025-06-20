// v0 was here
"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Badge } from "@/Components/ui/badge"
import { Button } from "@/Components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar"
import { Users, User, Mail, Phone, Shield, Plus, Edit, Trash2, Crown, UserCheck } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/Components/ui/tooltip"

// Componente auxiliar para tarjetas estilizadas
const StyledCard = ({
  icon: Icon,
  title,
  children,
  actions,
}: {
  icon: React.ElementType
  title: string
  children: React.ReactNode
  actions?: React.ReactNode
}) => (
  <Card className="shadow-lg border border-gray-200 rounded-xl overflow-hidden">
    <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-100 p-5 border-b">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="p-2.5 bg-blue-100 rounded-lg mr-3 shadow-sm">
            <Icon className="h-5 w-5 text-blue-600" />
          </div>
          <CardTitle className="text-lg font-semibold text-gray-800">{title}</CardTitle>
        </div>
        {actions}
      </div>
    </CardHeader>
    <CardContent className="p-5">{children}</CardContent>
  </Card>
)

interface PDEUsersProps {
  pde: any
}

export function PDEUsers({ pde }: PDEUsersProps) {
  // Mock data para usuarios del PdE
  const users = [
    {
      id: "1",
      name: "María González Rodríguez",
      email: "maria.gonzalez@empresa.com",
      phone: "8888-1234",
      role: "Administrador",
      status: "active",
      avatar: "/placeholder.svg?height=40&width=40",
      lastLogin: "2024-06-17T10:30:00Z",
      permissions: ["Gestionar inventario", "Ver reportes", "Administrar usuarios"],
    },
    {
      id: "2",
      name: "Carlos Jiménez Mora",
      email: "carlos.jimenez@empresa.com",
      phone: "8777-5678",
      role: "Operador",
      status: "active",
      avatar: "/placeholder.svg?height=40&width=40",
      lastLogin: "2024-06-17T08:15:00Z",
      permissions: ["Gestionar inventario", "Ver reportes"],
    },
    {
      id: "3",
      name: "Ana Vargas Castro",
      email: "ana.vargas@empresa.com",
      phone: "8666-9012",
      role: "Supervisor",
      status: "inactive",
      avatar: "/placeholder.svg?height=40&width=40",
      lastLogin: "2024-06-15T16:45:00Z",
      permissions: ["Gestionar inventario", "Ver reportes", "Supervisar operaciones"],
    },
    {
      id: "4",
      name: "Roberto Solís Herrera",
      email: "roberto.solis@empresa.com",
      phone: "8555-3456",
      role: "Operador",
      status: "pending",
      avatar: "/placeholder.svg?height=40&width=40",
      lastLogin: null,
      permissions: ["Gestionar inventario"],
    },
  ]

  const getRoleBadge = (role: string) => {
    switch (role.toLowerCase()) {
      case "administrador":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300">
            <Crown className="mr-1 h-3 w-3" />
            Administrador
          </Badge>
        )
      case "supervisor":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
            <Shield className="mr-1 h-3 w-3" />
            Supervisor
          </Badge>
        )
      case "operador":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
            <UserCheck className="mr-1 h-3 w-3" />
            Operador
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">
            <User className="mr-1 h-3 w-3" />
            {role}
          </Badge>
        )
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
            Activo
          </Badge>
        )
      case "inactive":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
            Inactivo
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300">
            Pendiente
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">
            {status}
          </Badge>
        )
    }
  }

  const formatLastLogin = (dateString: string | null) => {
    if (!dateString) return "Nunca"
    return new Date(dateString).toLocaleDateString("es-CR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const activeUsers = users.filter((user) => user.status === "active").length
  const pendingUsers = users.filter((user) => user.status === "pending").length
  const inactiveUsers = users.filter((user) => user.status === "inactive").length

  return (
    <div className="space-y-6">
      {/* Estadísticas de usuarios */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-md border border-gray-200 rounded-xl">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-800">{users.length}</div>
            <div className="text-sm text-gray-600">Total Usuarios</div>
          </CardContent>
        </Card>
        <Card className="shadow-md border border-gray-200 rounded-xl">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{activeUsers}</div>
            <div className="text-sm text-gray-600">Activos</div>
          </CardContent>
        </Card>
        <Card className="shadow-md border border-gray-200 rounded-xl">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{pendingUsers}</div>
            <div className="text-sm text-gray-600">Pendientes</div>
          </CardContent>
        </Card>
        <Card className="shadow-md border border-gray-200 rounded-xl">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{inactiveUsers}</div>
            <div className="text-sm text-gray-600">Inactivos</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de usuarios */}
      <StyledCard
        icon={Users}
        title="Usuarios del Punto de Entrega"
        actions={
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="mr-2 h-4 w-4" /> Agregar Usuario
          </Button>
        }
      >
        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback className="bg-blue-100 text-blue-700">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-semibold text-gray-800">{user.name}</h4>
                    {getRoleBadge(user.role)}
                    {getStatusBadge(user.status)}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <a href={`mailto:${user.email}`} className="hover:text-blue-600 hover:underline">
                        {user.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      <span>{user.phone}</span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mt-1">Último acceso: {formatLastLogin(user.lastLogin)}</div>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {user.permissions.map((permission, index) => (
                      <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" className="border-gray-300">
                        <Edit className="h-4 w-4 text-gray-600" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Editar usuario</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" className="border-red-300 text-red-600 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Eliminar usuario</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          ))}
        </div>
      </StyledCard>

      {/* Permisos y roles */}
      <div className="grid md:grid-cols-2 gap-6">
        <StyledCard icon={Shield} title="Roles Disponibles">
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-800">Administrador</div>
                <div className="text-sm text-gray-600">Acceso completo al sistema</div>
              </div>
              <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300">
                1 usuario
              </Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-800">Supervisor</div>
                <div className="text-sm text-gray-600">Supervisión de operaciones</div>
              </div>
              <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                1 usuario
              </Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-800">Operador</div>
                <div className="text-sm text-gray-600">Operaciones básicas</div>
              </div>
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                2 usuarios
              </Badge>
            </div>
          </div>
        </StyledCard>

        <StyledCard icon={UserCheck} title="Permisos del Sistema">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Gestionar inventario</span>
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                4 usuarios
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Ver reportes</span>
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                3 usuarios
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Administrar usuarios</span>
              <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300">
                1 usuario
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Supervisar operaciones</span>
              <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                1 usuario
              </Badge>
            </div>
          </div>
        </StyledCard>
      </div>
    </div>
  )
}
