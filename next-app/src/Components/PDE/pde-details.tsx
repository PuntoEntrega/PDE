// v0 was here
"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/Components/ui/use-toast"
import { PDEGeneralInfo } from "./pde-general-info"
import { PDEFiscalInfo } from "./pde-fiscal-info"
import { PDEUsers } from "./pde-users"
import {
  Store,
  Mail,
  Phone,
  MapPin,
  ArrowLeft,
  Edit,
  CheckCircle,
  XCircle,
  Loader2,
  Info,
  CalendarDays,
  Clock,
  ExternalLink,
  Share2,
  Download,
  Package,
  CreditCard,
  Users,
} from "lucide-react"
import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Badge } from "@/Components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/Components/ui/tooltip"
import { Sidebar } from "../Sidebar/Sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs"
import { getPDEById } from "@/Services/pde/pde"
import { EditPDEGeneralForm } from "./edit-pde-general-form"

interface InfoRowProps {
  icon: React.ElementType
  label: string
  value?: string | React.ReactNode
  isLink?: boolean
  href?: string
  className?: string
}

const InfoRow: React.FC<InfoRowProps> = ({ icon: Icon, label, value, isLink, href, className }) => {
  if (value === undefined || value === null || value === "") return null
  return (
    <div className={`flex items-start py-4 ${className}`}>
      <div className="p-2 bg-blue-50 rounded-lg mr-3 mt-0.5 flex-shrink-0 shadow-sm">
        <Icon className="h-4 w-4 text-blue-600" />
      </div>
      <div className="flex-1">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{label}</p>
        {isLink && href ? (
          <a
            href={href}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline break-words flex items-center group"
          >
            {value}
            <ExternalLink className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        ) : (
          <div className="text-sm font-medium text-gray-800 break-words">{value}</div>
        )}
      </div>
    </div>
  )
}

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
    <CardContent className="p-5 divide-y divide-gray-100">{children}</CardContent>
  </Card>
)

interface PDEDetailsProps {
  pdeId: string
}

