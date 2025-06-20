// v0 was here
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Badge } from "@/Components/ui/badge"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/Components/ui/dialog"
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Pause,
  RotateCcw,
  Loader2,
  Users,
  Building2,
  Store,
  Mail,
  Phone,
  MapPin,
  FileText,
  User,
  Calendar,
  Clock,
  Package,
  CreditCard,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar"
import { Separator } from "@/Components/ui/separator"
import { useToast } from "@/Components/ui/use-toast"

type ReviewSection = "users" | "companies" | "pdes"
type ReviewItem = {
  id: string
  type: ReviewSection
  name: string
}

interface ReviewDetailViewProps {
  item: ReviewItem
  adminId: string
  onBack: () => void
  onStatusChanged: () => void
}

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

const getActionButton = (statusOption: string) => {
  const configs = {
    active: { icon: CheckCircle, label: "Aprobar", variant: "default" as const },
    rejected: { icon: XCircle, label: "Rechazar", variant: "destructive" as const },
    inactive: { icon: Pause, label: "Desactivar", variant: "secondary" as const },
    under_review: { icon: RotateCcw, label: "Volver a revisión", variant: "outline" as const },
  }
  return configs[statusOption as keyof typeof configs]
}

// Función para obtener acciones disponibles basadas en el estado actual
const getAvailableActions = (currentStatus: string) => {
  const allActions = ["active", "rejected", "inactive", "under_review"]
  return allActions.filter((action) => action !== currentStatus)
}

