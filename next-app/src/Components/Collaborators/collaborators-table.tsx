"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar"
import Link from "next/link"
import { Badge } from "@/Components/ui/badge"
import { Button } from "@/Components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/Components/ui/tooltip"
import type { CollaboratorSummary } from "@/lib/types/collaborator"
import {
    Phone,
    Building2,
    Shield,
    CheckCircle,
    Clock,
    XCircle,
    AlertTriangle,
    MoreHorizontal,
    Edit,
    Eye,
    Calendar,
} from "lucide-react"

interface CollaboratorsTableProps {
    collaborators: CollaboratorSummary[]
}

export function CollaboratorsTable({ collaborators }: CollaboratorsTableProps) {
    const getStatusBadge = (status: CollaboratorSummary["status"]) => {
        switch (status) {
            case "active":
                return (
                    <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Activo
                    </Badge>
                )
            case "inactive":
                return (
                    <Badge className="bg-red-100 text-red-700 border-red-300 text-xs">
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactivo
                    </Badge>
                )
            case "under_review":
                return (
                    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300 text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        En Revisión
                    </Badge>
                )
            case "draft":
                return (
                    <Badge className="bg-gray-100 text-gray-700 border-gray-300 text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Borrador
                    </Badge>
                )
            case "rejected":
                return (
                    <Badge className="bg-red-100 text-red-700 border-red-300 text-xs">
                        <XCircle className="h-3 w-3 mr-1" />
                        Rechazado
                    </Badge>
                )
            default:
                return (
                    <Badge variant="outline" className="text-xs">
                        {status}
                    </Badge>
                )
        }
    }

    const getRoleBadge = (roleKey: string, roleName: string) => {
        const roleColors = {
            SuperAdminEmpresa: "bg-blue-100 text-blue-700 border-blue-300",
            AdministradorEmpresa: "bg-indigo-100 text-indigo-700 border-indigo-300",
            AdminPdE: "bg-cyan-100 text-cyan-700 border-cyan-300",
            OperadorPdE: "bg-green-100 text-green-700 border-green-300",
        }

        const roleShortNames = {
            moderator: "Mod",
            company_owner: "Owner",
            company_admin: "Admin",
            delivery_point_admin: "Deliv. Admin",
            operator: "Oper",
        }

        return (
            <Badge
                className={`${roleColors[roleKey as keyof typeof roleColors] || "bg-gray-100 text-gray-700 border-gray-300"} text-xs`}
            >
                <Shield className="h-3 w-3 mr-1" />
                {roleShortNames[roleKey as keyof typeof roleShortNames] || roleName}
            </Badge>
        )
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    return (
        <div className="bg-white rounded-lg border-0 overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b font-medium text-gray-600 text-sm">
                <div className="col-span-3">Colaborador</div>
                <div className="col-span-2">Contacto</div>
                <div className="col-span-2">Rol</div>
                <div className="col-span-1">Estado</div>
                <div className="col-span-2">Empresa</div>
                <div className="col-span-1">Fecha</div>
                <div className="col-span-1 text-right">Acciones</div>
            </div>

            <div className="divide-y divide-gray-100">
                {collaborators.map((collaborator) => (
                    <div
                        key={collaborator.id}
                        className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 transition-colors"
                    >
                        <div className="col-span-3 flex items-center gap-3">
                            <Avatar className="h-10 w-10 border border-gray-200">
                                <AvatarImage
                                    src={collaborator.avatar_url || "/placeholder.svg"}
                                    alt={`${collaborator.first_name} ${collaborator.last_name}`}
                                />
                                <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                                    {collaborator.first_name[0]}
                                    {collaborator.last_name[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                                <div className="font-medium text-gray-800 truncate">
                                    {collaborator.first_name} {collaborator.last_name}
                                    {collaborator.verified && <CheckCircle className="inline h-3 w-3 text-green-600 ml-1" />}
                                </div>
                                <div className="text-xs text-gray-400 truncate">{collaborator.email}</div>
                            </div>
                        </div>

                        <div className="col-span-2 text-sm">
                            {collaborator.phone && (
                                <div className="flex items-center gap-1">
                                    <Phone className="h-3 w-3 text-gray-400" />
                                    <span className="text-gray-600 truncate">{collaborator?.phone || "N/A"}</span>
                                </div>
                            )}
                        </div>

                        <div className="col-span-2">{getRoleBadge(collaborator.role.name, collaborator.role.name)}</div>

                        <div className="col-span-1">{getStatusBadge(collaborator.status)}</div>

                        <div className="col-span-2 text-sm">
                            {collaborator.primary_company_name && (
                                <div className="flex items-center gap-1">
                                    <Building2 className="h-3 w-3 text-gray-400" />
                                    <span className="text-gray-700 truncate" title={collaborator.primary_company_name}>
                                        {collaborator.primary_company_name.length > 20
                                            ? `${collaborator.primary_company_name.substring(0, 20)}...`
                                            : collaborator.primary_company_name}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="col-span-1 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-gray-400" />
                                <span>{formatDate(collaborator.created_at)}</span>
                            </div>
                        </div>

                        <div className=" flex justify-end">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Link href={`/collaborators/${collaborator.id}`}>
                                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white transition-colors">
                                                <Eye className="h-4 w-4 mr-0.5" /> Ver
                                            </Button>
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent>Ver detalles</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