export function PDEDetails({ pdeId }: PDEDetailsProps) {
  const router = useRouter()
  const [pde, setPDE] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  const { toast } = useToast()

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await getPDEById(pdeId)
        setPDE(data)
      } catch (e) {
        console.error(e)
        setPDE(null)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [pdeId])

  const [isToggling, setIsToggling] = useState(false)

  async function toggleActive() {
    if (!pde) return
    setIsToggling(true)
    try {
      const res = await fetch(`/api/pdes/${pde.id}/edit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !pde.active }),
      })
      if (!res.ok) throw new Error("Error al cambiar estado")
      setPDE((prev) => prev && { ...prev, active: !prev.active })
      toast({
        title: pde.active ? "Punto de entrega desactivado" : "Punto de entrega activado",
        description: `El punto de entrega ha sido ${pde.active ? "desactivado" : "activado"} correctamente.`,
      })
    } catch (e) {
      console.error(e)
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado del punto de entrega.",
        variant: "destructive",
      })
    } finally {
      setIsToggling(false)
    }
  }

  if (loading) {
    return (
      <Sidebar>
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Cargando información del punto de entrega...</p>
          </div>
        </div>
      </Sidebar>
    )
  }

  if (isEditing && pde) {
    return (
      <EditPDEGeneralForm
        pde={pde}
        onCancel={() => setIsEditing(false)}
        onSave={(updatedPDE) => {
          setPDE(updatedPDE)
          setIsEditing(false)
          toast({
            title: "Punto de entrega actualizado",
            description: "Los cambios han sido guardados correctamente.",
          })
        }}
      />
    )
  }

  if (!pde) {
    return (
      <Sidebar>
        <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] text-center p-4">
          <div className="bg-red-50 p-6 rounded-full mb-4">
            <XCircle className="h-16 w-16 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2 text-gray-800">Punto de entrega no encontrado</h1>
          <p className="text-gray-600 mb-8 max-w-md">
            No pudimos encontrar los detalles de este punto de entrega. Es posible que haya sido eliminado o que no
            tengas permisos para verlo.
          </p>
          <Button onClick={() => router.push("/pde")} className="bg-blue-600 hover:bg-blue-700 text-white">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver a la Lista de Puntos de Entrega
          </Button>
        </div>
      </Sidebar>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("es-CR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Función para obtener el badge de estado
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "under_review":
        return (
          <Badge
            variant="outline"
            className="px-3 py-1 text-xs font-semibold bg-yellow-100 text-yellow-700 border-yellow-300"
          >
            En Revisión
          </Badge>
        )
      case "approved":
        return (
          <Badge
            variant="outline"
            className="px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 border-green-300"
          >
            Aprobado
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="px-3 py-1 text-xs font-semibold bg-red-100 text-red-700 border-red-300">
            Rechazado
          </Badge>
        )
      default:
        return (
          <Badge
            variant="outline"
            className="px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-700 border-gray-300"
          >
            Desconocido
          </Badge>
        )
    }
  }

  return (
    <Sidebar>
      <div className="max-w-7xl mx-auto space-y-8 px-4 py-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 border-gray-300"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver
          </Button>

          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="border-gray-300">
                    <Share2 className="h-4 w-4 text-gray-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Compartir información</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="border-gray-300">
                    <Download className="h-4 w-4 text-gray-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Descargar información</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <Card className="shadow-xl overflow-hidden border-0 rounded-xl">
          <div className="bg-gradient-to-br from-blue-50 via-slate-50 to-white p-8 sm:p-10">
            <div className="flex flex-col sm:flex-row items-start gap-8">
              <div className="relative">
                <Avatar className="h-32 w-32 rounded-lg border-4 border-white shadow-xl">
                  <AvatarImage
                    src={pde.company?.logo_url || "/placeholder.svg?height=128&width=128&query=store+logo"}
                    alt={`Logo de ${pde.name}`}
                    className="object-contain p-1"
                  />
                  <AvatarFallback className="text-4xl font-semibold bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 rounded-lg">
                    {pde.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <Badge
                  variant={pde.active ? "default" : "destructive"}
                  className={`absolute -bottom-2 right-0 px-3 py-1 text-xs font-semibold ${
                    pde.active
                      ? "bg-green-100 text-green-700 border border-green-300"
                      : "bg-red-100 text-red-700 border border-red-300"
                  }`}
                >
                  {pde.active ? (
                    <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                  ) : (
                    <XCircle className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  {pde.active ? "Activo" : "Inactivo"}
                </Badge>
              </div>

              <div className="flex-1 mt-2 sm:mt-0">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  {getStatusBadge(pde.status)}

                  {pde.company?.trade_name && (
                    <Badge variant="outline" className="px-3 py-1 text-xs font-semibold border-gray-300 text-gray-700">
                      <Store className="mr-1.5 h-3.5 w-3.5" />
                      {pde.company.trade_name}
                    </Badge>
                  )}
                </div>

                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">{pde.name}</h1>

                <div className="mt-4 flex flex-wrap items-center gap-4">
                  {pde.business_email && (
                    <a
                      href={`mailto:${pde.business_email}`}
                      className="flex items-center text-sm text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      <Mail className="h-4 w-4 mr-1.5" />
                      {pde.business_email}
                    </a>
                  )}

                  {pde.whatsapp_contact && (
                    <a
                      href={`tel:${pde.whatsapp_contact}`}
                      className="flex items-center text-sm text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      <Phone className="h-4 w-4 mr-1.5" />
                      {pde.whatsapp_contact}
                    </a>
                  )}

                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-1.5" />
                    {`${pde.province}, ${pde.canton}, ${pde.district}`}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0 self-start sm:self-center shrink-0">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                >
                  <Edit className="mr-2 h-4 w-4" /> Editar
                </Button>
                <Button
                  variant="outline"
                  className={`w-full justify-start ${
                    pde.active
                      ? "text-red-600 border-red-200 hover:bg-red-50"
                      : "text-green-600 border-green-200 hover:bg-green-50"
                  }`}
                  onClick={toggleActive}
                  disabled={isToggling}
                >
                  {pde.active ? (
                    <XCircle className="mr-2 h-4 w-4 text-red-600" />
                  ) : (
                    <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                  )}
                  {pde.active ? "Desactivar" : "Activar"}
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-8 py-4 border-t border-b">
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center">
                <CalendarDays className="h-5 w-5 text-gray-500 mr-2" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Registrado el</p>
                  <p className="text-sm font-semibold text-gray-800">{formatDate(pde.created_at)}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-500 mr-2" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Última actualización</p>
                  <p className="text-sm font-semibold text-gray-800">{formatDate(pde.updated_at)}</p>
                </div>
              </div>

              {/* <div className="flex items-center">
                <Package className="h-5 w-5 text-gray-500 mr-2" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Área de almacenamiento</p>
                  <p className="text-sm font-semibold text-gray-800">{pde.storage_area_m2} m²</p>
                </div>
              </div> */}
            </div>
          </div>
        </Card>

        {/* Tabs para diferentes secciones */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-xl">
            <TabsTrigger value="general" className="flex items-center gap-2 data-[state=active]:bg-white">
              <Info className="h-4 w-4" />
              Datos Generales
            </TabsTrigger>
            <TabsTrigger value="fiscal" className="flex items-center gap-2 data-[state=active]:bg-white">
              <CreditCard className="h-4 w-4" />
              Datos Fiscales
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2 data-[state=active]:bg-white">
              <Users className="h-4 w-4" />
              Usuarios del PdE
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-6">
            <PDEGeneralInfo pde={pde} />
          </TabsContent>

          <TabsContent value="fiscal" className="mt-6">
            <PDEFiscalInfo pde={pde} />
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <PDEUsers pde={pde} />
          </TabsContent>
        </Tabs>
      </div>
    </Sidebar>
  )
}
