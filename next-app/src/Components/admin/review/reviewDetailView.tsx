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
  Calendar,
  Clock,
  Package,
  CreditCard,
  Smartphone,
  Car,
  Accessibility,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar"
import { useToast } from "@/Components/ui/use-toast"
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

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

  // Corrige los íconos por defecto de Leaflet
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  })

  // Handler para redirigir al hacer clic en el mapa
  function ClickRedirectHandler({ latitude, longitude }: { latitude: number; longitude: number }) {
    useMap().on("click", () => {
      window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, "_blank")
    })
    return null
  }

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
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Cargando información...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="text-center">
          <p className="text-red-600">Error al cargar la información</p>
          <Button onClick={onBack} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver
          </Button>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "under_review":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            En Revisión
          </Badge>
        )
      case "active":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            Activo
          </Badge>
        )
      case "inactive":
        return (
          <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
            Inactivo
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">
            Rechazado
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
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

  const formatSchedule = (scheduleJson: any) => {
    if (!scheduleJson) return []

    const days: { [key in DayKeys]: string } = {
      monday: "Lunes",
      tuesday: "Martes",
      wednesday: "Miércoles",
      thursday: "Jueves",
      friday: "Viernes",
      saturday: "Sábado",
      sunday: "Domingo",
    }

    type DayKeys = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"

    return Object.entries(scheduleJson).map(([day, config]: [string, any]) => ({
      day: days[day as DayKeys],
      isOpen: config.isOpen,
      hours: config.isOpen ? `${config.openTime} - ${config.closeTime}` : "Cerrado",
    }))
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header con acciones */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="border-gray-300 hover:bg-gray-100">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>

        {/* Acciones disponibles */}
        <div className="flex gap-2">
          {getAvailableActions(data.status || "under_review").map((statusOption) => {
            const config = getActionButton(statusOption)
            const ActionIcon = config.icon

            return (
              <Dialog key={statusOption} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>
                  <Button
                    variant={config.variant}
                    size="sm"
                    className={`transition-all duration-200 hover:scale-[1.02] hover:shadow-sm ${statusOption === "active"
                      ? "hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700"
                      : statusOption === "rejected"
                        ? "hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700"
                        : statusOption === "inactive"
                          ? "hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700"
                          : "hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
                      }`}
                    onClick={() => setSelectedAction(statusOption)}
                  >
                    <ActionIcon className="h-4 w-4 mr-2" />
                    {config.label}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-white">
                  <DialogTitle className="text-lg font-semibold">Cambiar Estado del PdE</DialogTitle>
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
                      <Button onClick={handleStatusSubmit} disabled={!reason.trim() || isSubmitting} className="flex-1">
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
        </div>
      </div>

      <div className="space-y-8">
        {/* Información principal del PDE */}
        <Card className="shadow-sm border border-gray-200 rounded-xl relative">
          {/* Badge de estado en esquina superior derecha */}
          <div className="absolute top-6 right-6 z-10">{getStatusBadge(data.status || "under_review")}</div>

          <CardContent className="p-8">
            <div className="flex items-center gap-6 mb-8">
              <div className="p-5 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl shadow-sm">
                <Store className="h-16 w-16 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{data.name}</h1>
              </div>
            </div>

            {/* Contacto */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4 pb-2 border-b-2 border-blue-100">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Contacto</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-11">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Email</p>
                    <p className="text-gray-900 font-medium">{data.business_email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">WhatsApp</p>
                    <p className="text-gray-900 font-medium">{data.whatsapp_contact || "No especificado"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Paquetería */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4 pb-2 border-b-2 border-blue-100">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Paquetería</h2>
              </div>
              <div className="ml-11 space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg w-fit">
                  <Package className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Área de bodega</p>
                    <p className="text-gray-900 font-bold">{data.storage_area_m2} m²</p>
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 mb-3">Tamaños aceptados:</p>
                  <div className="flex flex-wrap gap-3">
                    {["xs", "s", "m", "l", "xl", "xxl", "xxxl"]
                      .filter((size) => data[`accepts_${size}`])
                      .map((size) => (
                        <div
                          key={size}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200"
                        >
                          <Package className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-bold text-blue-700">{size.toUpperCase()}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Métodos de Pago */}
            {data.services_json && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4 pb-2 border-b-2 border-blue-100">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Métodos de Pago</h2>
                </div>
                <div className="ml-11 flex flex-wrap gap-3">
                  {data.services_json.cash && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 rounded-lg border border-blue-200">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-700">Efectivo</span>
                    </div>
                  )}
                  {data.services_json.cards && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 rounded-lg border border-blue-200">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-700">Tarjetas</span>
                    </div>
                  )}
                  {data.services_json.sinpe && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 rounded-lg border border-blue-200">
                      <Smartphone className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-700">Sinpe Móvil</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Servicios Adicionales */}
            {data.services_json && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4 pb-2 border-b-2 border-blue-100">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Servicios Adicionales</h2>
                </div>
                <div className="ml-11 flex flex-wrap gap-3">
                  {data.services_json.guidesPrinting && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 rounded-lg border border-blue-200">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-700">Impresión de guías</span>
                    </div>
                  )}
                  {data.services_json.parking && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 rounded-lg border border-blue-200">
                      <Car className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-700">Parqueo</span>
                    </div>
                  )}
                  {data.services_json.accessibility && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 rounded-lg border border-blue-200">
                      <Accessibility className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-700">Accesibilidad</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Horarios */}
            {data.schedule_json && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4 pb-2 border-b-2 border-blue-100">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Horarios de Atención</h2>
                </div>
                <div className="ml-11 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {formatSchedule(data.schedule_json).map((schedule, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${schedule.isOpen ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"
                        }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className={`h-4 w-4 ${schedule.isOpen ? "text-blue-600" : "text-gray-400"}`} />
                        <span className={`font-medium ${schedule.isOpen ? "text-blue-700" : "text-gray-500"}`}>
                          {schedule.day}
                        </span>
                      </div>
                      <p className={`text-sm ${schedule.isOpen ? "text-blue-600" : "text-gray-500"}`}>
                        {schedule.hours}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ubicación */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4 pb-2 border-b-2 border-blue-100">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Ubicación</h2>
              </div>
              <div className="ml-11 space-y-4">
                {/* Espacio reservado para mapa */}
                <div className="h-48 rounded-lg overflow-hidden border border-gray-300">
                  <MapContainer
                    center={[data.latitude, data.longitude]}
                    zoom={15}
                    style={{ height: "100%", width: "100%" }}
                    scrollWheelZoom={false}
                    dragging={false}
                    zoomControl={false}
                    doubleClickZoom={false}
                    attributionControl={false}
                    touchZoom={false}
                    boxZoom={false}
                    keyboard={false}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[data.latitude, data.longitude]} />
                    <ClickRedirectHandler latitude={data.latitude} longitude={data.longitude} />
                  </MapContainer>
                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Provincia</p>
                      <p className="text-gray-900 font-medium">{data.province}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Cantón</p>
                      <p className="text-gray-900 font-medium">{data.canton}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Distrito</p>
                      <p className="text-gray-900 font-medium">{data.district}</p>
                    </div>
                  </div>
                  {data.exact_address && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg md:col-span-2">
                      <MapPin className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Dirección exacta</p>
                        <p className="text-gray-900 font-medium">{data.exact_address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Información de Registro */}
            <div>
              <div className="flex items-center gap-3 mb-4 pb-2 border-b-2 border-blue-100">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Información de Registro</h2>
              </div>
              <div className="ml-11 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Fecha de creación</p>
                    <p className="text-gray-900 font-medium">{formatDate(data.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Última actualización</p>
                    <p className="text-gray-900 font-medium">{formatDate(data.updated_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Empresa asociada */}
        {data.company && (
          <Card className="shadow-sm border border-gray-200 rounded-xl">
            <CardHeader className="bg-gray-50 p-4 border-b">
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-slate-600" />
                Empresa Asociada
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border border-slate-200 rounded-lg">
                  <AvatarImage
                    src={data.company.logo_url || "/placeholder.svg?height=48&width=48&query=company+logo"}
                    alt={`Logo de ${data.company.trade_name}`}
                    className="object-contain p-1"
                  />
                  <AvatarFallback className="bg-slate-100 text-slate-600 text-sm rounded-lg">
                    {data.company.trade_name?.charAt(0).toUpperCase() || "E"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-gray-900">{data.company.trade_name}</h4>
                  <p className="text-sm text-slate-600">{data.company.company_type}</p>
                  {data.company.active !== undefined && (
                    <Badge
                      variant="outline"
                      className={`mt-1 text-xs ${data.company.active
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-50 text-slate-700 border-slate-200"
                        }`}
                    >
                      {data.company.active ? "Activa" : "Inactiva"}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
