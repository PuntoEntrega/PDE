"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Badge } from "@/Components/ui/badge"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/Components/ui/dialog"
import { Users, Search, Filter, CheckCircle, XCircle, Pause, RotateCcw } from "lucide-react"

const statuses = ["under_review", "active", "inactive", "rejected"] as const

interface ReviewUsersClientProps {
  adminId: string
}

export default function ReviewUsersClient({ adminId }: ReviewUsersClientProps) {
  const [statusFilter, setStatusFilter] = useState<string>("under_review")
  const [search, setSearch] = useState("")
  const [users, setUsers] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [newStatus, setNewStatus] = useState<string>("")
  const [reason, setReason] = useState<string>("")

  useEffect(() => {
    fetch("/api/users/review-list")
      .then((r) => r.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(console.error)
  }, [])

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedUser(null)
      setNewStatus("")
      setReason("")
    }
  }

  const handleStatusSubmit = async () => {
    if (!selectedUser || !newStatus || !reason) return

    const res = await fetch(`/api/users/${selectedUser.id}/change-status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        newStatus,
        reason,
        changed_by_id: adminId,
      }),
    })

    if (res.ok) {
      setUsers((prev) => prev.map((u) => (u.id === selectedUser.id ? { ...u, status: newStatus, reason } : u)))
    }
  }

  const filteredUsers = users.filter(
    (user) => user.status === statusFilter && user.name.toLowerCase().includes(search.toLowerCase()),
  )

  const getStatusBadge = (status: string) => {
    const variants = {
      under_review: "bg-yellow-100 text-yellow-800 border-yellow-200",
      active: "bg-green-100 text-green-800 border-green-200",
      inactive: "bg-gray-100 text-gray-800 border-gray-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
    }
    return variants[status as keyof typeof variants] || variants.under_review
  }

  const getActionButton = (statusOption: string) => {
    const configs = {
      active: { icon: CheckCircle, label: "Aprobar", variant: "default" as const },
      rejected: { icon: XCircle, label: "Rechazar", variant: "destructive" as const },
      inactive: { icon: Pause, label: "Desactivar", variant: "secondary" as const },
      under_review: { icon: RotateCcw, label: "Volver a revisión", variant: "outline" as const },
    }
    return configs[statusOption as keyof typeof configs]
  }

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-t-lg border-b">
        <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg mr-3">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          Usuarios en Revisión
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">Gestiona las solicitudes de usuarios pendientes</p>
      </CardHeader>

      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          <div className="relative w-full sm:w-1/2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="relative w-full sm:w-52">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="pl-10">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="border border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-600 flex items-center">
                        <span className="font-medium mr-2">Email:</span> {user.email}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center">
                        <span className="font-medium mr-2">Empresa:</span> {user.company}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center">
                        <span className="font-medium mr-2">Razón actual:</span> {user.reason || "—"}
                      </p>
                    </div>
                    <Badge className={`mt-3 ${getStatusBadge(user.status)}`}>{user.status}</Badge>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    {["active", "rejected", "inactive", "under_review"].map((statusOption) => {
                      const config = getActionButton(statusOption)
                      const Icon = config.icon

                      return (
                        <Dialog key={statusOption} onOpenChange={handleOpenChange}>
                          <DialogTrigger asChild>
                            <Button
                              variant={config.variant}
                              size="sm"
                              className="justify-start"
                              onClick={() => {
                                setSelectedUser(user)
                                setNewStatus(statusOption)
                              }}
                            >
                              <Icon className="h-4 w-4 mr-2" />
                              {config.label}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="space-y-4 bg-white">
                            <DialogTitle>Motivo del cambio</DialogTitle>
                            <p className="text-sm text-gray-600">
                              Indica el motivo para cambiar el estado a <strong>{newStatus}</strong>.
                            </p>
                            <Input
                              placeholder="Motivo del cambio"
                              value={reason}
                              onChange={(e) => setReason(e.target.value)}
                            />
                            <Button onClick={handleStatusSubmit} className="w-full">
                              Confirmar cambio
                            </Button>
                          </DialogContent>
                        </Dialog>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">No se encontraron usuarios con el filtro aplicado</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
