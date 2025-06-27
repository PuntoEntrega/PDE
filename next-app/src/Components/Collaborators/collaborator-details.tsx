"use client"

import { useState, useEffect } from "react"
import {
    ArrowLeft,
    Mail,
    Phone,
    Calendar,
    Building2,
    Shield,
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle,
    Edit,
    Trash2,
    UserCheck,
    UserX,
    Send,
    MoreHorizontal,
    Eye,
    History,
    Settings,
    MapPin,
    Navigation,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Badge } from "@/Components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar"
import { Separator } from "@/Components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/Components/ui/tooltip"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/Components/ui/dialog"
import type { CollaboratorSummary } from "@/lib/types/collaborator"
import {
    getCollaboratorById,
    toggleCollaboratorActive,
    toggleCollaboratorStatus,
    resendCollaboratorInvitation,
} from "@/Services/collaborators"
import { useToast } from "@/Components/ui/use-toast"
import { InvitationForm } from "./invitation-form";

interface Props {
    collaboratorId: string
}

export function CollaboratorDetails({ collaboratorId }: Props) {
    const [collaborator, setCollaborator] = useState<CollaboratorSummary | null>(null)
    const [loading, setLoading] = useState(true)
    const [isDeactivating, setIsDeactivating] = useState(false)
    const [isActivating, setIsActivating] = useState(false)
    const { toast } = useToast()
    const [isEditing, setIsEditing] = useState(false);

    const load = async () => {
        setLoading(true)
        try {
            const data = await getCollaboratorById(collaboratorId)
            setCollaborator(data)
        } catch (err: any) {
            if (err.status === 404) return
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
    }, [collaboratorId])

    if (!collaborator) return null

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "active":
                return {
                    label: "Activo",
                    color: "bg-green-100 text-green-700 border-green-300",
                    icon: CheckCircle,
                    description: "El colaborador está activo y puede acceder al sistema",
                }
            case "inactive":
                return {
                    label: "Inactivo",
                    color: "bg-red-100 text-red-700 border-red-300",
                    icon: XCircle,
                    description: "El colaborador está desactivado y no puede acceder",
                }
            case "under_review":
                return {
                    label: "En Revisión",
                    color: "bg-yellow-100 text-yellow-700 border-yellow-300",
                    icon: Clock,
                    description: "La cuenta está siendo revisada por un administrador",
                }
            case "draft":
                return {
                    label: "Borrador",
                    color: "bg-gray-100 text-gray-700 border-gray-300",
                    icon: AlertTriangle,
                    description: "Invitación enviada, pendiente de aceptación",
                }
            case "rejected":
                return {
                    label: "Rechazado",
                    color: "bg-red-100 text-red-700 border-red-300",
                    icon: XCircle,
                    description: "La solicitud fue rechazada",
                }
            default:
                return {
                    label: status,
                    color: "bg-gray-100 text-gray-700 border-gray-300",
                    icon: AlertTriangle,
                    description: "Estado desconocido",
                }
        }
    }

    const getRoleColor = (roleKey: string) => {
        switch (roleKey) {
            case "super_admin":
                return "bg-purple-100 text-purple-700 border-purple-300"
            case "SuperAdminEmpresa":
                return "bg-blue-100 text-blue-700 border-blue-300"
            case "AdministradorEmpresa":
                return "bg-indigo-100 text-indigo-700 border-indigo-300"
            case "AdminPdE":
                return "bg-green-100 text-green-700 border-green-300"
            case "OperadorPdE":
                return "bg-orange-100 text-orange-700 border-orange-300"
            default:
                return "bg-gray-100 text-gray-700 border-gray-300"
        }
    }

    const getDeliveryPointStatusConfig = (status: string) => {
        switch (status) {
            case "active":
                return {
                    label: "Activo",
                    color: "bg-green-100 text-green-700 border-green-300",
                    icon: CheckCircle,
                }
            case "inactive":
                return {
                    label: "Inactivo",
                    color: "bg-red-100 text-red-700 border-red-300",
                    icon: XCircle,
                }
            case "under_review":
                return {
                    label: "En Revisión",
                    color: "bg-yellow-100 text-yellow-700 border-yellow-300",
                    icon: Clock,
                }
            default:
                return {
                    label: status,
                    color: "bg-gray-100 text-gray-700 border-gray-300",
                    icon: AlertTriangle,
                }
        }
    }

    const formatLocation = (location: { province: string; canton: string; district: string }) => {
        const formatLocationPart = (part: string) => {
            return part.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
        }

        return `${formatLocationPart(location.district)}, ${formatLocationPart(location.canton)}, ${formatLocationPart(location.province)}`
    }

    const statusConfig = getStatusConfig(collaborator.status)
    const StatusIcon = statusConfig.icon

    // Calcular totales de puntos de entrega
    const totalDeliveryPoints = collaborator.companies.reduce((total, company) => {
        return total + (company.puntos_de_entrega?.length || 0)
    }, 0)

    const activeDeliveryPoints = collaborator.companies.reduce((total, company) => {
        return total + (company.puntos_de_entrega?.filter((dp) => dp.active).length || 0)
    }, 0)

    const isPdeRole = collaborator.role.name === "AdminPdE" || collaborator.role.name === "OperadorPdE"

    const handleActiveToggle = async () => {
        setIsActivating(true)
        try {
            const res = await toggleCollaboratorActive(collaborator.id)
            setCollaborator((prev) => (prev ? { ...prev, active: res.active } : prev))

            toast({
                title: `Usuario ${res.active ? "activado" : "desactivado"} correctamente`,
                variant: "default",
            })
        } catch (err) {
            console.error("Error al cambiar estado activo:", err)
            toast({
                title: "Error al cambiar estado activo",
                variant: "destructive",
            })
        } finally {
            setIsActivating(false)
        }
    }

    const handleStatusToggle = async () => {
        setIsDeactivating(true)
        try {
            const res = await toggleCollaboratorStatus(collaborator.id)
            setCollaborator((prev) => (prev ? { ...prev, status: res.status } : prev))

            toast({
                title: `Estado cambiado a ${res.status === "active" ? "activo" : "inactivo"}`,
                variant: "default",
            })
        } catch (err) {
            console.error("Error al cambiar status:", err)
            toast({
                title: "Error al cambiar status",
                variant: "destructive",
            })
        } finally {
            setIsDeactivating(false)
        }
    }

    const handleResendInvitation = async () => {
        try {
            const res = await resendCollaboratorInvitation(collaborator.id)

            toast({
                title: "Invitación reenviada correctamente",
                description: res.message,
                variant: "default",
            })
        } catch (err) {
            console.error("Error al reenviar invitación:", err)
            toast({
                title: "Error al reenviar invitación",
                variant: "destructive",
            })
        }
    }

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString("es-CR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })

    if (isEditing && collaborator) {
        return (
            <InvitationForm
                isEdit
                initialData={{
                    id: collaborator.id,
                    email: collaborator.email,
                    first_name: collaborator.first_name,
                    last_name: collaborator.last_name,
                    role_id: collaborator.role.id,
                    company_ids: collaborator.companies.map(c => c.id),
                    delivery_point_ids: collaborator.companies.flatMap(c =>
                        c.puntos_de_entrega?.map(dp => dp.id) || []
                    ),
                }}
                // 3️⃣ Al guardar con éxito: salimos del modo edición y recargamos
                onSuccess={() => {
                    setIsEditing(false)
                    load()
                }}
                // 4️⃣ Al cancelar: sólo salimos del modo edición
                onCancel={() => {
                    setIsEditing(false)
                }}
            />
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card className="shadow-lg border-0 rounded-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-blue-50 via-slate-50 to-white p-6 border-b">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center space-x-4">
                            <Link href="/collaborators">
                                <Button variant="outline" size="icon" className="border-gray-300">
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </Link>
                            <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
                                <AvatarImage
                                    src={
                                        collaborator.avatar_url ||
                                        `/placeholder.svg?height=64&width=64&query=${collaborator.first_name || "/placeholder.svg"}+${collaborator.last_name}`
                                    }
                                    alt={`${collaborator.first_name} ${collaborator.last_name}`}
                                />
                                <AvatarFallback className="text-lg bg-blue-100 text-blue-700">
                                    {collaborator.first_name[0]}
                                    {collaborator.last_name[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <CardTitle className="text-2xl font-bold text-gray-800">
                                        {collaborator.first_name} {collaborator.last_name}
                                    </CardTitle>
                                    {collaborator.verified && (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                                </TooltipTrigger>
                                                <TooltipContent>Usuario verificado</TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <Badge variant="outline" className={getRoleColor(collaborator.role.name)}>
                                        <Shield className="h-3 w-3 mr-1" />
                                        {collaborator.role.name}
                                    </Badge>
                                    <Badge variant="outline" className={statusConfig.color}>
                                        <StatusIcon className="h-3 w-3 mr-1" />
                                        {statusConfig.label}
                                    </Badge>
                                    {isPdeRole && totalDeliveryPoints > 0 && (
                                        <Badge variant="outline" className="bg-teal-100 text-teal-700 border-teal-300">
                                            <MapPin className="h-3 w-3 mr-1" />
                                            {totalDeliveryPoints} PdE
                                        </Badge>
                                    )}
                                    <span className="text-sm text-gray-600">@{collaborator.username}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 bg-white">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" size="icon">
                                            <History className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Ver historial</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 bg-white">
                                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Editar información
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleResendInvitation}>
                                        <Send className="h-4 w-4 mr-2" />
                                        Reenviar invitación
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    {collaborator.active === true ? (
                                        <DropdownMenuItem className="text-red-600" onClick={handleActiveToggle}>
                                            <UserX className="h-4 w-4 mr-2" />
                                            Desactivar usuario
                                        </DropdownMenuItem>
                                    ) : (
                                        <DropdownMenuItem className="text-green-600" onClick={handleActiveToggle}>
                                            <UserCheck className="h-4 w-4 mr-2" />
                                            Activar usuario
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600">
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Eliminar colaborador
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Contenido principal con tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
                <Card className="shadow-md border border-gray-200 rounded-xl">
                    <div className="px-6 pt-4 pb-2">
                        <TabsList className="bg-gray-100">
                            <TabsTrigger value="overview" className="flex items-center gap-2">
                                <Eye className="h-4 w-4" />
                                Información General
                            </TabsTrigger>
                            <TabsTrigger value="companies" className="flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                Empresas ({collaborator.companies.length})
                            </TabsTrigger>
                            {isPdeRole && totalDeliveryPoints > 0 && (
                                <TabsTrigger value="delivery-points" className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    Puntos de Entrega ({totalDeliveryPoints})
                                </TabsTrigger>
                            )}
                            <TabsTrigger value="activity" className="flex items-center gap-2">
                                <History className="h-4 w-4" />
                                Actividad
                            </TabsTrigger>
                            <TabsTrigger value="settings" className="flex items-center gap-2">
                                <Settings className="h-4 w-4" />
                                Configuración
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="overview" className="p-6 pt-4">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Información de contacto */}
                            <div className="lg:col-span-2 space-y-6">
                                <Card className="shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Mail className="h-5 w-5 text-blue-600" />
                                            Información de Contacto
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium text-gray-600">Email</label>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Mail className="h-4 w-4 text-gray-400" />
                                                    <a href={`mailto:${collaborator.email}`} className="text-blue-600 hover:underline">
                                                        {collaborator.email}
                                                    </a>
                                                </div>
                                            </div>
                                            {collaborator.phone && (
                                                <div>
                                                    <label className="text-sm font-medium text-gray-600">Teléfono</label>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Phone className="h-4 w-4 text-gray-400" />
                                                        <a href={`tel:${collaborator.phone}`} className="text-blue-600 hover:underline">
                                                            {collaborator.phone}
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Usuario</label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-gray-800">@{collaborator.username}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Estado y verificación */}
                                <Card className="shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Shield className="h-5 w-5 text-blue-600" />
                                            Estado de la Cuenta
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <StatusIcon className="h-5 w-5 text-gray-600" />
                                                <div>
                                                    <div className="font-medium text-gray-800">{statusConfig.label}</div>
                                                    <div className="text-sm text-gray-600">{statusConfig.description}</div>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className={statusConfig.color}>
                                                {statusConfig.label}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                {collaborator.active ? (
                                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                                ) : (
                                                    <XCircle className="h-5 w-5 text-red-600" />
                                                )}
                                                <div>
                                                    <div className="font-medium text-gray-800">
                                                        {collaborator.active ? "Usuario Activo" : "Usuario Inactivo"}
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        {collaborator.active
                                                            ? "El usuario puede acceder al sistema"
                                                            : "El usuario no puede acceder al sistema"}
                                                    </div>
                                                </div>
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className={
                                                    collaborator.active
                                                        ? "bg-green-100 text-green-700 border-green-300"
                                                        : "bg-red-100 text-red-700 border-red-300"
                                                }
                                            >
                                                {collaborator.active ? "Activo" : "Inactivo"}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                {collaborator.verified ? (
                                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                                ) : (
                                                    <XCircle className="h-5 w-5 text-red-600" />
                                                )}
                                                <div>
                                                    <div className="font-medium text-gray-800">
                                                        {collaborator.verified ? "Usuario Verificado" : "Usuario No Verificado"}
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        {collaborator.verified
                                                            ? "El usuario ha verificado su identidad"
                                                            : "El usuario aún no ha completado la verificación"}
                                                    </div>
                                                </div>
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className={
                                                    collaborator.verified
                                                        ? "bg-green-100 text-green-700 border-green-300"
                                                        : "bg-red-100 text-red-700 border-red-300"
                                                }
                                            >
                                                {collaborator.verified ? "Verificado" : "Sin verificar"}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Información adicional */}
                            <div className="space-y-6">
                                <Card className="shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Calendar className="h-5 w-5 text-blue-600" />
                                            Fechas Importantes
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Fecha de registro</label>
                                            <div className="text-gray-800 mt-1">{formatDate(collaborator.created_at)}</div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Shield className="h-5 w-5 text-blue-600" />
                                            Rol Principal
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Shield className="h-5 w-5 text-blue-600" />
                                                <span className="font-medium text-gray-800">{collaborator.role.name}</span>
                                            </div>
                                            <div className="text-sm text-gray-600 mb-3">
                                                {collaborator.role.description || `Rol de nivel ${collaborator.role.level}`}
                                            </div>
                                            <Badge variant="outline" className={getRoleColor(collaborator.role.name)}>
                                                Nivel {collaborator.role.level}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Resumen de puntos de entrega para roles PdE */}
                                {isPdeRole && totalDeliveryPoints > 0 && (
                                    <Card className="shadow-sm">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <MapPin className="h-5 w-5 text-blue-600" />
                                                Resumen PdE
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4 text-blue-600" />
                                                        <span className="text-sm font-medium text-gray-700">Total PdE</span>
                                                    </div>
                                                    <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                                                        {totalDeliveryPoints}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                                        <span className="text-sm font-medium text-gray-700">PdE Activos</span>
                                                    </div>
                                                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                                                        {activeDeliveryPoints}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="companies" className="p-6 pt-4">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Empresas Asociadas ({collaborator.companies.length})
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {collaborator.companies.map((company, index) => (
                                    <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
                                        <CardContent className="p-6">
                                            <div className="flex items-start gap-4">
                                                <div className="p-3 bg-blue-100 rounded-lg">
                                                    <Building2 className="h-6 w-6 text-blue-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h4 className="text-lg font-semibold text-gray-800">{company.name}</h4>
                                                        <Badge variant="outline" className={getRoleColor(company.role_in_company.name)}>
                                                            {company.role_in_company.name}
                                                        </Badge>
                                                    </div>

                                                    <div className="text-sm text-gray-600 mb-4">
                                                        Nivel de acceso: {company.role_in_company.level}
                                                    </div>

                                                    {/* Mostrar puntos de entrega si existen */}
                                                    {company.puntos_de_entrega && company.puntos_de_entrega.length > 0 && (
                                                        <div className="mt-4">
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <MapPin className="h-4 w-4 text-teal-600" />
                                                                <span className="text-sm font-medium text-gray-700">
                                                                    Puntos de Entrega ({company.puntos_de_entrega.length})
                                                                </span>
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                {company.puntos_de_entrega.map((dp) => {
                                                                    const dpStatusConfig = getDeliveryPointStatusConfig(dp.status)
                                                                    const DpStatusIcon = dpStatusConfig.icon

                                                                    return (
                                                                        <div key={dp.id} className="p-3 bg-gray-50 rounded-lg border">
                                                                            <div className="flex items-start justify-between mb-2">
                                                                                <div className="flex items-center gap-2">
                                                                                    <Navigation className="h-4 w-4 text-teal-600" />
                                                                                    <span className="font-medium text-gray-800 text-sm">{dp.name}</span>
                                                                                </div>
                                                                                <div className="flex gap-1">
                                                                                    <Badge variant="outline" className={`text-xs ${dpStatusConfig.color}`}>
                                                                                        <DpStatusIcon className="h-3 w-3 mr-1" />
                                                                                        {dpStatusConfig.label}
                                                                                    </Badge>
                                                                                    {dp.active && (
                                                                                        <Badge
                                                                                            variant="outline"
                                                                                            className="text-xs bg-green-100 text-green-700 border-green-300"
                                                                                        >
                                                                                            Activo
                                                                                        </Badge>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                            <div className="text-xs text-gray-600">📍 {formatLocation(dp.location)}</div>
                                                                        </div>
                                                                    )
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Mensaje cuando no hay puntos de entrega para roles PdE */}
                                                    {isPdeRole && (!company.puntos_de_entrega || company.puntos_de_entrega.length === 0) && (
                                                        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                                            <div className="flex items-center gap-2">
                                                                <AlertTriangle className="h-4 w-4 text-amber-600" />
                                                                <span className="text-sm text-amber-700">
                                                                    No hay puntos de entrega asignados en esta empresa
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {collaborator.companies.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <Building2 className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                                    <p>Este colaborador no está asociado a ninguna empresa.</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* Nueva pestaña específica para puntos de entrega */}
                    {isPdeRole && totalDeliveryPoints > 0 && (
                        <TabsContent value="delivery-points" className="p-6 pt-4">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        Puntos de Entrega Asignados ({totalDeliveryPoints})
                                    </h3>
                                    <div className="flex gap-2">
                                        <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                                            Total: {totalDeliveryPoints}
                                        </Badge>
                                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                                            Activos: {activeDeliveryPoints}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {collaborator.companies.map((company) => {
                                        if (!company.puntos_de_entrega || company.puntos_de_entrega.length === 0) return null

                                        return (
                                            <Card key={company.id} className="shadow-sm">
                                                <CardHeader className="pb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-blue-100 rounded-lg">
                                                            <Building2 className="h-5 w-5 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <CardTitle className="text-lg">{company.name}</CardTitle>
                                                            <p className="text-sm text-gray-600">
                                                                {company.puntos_de_entrega.length} punto
                                                                {company.puntos_de_entrega.length !== 1 ? "s" : ""} de entrega
                                                            </p>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                        {company.puntos_de_entrega.map((dp) => {
                                                            const dpStatusConfig = getDeliveryPointStatusConfig(dp.status)
                                                            const DpStatusIcon = dpStatusConfig.icon

                                                            return (
                                                                <Card key={dp.id} className="shadow-sm border-l-4 border-l-teal-500">
                                                                    <CardContent className="p-4">
                                                                        <div className="space-y-3">
                                                                            <div className="flex items-start justify-between">
                                                                                <div className="flex items-center gap-2">
                                                                                    <MapPin className="h-4 w-4 text-teal-600" />
                                                                                    <h4 className="font-semibold text-gray-800">{dp.name}</h4>
                                                                                </div>
                                                                            </div>

                                                                            <div className="space-y-2">
                                                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                                    <Navigation className="h-3 w-3" />
                                                                                    {formatLocation(dp.location)}
                                                                                </div>
                                                                            </div>

                                                                            <div className="flex gap-2 flex-wrap">
                                                                                <Badge variant="outline" className={`text-xs ${dpStatusConfig.color}`}>
                                                                                    <DpStatusIcon className="h-3 w-3 mr-1" />
                                                                                    {dpStatusConfig.label}
                                                                                </Badge>
                                                                                <Badge
                                                                                    variant="outline"
                                                                                    className={`text-xs ${dp.active
                                                                                        ? "bg-green-100 text-green-700 border-green-300"
                                                                                        : "bg-red-100 text-red-700 border-red-300"
                                                                                        }`}
                                                                                >
                                                                                    {dp.active ? "Activo" : "Inactivo"}
                                                                                </Badge>
                                                                            </div>
                                                                        </div>
                                                                    </CardContent>
                                                                </Card>
                                                            )
                                                        })}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )
                                    })}
                                </div>
                            </div>
                        </TabsContent>
                    )}

                    <TabsContent value="activity" className="p-6 pt-4">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800">Actividad Reciente</h3>

                            <div className="space-y-3">
                                {/* Simulación de actividad */}
                                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                    <div className="p-2 bg-green-100 rounded-full">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-800">Usuario verificado</div>
                                        <div className="text-sm text-gray-600">Completó el proceso de verificación</div>
                                        <div className="text-xs text-gray-500 mt-1">Hace 2 días</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                    <div className="p-2 bg-blue-100 rounded-full">
                                        <Mail className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-800">Invitación aceptada</div>
                                        <div className="text-sm text-gray-600">Se unió a la plataforma</div>
                                        <div className="text-xs text-gray-500 mt-1">Hace 1 semana</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                    <div className="p-2 bg-yellow-100 rounded-full">
                                        <Send className="h-4 w-4 text-yellow-600" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-800">Invitación enviada</div>
                                        <div className="text-sm text-gray-600">Se envió la invitación por email</div>
                                        <div className="text-xs text-gray-500 mt-1">{formatDate(collaborator.created_at)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="settings" className="p-6 pt-4">
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-800">Configuración de la Cuenta</h3>

                            <Card className="shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-base">Acciones de Cuenta</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <div className="font-medium text-gray-800">Reenviar invitación</div>
                                            <div className="text-sm text-gray-600">Enviar nuevamente el email de invitación</div>
                                        </div>
                                        <Button variant="outline" onClick={handleResendInvitation}>
                                            <Send className="h-4 w-4 mr-2" />
                                            Reenviar
                                        </Button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <div className="font-medium text-gray-800">
                                                {collaborator.active === true ? "Desactivar cuenta" : "Activar cuenta"}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {collaborator.active === true
                                                    ? "El usuario no podrá acceder al sistema"
                                                    : "Permitir al usuario acceder al sistema"}
                                            </div>
                                        </div>
                                        <Button
                                            className="bg-black text-white min-w-max"
                                            variant={collaborator.active === true ? "destructive" : "default"}
                                            disabled={isDeactivating || isActivating}
                                            onClick={handleActiveToggle}
                                        >
                                            {collaborator.active === true ? (
                                                <>
                                                    <UserX className="h-4 w-4 mr-2" />
                                                    {isDeactivating ? "Desactivando..." : "Desactivar"}
                                                </>
                                            ) : (
                                                <>
                                                    <UserCheck className="h-4 w-4 mr-2" />
                                                    {isActivating ? "Activando..." : "Activar"}
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                    <Separator />

                                    <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                                        <div>
                                            <div className="font-medium text-red-800">Suspender colaborador</div>
                                            <div className="text-sm text-red-600">Esta acción no se puede deshacer</div>
                                        </div>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="destructive" className="bg-red-500 text-white">
                                                    <Trash2 className="h-4 w-4 mr-2 text-white" />
                                                    Suspender
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="bg-white">
                                                <DialogHeader>
                                                    <DialogTitle>¿Suspender colaborador?</DialogTitle>
                                                    <DialogDescription>
                                                        Esta acción eliminará permanentemente a {collaborator.first_name} {collaborator.last_name}
                                                        de todas las empresas asociadas. Esta acción no se puede deshacer.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <DialogFooter>
                                                    <Button variant="outline">Cancelar</Button>
                                                    <Button variant="destructive" className="bg-red-500 text-white" onClick={handleStatusToggle}>
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Eliminar definitivamente
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Card>
            </Tabs>
        </div>
    )
}