export default function ReviewDetailView({ item, adminId, onBack, onStatusChanged }: ReviewDetailViewProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedAction, setSelectedAction] = useState<string>("")
  const [reason, setReason] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        let response
        if (item.type === "companies") {
          response = await fetch(`/api/companies/${item.id}/full-detail`)
        } else if (item.type === "pdes") {
          response = await fetch(`/api/pdes/${item.id}/full-detail`)
        } else {
          // Para usuarios, usar el endpoint de review-list y filtrar
          response = await fetch("/api/users/review-list")
          const users = await response.json()
          const user = users.find((u: any) => u.id === item.id)
          setData(user)
          setLoading(false)
          return
        }

        if (response.ok) {
          const result = await response.json()
          setData(result)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [item])

  const handleStatusSubmit = async () => {
    if (!selectedAction || !reason) return

    setIsSubmitting(true)
    try {
      let endpoint = ""
      if (item.type === "users") {
        endpoint = `/api/users/${item.id}/change-status`
      } else if (item.type === "companies") {
        endpoint = `/api/companies/${item.id}/change-status`
      } else if (item.type === "pdes") {
        endpoint = `/api/pdes/${item.id}/change-status`
      }

      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newStatus: selectedAction,
          reason,
          changed_by_id: adminId,
        }),
      })

      if (response.ok) {
        toast({
          title: "Estado actualizado",
          description: `El estado ha sido cambiado a ${getStatusLabel(selectedAction)} correctamente.`,
        })
        onStatusChanged()
      } else {
        throw new Error("Error al actualizar el estado")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      setSelectedAction("")
      setReason("")
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedAction("")
      setReason("")
    }
  }

  if (loading) {
    return (
      <Card className="shadow-lg border border-gray-200 rounded-xl overflow-hidden">
        <CardContent className="p-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Cargando información...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card className="shadow-lg border border-gray-200 rounded-xl overflow-hidden">
        <CardContent className="p-8">
          <div className="text-center">
            <p className="text-red-600">Error al cargar la información</p>
            <Button onClick={onBack} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getIcon = () => {
    switch (item.type) {
      case "users":
        return Users
      case "companies":
        return Building2
      case "pdes":
        return Store
      default:
        return FileText
    }
  }

  const getTypeLabel = () => {
    switch (item.type) {
      case "users":
        return "Usuario"
      case "companies":
        return "Empresa"
      case "pdes":
        return "Punto de Entrega"
      default:
        return "Elemento"
    }
  }

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
            {item.type === "companies" ? "Activa" : "Activo"}
          </Badge>
        )
      case "inactive":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">
            {item.type === "companies" ? "Inactiva" : "Inactivo"}
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
            {item.type === "companies" ? "Rechazada" : "Rechazado"}
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const Icon = getIcon()

  return (
    <Card className="shadow-lg border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <CardHeader className="bg-gradient-to-br from-blue-50 via-slate-50 to-white p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={onBack} className="border-gray-300 hover:bg-gray-100">
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver
            </Button>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-xl shadow-sm">
                <Icon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-gray-800">
                  Revisar {getTypeLabel()}: {item.name}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">Revisa toda la información antes de tomar una decisión</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">{getStatusBadge(data.status || "under_review")}</div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información básica */}
            <Card className="shadow-sm border border-gray-200 rounded-xl">
              <CardHeader className="bg-gray-50 p-4 border-b">
                <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Información Básica
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {item.type === "users" && (
                  <>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
                        <AvatarImage src={data.avatar || "/placeholder.svg"} alt={data.name} />
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-lg">
                          {data.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{data.name}</h3>
                        <p className="text-gray-600">{data.email}</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">Email:</span>
                        <span>{data.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">Empresa:</span>
                        <span>{data.company || "No asignada"}</span>
                      </div>
                    </div>
                  </>
                )}

                {item.type === "companies" && (
                  <>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16 border-2 border-white shadow-sm rounded-lg">
                        <AvatarImage
                          src={data.company?.logo_url || "/placeholder.svg?height=64&width=64&query=company+logo"}
                          alt={`Logo de ${data.company?.legal_name}`}
                          className="object-contain p-1"
                        />
                        <AvatarFallback className="bg-green-100 text-green-700 text-lg rounded-lg">
                          {data.company?.legal_name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2) || "EM"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{data.company?.legal_name}</h3>
                        {data.company?.trade_name && <p className="text-gray-600">{data.company.trade_name}</p>}
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">Cédula Jurídica:</span>
                        <span>{data.company?.legal_id}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">Tipo:</span>
                        <span>{data.company?.company_type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">Email:</span>
                        <span>{data.company?.contact_email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">Teléfono:</span>
                        <span>{data.company?.contact_phone || "No especificado"}</span>
                      </div>
                    </div>
                    {data.company?.fiscal_address && (
                      <>
                        <Separator />
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                          <div>
                            <span className="font-medium">Dirección Fiscal:</span>
                            <p className="text-gray-700 mt-1">{data.company.fiscal_address}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}

                {item.type === "pdes" && (
                  <>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16 border-2 border-white shadow-sm rounded-lg">
                        <AvatarImage
                          src={data.company?.logo_url || "/placeholder.svg?height=64&width=64&query=store+logo"}
                          alt={`Logo de ${data.name}`}
                          className="object-contain p-1"
                        />
                        <AvatarFallback className="bg-purple-100 text-purple-700 text-lg rounded-lg">
                          {data.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2) || "PD"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{data.name}</h3>
                        {data.company?.trade_name && <p className="text-gray-600">{data.company.trade_name}</p>}
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">Email:</span>
                        <span>{data.business_email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">WhatsApp:</span>
                        <span>{data.whatsapp_contact || "No especificado"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">Ubicación:</span>
                        <span>{`${data.province}, ${data.canton}, ${data.district}`}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">Área:</span>
                        <span>{data.storage_area_m2} m²</span>
                      </div>
                    </div>
                    {data.exact_address && (
                      <>
                        <Separator />
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                          <div>
                            <span className="font-medium">Dirección Exacta:</span>
                            <p className="text-gray-700 mt-1">{data.exact_address}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Información adicional específica */}
            {item.type === "companies" && data.legalRep && (
              <Card className="shadow-sm border border-gray-200 rounded-xl">
                <CardHeader className="bg-gray-50 p-4 border-b">
                  <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Representante Legal
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Nombre:</span>
                      <span>{data.legalRep.full_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Identificación:</span>
                      <span>
                        {data.legalRep.DocumentTypes?.name}: {data.legalRep.identification_number}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Email:</span>
                      <span>{data.legalRep.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Teléfono:</span>
                      <span>{data.legalRep.primary_phone}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {item.type === "pdes" && (
              <>
                {/* Servicios */}
                <Card className="shadow-sm border border-gray-200 rounded-xl">
                  <CardHeader className="bg-gray-50 p-4 border-b">
                    <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      Servicios Disponibles
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {data.services_json &&
                        Object.entries(data.services_json).map(([key, value]) => (
                          <div
                            key={key}
                            className={`flex items-center gap-2 p-2 rounded-lg ${
                              value ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                            }`}
                          >
                            {value ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                            <span className="text-sm font-medium capitalize">{key}</span>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Tamaños aceptados */}
                <Card className="shadow-sm border border-gray-200 rounded-xl">
                  <CardHeader className="bg-gray-50 p-4 border-b">
                    <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <Package className="h-5 w-5 text-blue-600" />
                      Tamaños Aceptados
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex flex-wrap gap-2">
                      {["xs", "s", "m", "l", "xl", "xxl", "xxxl"].map((size) => {
                        const accepts = data[`accepts_${size}`]
                        return (
                          <Badge
                            key={size}
                            variant="outline"
                            className={
                              accepts
                                ? "bg-green-100 text-green-700 border-green-300"
                                : "bg-red-100 text-red-700 border-red-300"
                            }
                          >
                            {accepts ? <CheckCircle className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
                            {size.toUpperCase()}
                          </Badge>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Panel de acciones */}
          <div className="space-y-6">
            {/* Información de estado */}
            <Card className="shadow-sm border border-gray-200 rounded-xl">
              <CardHeader className="bg-gray-50 p-4 border-b">
                <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Estado Actual
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="text-center">{getStatusBadge(data.status || "under_review")}</div>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">Creado:</span>
                    <span>{formatDate(data.created_at || data.company?.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">Actualizado:</span>
                    <span>{formatDate(data.updated_at || data.company?.updated_at)}</span>
                  </div>
                  {data.reason && (
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <span className="font-medium">Razón actual:</span>
                        <p className="text-gray-700 mt-1">{data.reason}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Acciones disponibles */}
            <Card className="shadow-sm border border-gray-200 rounded-xl">
              <CardHeader className="bg-gray-50 p-4 border-b">
                <CardTitle className="text-lg font-semibold text-gray-800">Acciones Disponibles</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                {getAvailableActions(data.status || "under_review").map((statusOption) => {
                  const config = getActionButton(statusOption)
                  const ActionIcon = config.icon

                  return (
                    <Dialog key={statusOption} onOpenChange={handleOpenChange}>
                      <DialogTrigger asChild>
                        <Button
                          variant={config.variant}
                          className="w-full justify-start"
                          onClick={() => setSelectedAction(statusOption)}
                        >
                          <ActionIcon className="h-4 w-4 mr-2" />
                          {config.label}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md bg-white">
                        <DialogTitle className="text-lg font-semibold">Cambiar Estado del {getTypeLabel()}</DialogTitle>
                        <div className="space-y-4">
                          <p className="text-sm text-gray-600">
                            ¿Estás seguro de cambiar el estado de <strong>{item.name}</strong> a{" "}
                            <strong>{getStatusLabel(selectedAction)}</strong>?
                          </p>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Motivo del cambio:</label>
                            <Input
                              placeholder="Describe el motivo del cambio de estado"
                              value={reason}
                              onChange={(e) => setReason(e.target.value)}
                              className="w-full"
                            />
                          </div>
                          <div className="flex gap-2 pt-4">
                            <Button onClick={() => handleOpenChange(false)} variant="outline" className="flex-1">
                              Cancelar
                            </Button>
                            <Button
                              onClick={handleStatusSubmit}
                              disabled={!reason.trim() || isSubmitting}
                              className="flex-1"
                            >
                              {isSubmitting ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  Procesando...
                                </>
                              ) : (
                                "Confirmar cambio"
                              )}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
