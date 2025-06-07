"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/Components/ui/card"
import { Badge } from "@/Components/ui/badge"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/Components/ui/dialog"

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
      .then(async r => {
        const txt = await r.text()
        try {
          const data = JSON.parse(txt)
          if (Array.isArray(data)) setUsers(data)
          else console.error("Respuesta no array:", data)
        } catch (e) {
          console.error("JSON parse error:", e, txt)
        }
      })
      .catch(e => console.error("Fetch error:", e))
  }, [statusFilter])




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
      })
    })

    if (res.ok) {
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, status: newStatus, reason } : u))
    }
  }

  const filteredUsers = users.filter((user) =>
    user.status === statusFilter &&
    user.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Revisión de Usuarios</h1>

      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <Input
          placeholder="Buscar por nombre"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-1/2"
        />

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="border border-gray-200">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">{user.name}</h2>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <p className="text-sm text-gray-600">Empresa: {user.company}</p>
                  <p className="text-sm text-gray-600">Razón actual: {user.reason}</p>
                  <Badge variant="outline" className="mt-1">{user.status}</Badge>
                </div>
                <div className="flex flex-col gap-2">
                  {["active", "rejected", "inactive", "under_review"].map((statusOption) => (
                    <Dialog key={statusOption} onOpenChange={handleOpenChange}>
                      <DialogTrigger asChild>
                        <Button
                          variant={
                            statusOption === "active"
                              ? "outline"
                              : statusOption === "rejected"
                                ? "destructive"
                                : "ghost"
                          }
                          onClick={() => {
                            setSelectedUser(user)
                            setNewStatus(statusOption)
                          }}
                        >
                          {statusOption === "active" && "Aprobar"}
                          {statusOption === "rejected" && "Rechazar"}
                          {statusOption === "inactive" && "Desactivar"}
                          {statusOption === "under_review" && "Volver a revisión"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="space-y-4 bg-white">
                        <DialogTitle>Motivo del rechazo</DialogTitle>   {/* 👈 Obligatorio */}
                        {/* <DialogDescription></DialogDescription> */}
                        <p className="text-sm">Por favor, indica el motivo para cambiar el estado a <strong>{newStatus}</strong>.</p>
                        <Input
                          placeholder="Motivo del cambio"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                        />
                        <Button onClick={handleStatusSubmit}>Confirmar</Button>
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
