"use client"

import { useEffect, useState } from "react"
import type React from "react"
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/Components/ui/card"
import { Badge } from "@/Components/ui/badge"
import { Button } from "@/Components/ui/button"
import {
  Avatar, AvatarFallback, AvatarImage,
} from "@/Components/ui/avatar"
import {
  Users, User, Mail, Phone, Shield, Plus, Edit, Lock, Unlock, Crown, UserCheck,
} from "lucide-react"
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/Components/ui/tooltip"
import { getPdeUsers, type PdeUser } from "@/Services/pde/pde"
import { togglePdeUserActive } from "@/Services/pde/pde"


// ─── tarjeta reutilizable ───────────────────────────────────────────
const StyledCard = ({
  icon: Icon, title, children, actions,
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
// ────────────────────────────────────────────────────────────────────

interface PDEUsersProps {
  pde: { id: string; name: string }
}

export function PDEUsers({ pde }: PDEUsersProps) {
  const [users, setUsers] = useState<PdeUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('Soy el id', pde.id);

    getPdeUsers(pde.id)
      .then(setUsers)
      .finally(() => setLoading(false))
  }, [pde.id])

  const activeUsers = users.filter(u => u.status === "active").length
  const pendingUsers = users.filter(u => u.status === "pending").length
  const inactiveUsers = users.filter(u => u.status === "inactive").length

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
            Activo
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300">
            Pendiente
          </Badge>
        )
      case "inactive":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
            Inactivo
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

  const getActiveBadge = (isActive: boolean) => (
    isActive ? (
      <Badge
        variant="outline"
        className="bg-green-100 text-green-700 border-green-300"
      >
        Activo
      </Badge>
    ) : (
      <Badge
        variant="outline"
        className="bg-red-100 text-red-700 border-red-300"
      >
        Inactivo
      </Badge>
    )
  )

  /* ─── badges auxiliares ───────────────────── */
  const getRoleBadge = (role: string) => {
    switch (role.toLowerCase()) {
      case "administrador":
      case "adminpde":
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
      case "operadorpde":
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

  const formatLastLogin = (dateString: string | null) =>
    dateString
      ? new Date(dateString).toLocaleDateString("es-CR", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
      : "Nunca"


  const handleToggleUser = async (userId: string, current: boolean) => {
    try {
      // 1. Update UI de forma optimista
      setUsers(prev =>
        prev.map(u =>
          u.id === userId ? { ...u, active: !current } : u
        ),
      )

      // 2. Llama al API
      await togglePdeUserActive(pde.id, userId, !current)
    } catch (e) {
      // 3. Si falla, revierte
      setUsers(prev =>
        prev.map(u =>
          u.id === userId ? { ...u, active: current } : u
        ),
      )
      console.error("No se pudo cambiar el estado:", e)
    }
  }


  /* ─── render ───────────────────────────────── */
  if (loading) {
    return (
      <div className="grid gap-4">
        <div className="h-32 rounded-lg bg-gray-100 animate-pulse" />
        <div className="h-96 rounded-lg bg-gray-100 animate-pulse" />
      </div>
    )
  }


  return (
    <div className="space-y-6">
      {/* Lista */}
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
                  <AvatarImage src={user.avatar ?? "/placeholder.svg"} alt={user.name} />
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
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-semibold text-gray-800">{user.name}</h4>
                      {/* Estado activo / inactivo en la tabla puente */}
                      {getActiveBadge(user.active)}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <a href={`mailto:${user.email}`} className="hover:text-blue-600 hover:underline">
                        {user.email}
                      </a>
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                  </div>

                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Editar */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" className="border-gray-300">
                        <Edit className="h-4 w-4 text-gray-600" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Editar usuario</p></TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Activar / Desactivar */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={user.active ? "border-green-300 text-green-600 hover:bg-green-50" : "border-yellow-300 text-yellow-600 hover:bg-yellow-50"}
                        onClick={() => handleToggleUser(user.id, user.active)}
                      >
                        {user.active ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{user.active ? "Desactivar usuario" : "Activar usuario"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

            </div>
          ))}
        </div>
      </StyledCard>

      {/* Secciones de roles/permisos siguen igual */}
      {/* … */}
    </div>
  )
}
