"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Badge } from "@/Components/ui/badge"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/Components/ui/dialog"
import { MapPin, Search, Filter, CheckCircle, XCircle, Pause, RotateCcw, Mail, MessageCircle } from "lucide-react"

const statuses = ["under_review", "active", "inactive", "rejected"] as const

interface ReviewPDEPageClientProps {
  adminId: string
}

export default function ReviewPDEPageClient({ adminId }: ReviewPDEPageClientProps) {
  const [statusFilter, setStatusFilter] = useState<string>("under_review")
  const [search, setSearch] = useState("")
  const [pdes, setPDEs] = useState<any[]>([])
  const [selectedPDE, setSelectedPDE] = useState<any>(null)
  const [newStatus, setNewStatus] = useState<string>("")
  const [reason, setReason] = useState<string>("")

  useEffect(() => {
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
  }, [statusFilter])

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedPDE(null)
      setNewStatus("")
      setReason("")
    }
  }

  const handleStatusSubmit = async () => {
    if (!selectedPDE || !newStatus || !reason) return

    const res = await fetch(`/api/pdes/${selectedPDE.id}/change-status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        newStatus,
        reason,
        changed_by_id: adminId,
      }),
    })

    if (res.ok) {
      setPDEs((prev) => prev.map((p) => (p.id === selectedPDE.id ? { ...p, status: newStatus, reason } : p)))
    }
  }

  const filteredPDEs = pdes.filter(
    (pde) =>
      pde.status === statusFilter &&
      (pde.name?.toLowerCase().includes(search.toLowerCase()) ||
        pde.trade_name?.toLowerCase().includes(search.toLowerCase())),
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
      <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-t-lg border-b">
        <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
          <div className="p-2 bg-purple-100 rounded-lg mr-3">
            <MapPin className="h-6 w-6 text-purple-600" />
          </div>
          Puntos de Entrega en Revisión
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">Gestiona las solicitudes de PDEs pendientes</p>
      </CardHeader>

      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          <div className="relative w-full sm:w-1/2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre o comercial"
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
          {filteredPDEs.map((pde) => (
            <Card key={pde.id} className="border border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{pde.name}</h3>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-600 flex items-center">
                        <span className="font-medium mr-2">Nombre Comercial:</span> {pde.trade_name || "—"}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        {pde.business_email || "—"}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center">
                        <MessageCircle className="h-4 w-4 mr-2 text-gray-400" />
                        {pde.whatsapp_contact || "—"}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center">
                        <span className="font-medium mr-2">Razón actual:</span> {pde.reason || "—"}
                      </p>
                    </div>
                    <Badge className={`mt-3 ${getStatusBadge(pde.status)}`}>{pde.status}</Badge>
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
                                setSelectedPDE(pde)
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

          {filteredPDEs.length === 0 && (
            <div className="text-center py-8 text-gray-500">No se encontraron PDEs con el filtro aplicado</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
