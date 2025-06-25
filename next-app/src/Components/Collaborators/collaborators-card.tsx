"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar"
import { Badge } from "@/Components/ui/badge"
import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardHeader } from "@/Components/ui/card"
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
} from "lucide-react"
import Link from "next/link"

interface CollaboratorCardProps {
    collaborator: CollaboratorSummary
}

export function CollaboratorCard({ collaborator }: CollaboratorCardProps) {
    const getStatusBadge = (status: CollaboratorSummary["status"]) => {
        switch (status) {
            case "active":
                return (
                    <Badge className="bg-green-100 text-green-700 border-green-300 hover:bg-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Activo
                    </Badge>
                )
            case "inactive":
                return (
                    <Badge className="bg-red-100 text-red-700 border-red-300 hover:bg-red-200">
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactivo
                    </Badge>
                )
            case "under_review":
                return (
                    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200">
                        <Clock className="h-3 w-3 mr-1" />
                        En Revisión
                    </Badge>
                )
            case "draft":
                return (
                    <Badge className="bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Borrador
                    </Badge>
                )
            case "rejected":
                return (
                    <Badge className="bg-red-100 text-red-700 border-red-300 hover:bg-red-200">
                        <XCircle className="h-3 w-3 mr-1" />
                        Rechazado
                    </Badge>
                )
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const getRoleBadge = (roleKey: string) => {
        const roleColors = {
            SuperAdminEmpresa: "bg-blue-100 text-blue-700 border-blue-300",
            AdministradorEmpresa: "bg-indigo-100 text-indigo-700 border-indigo-300",
            AdminPdE: "bg-cyan-100 text-cyan-700 border-cyan-300",
            OperadorPdE: "bg-green-100 text-green-700 border-green-300",
        }

        return (
            <Badge className={roleColors[roleKey as keyof typeof roleColors] || "bg-gray-100 text-gray-700 border-gray-300"}>
                <Shield className="h-3 w-3 mr-1" />
                {collaborator.role.name}
            </Badge>
        )
    }

    return (
        <Card className="group hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-blue-300 bg-white">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-gray-200">
                            <AvatarImage
                                src={collaborator.avatar_url || "/placeholder.svg"}
                                alt={`${collaborator.first_name} ${collaborator.last_name}`}
                            />
                            <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                                {collaborator.first_name[0]}
                                {collaborator.last_name[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">
                                {collaborator.first_name} {collaborator.last_name}
                            </h3>
                            <p className="text-sm text-gray-600 truncate">@{collaborator.username}</p>
                            <p className="text-xs text-gray-500 truncate">{collaborator.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        {collaborator.verified && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Usuario verificado</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    {getRoleBadge(collaborator.role.name)}
                    {getStatusBadge(collaborator.status)}
                </div>

                <div className="space-y-2">
                    {collaborator.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="truncate">{collaborator.phone}</span>
                        </div>
                    )}

                    {collaborator.primary_company_name && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Building2 className="h-4 w-4 text-gray-400" />
                            <span className="truncate">{collaborator.primary_company_name}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                        Creado: {new Date(collaborator.created_at).toLocaleDateString("es-ES")}
                    </div>

                    <div className="flex items-center gap-1">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Link href={`/collaborators/${collaborator.id}`}>
                                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white transition-colors">
                                            <Eye className="h-4 w-4 mr-1.5" /> Ver Perfil
                                        </Button>
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Ver detalles</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                    </div>
                </div>
            </CardContent>
        </Card >
    )
}
