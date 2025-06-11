"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/Components/ui/use-toast"
import { CreateCompanyForm } from "./create-company-form"
import {
    Building2,
    Mail,
    Phone,
    MapPin,
    UserSquare,
    FileText,
    Briefcase,
    ShieldCheck,
    ArrowLeft,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    Loader2,
    Info,
    FileSignature,
    CalendarDays,
    Clock,
    ExternalLink,
    Share2,
    Download,
} from "lucide-react"
import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Badge } from "@/Components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar"
import { Separator } from "@/Components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/Components/ui/tooltip"
import { Sidebar } from "../Sidebar/Sidebar"
import Link from "next/link"

type CompanyDetailsData = {
    id: string
    legal_name: string
    trade_name?: string
    legal_id: string
    company_type: string
    fiscal_address?: string
    contact_email?: string
    contact_phone?: string
    logo_url?: string
    active: boolean
    created_at: string
    updated_at: string
    parent_company_name?: string
    parent_company_id?: string
    legal_representative: {
        full_name: string
        identification_number: string
        document_type_id: string
        document_type_name: string
        email: string
        primary_phone: string
        secondary_phone?: string
    }
}

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

interface CompanyDetailsProps {
    companyId: string
}

export function CompanyDetails({ companyId }: CompanyDetailsProps) {
    const router = useRouter()
    const [company, setCompany] = useState<CompanyDetailsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const { toast } = useToast()




    useEffect(() => {
        async function load() {
            setLoading(true)
            try {
                const res = await fetch(`/api/companies/${companyId}/full-detail`)
                if (res.status === 404) {
                    setCompany(null)
                    return
                }
                if (!res.ok) throw new Error("Error en la API")

                const { company: c, legalRep } = await res.json()

                // Mapea parent_company_name desde c.Companies.legal_name
                const parentName = c.Companies?.legal_name?.trim() || undefined

                // Construye el objeto final
                const merged: CompanyDetailsData = {
                    id: c.id,
                    legal_name: c.legal_name.trim(),
                    trade_name: c.trade_name || undefined,
                    legal_id: c.legal_id,
                    company_type: c.company_type,
                    fiscal_address: c.fiscal_address || undefined,
                    contact_email: c.contact_email || undefined,
                    contact_phone: c.contact_phone || undefined,
                    logo_url: c.logo_url || undefined,
                    active: c.active ?? true,
                    created_at: c.created_at,
                    updated_at: c.updated_at,
                    parent_company_id: c.parent_company_id || "",
                    parent_company_name: parentName,
                    legal_representative: {
                        full_name: legalRep.full_name,
                        identification_number: legalRep.identification_number,
                        // Toma el nombre del tipo de documento
                        document_type_id: legalRep.document_type_id,
                        document_type_name: legalRep.DocumentTypes?.name || "N/A",
                        email: legalRep.email,
                        primary_phone: legalRep.primary_phone,
                        secondary_phone: legalRep.secondary_phone || undefined,
                    },
                }

                setCompany(merged)
            } catch (e) {
                console.error(e)
                setCompany(null)
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [companyId])


    const [isToggling, setIsToggling] = useState(false);

    async function toggleActive() {
        if (!company) return;
        setIsToggling(true);
        try {
            const res = await fetch(`/api/companies/${company.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ active: !company.active }),
            });
            if (!res.ok) throw new Error("Error al cambiar estado");
            setCompany((prev) => prev && { ...prev, active: !prev.active });
            // Opcional: toast de éxito
        } catch (e) {
            console.error(e);
            // toast de error
        } finally {
            setIsToggling(false);
        }
    }


    if (loading) {
        return (
            <Sidebar>
                <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
                    <div className="text-center">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                        <p className="text-gray-600 font-medium">Cargando información de la empresa...</p>
                    </div>
                </div>
            </Sidebar>
        )
    }


    if (isEditing && company) {
        const initialData = {
            id: company.id,
            legal_name: company.legal_name,
            trade_name: company.trade_name || "",
            legal_id: company.legal_id,
            company_type: company.company_type,
            parent_company_id: company.parent_company_id || "",
            contact_email: company.contact_email || "",
            contact_phone: company.contact_phone || "",
            fiscal_address: company.fiscal_address || "",
            logo_url: company.logo_url || "",
            legal_representative: {
                document_type_id: company.legal_representative.document_type_id,
                full_name: company.legal_representative.full_name,
                identification_number: company.legal_representative.identification_number,
                email: company.legal_representative.email,
                primary_phone: company.legal_representative.primary_phone,
                secondary_phone: company.legal_representative.secondary_phone || "",
            },
        }

        return (
            <CreateCompanyForm
                initialData={initialData}
                onCancel={() => setIsEditing(false)
                }
            />
        )
    }

    if (!company) {
        return (
            <Sidebar>
                <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] text-center p-4">
                    <div className="bg-red-50 p-6 rounded-full mb-4">
                        <XCircle className="h-16 w-16 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2 text-gray-800">Empresa no encontrada</h1>
                    <p className="text-gray-600 mb-8 max-w-md">
                        No pudimos encontrar los detalles de esta empresa. Es posible que haya sido eliminada o que no tengas
                        permisos para verla.
                    </p>
                    <Button onClick={() => router.push("/companies")} className="bg-blue-600 hover:bg-blue-700 text-white">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Volver a la Lista de Empresas
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
                                        src={company.logo_url || "/placeholder.svg?height=128&width=128&query=company+logo"}
                                        alt={`Logo de ${company.legal_name}`}
                                        className="object-contain p-1"
                                    />
                                    <AvatarFallback className="text-4xl font-semibold bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 rounded-lg">
                                        {company.legal_name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")
                                            .toUpperCase()
                                            .slice(0, 2)}
                                    </AvatarFallback>
                                </Avatar>
                                <Badge
                                    variant={company.active ? "Componentsult" : "destructive"}
                                    className={`absolute -bottom-2 right-0 px-3 py-1 text-xs font-semibold ${company.active
                                        ? "bg-green-100 text-green-700 border border-green-300"
                                        : "bg-red-100 text-red-700 border border-red-300"
                                        }`}
                                >
                                    {company.active ? (
                                        <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                                    ) : (
                                        <XCircle className="mr-1.5 h-3.5 w-3.5" />
                                    )}
                                    {company.active ? "Activa" : "Inactiva"}
                                </Badge>
                            </div>

                            <div className="flex-1 mt-2 sm:mt-0">
                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                    <Badge
                                        variant="secondary"
                                        className="px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-300"
                                    >
                                        <Briefcase className="mr-1.5 h-3.5 w-3.5" />
                                        {company.company_type}
                                    </Badge>

                                    {company.parent_company_name && (
                                        <Badge variant="outline" className="px-3 py-1 text-xs font-semibold border-gray-300 text-gray-700">
                                            <Building2 className="mr-1.5 h-3.5 w-3.5" />
                                            {company.parent_company_name}
                                        </Badge>
                                    )}
                                </div>

                                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                                    {company.legal_name}
                                </h1>

                                {company.trade_name && <p className="text-lg text-gray-600 mt-1 font-medium">{company.trade_name}</p>}

                                <div className="mt-4 flex flex-wrap items-center gap-4">
                                    {company.contact_email && (
                                        <a
                                            href={`mailto:${company.contact_email}`}
                                            className="flex items-center text-sm text-blue-600 hover:text-blue-700 hover:underline"
                                        >
                                            <Mail className="h-4 w-4 mr-1.5" />
                                            {company.contact_email}
                                        </a>
                                    )}

                                    {company.contact_phone && (
                                        <a
                                            href={`tel:${company.contact_phone}`}
                                            className="flex items-center text-sm text-blue-600 hover:text-blue-700 hover:underline"
                                        >
                                            <Phone className="h-4 w-4 mr-1.5" />
                                            {company.contact_phone}
                                        </a>
                                    )}
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
                                    className={`w-full justify-start ${company.active
                                        ? "text-red-600 border-red-200 hover:bg-red-50"
                                        : "text-green-600 border-green-200 hover:bg-green-50"
                                        }`}
                                    onClick={toggleActive}
                                >
                                    {company.active ? (
                                        <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                    ) : (
                                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                    )}
                                    {company.active ? "Inactivar" : "Activar"}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 px-8 py-4 border-t border-b">
                        <div className="flex flex-wrap gap-6">
                            <div className="flex items-center">
                                <FileText className="h-5 w-5 text-gray-500 mr-2" />
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Cédula Jurídica</p>
                                    <p className="text-sm font-semibold text-gray-800">{company.legal_id}</p>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <CalendarDays className="h-5 w-5 text-gray-500 mr-2" />
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Registrada el</p>
                                    <p className="text-sm font-semibold text-gray-800">{formatDate(company.created_at)}</p>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <Clock className="h-5 w-5 text-gray-500 mr-2" />
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Última actualización</p>
                                    <p className="text-sm font-semibold text-gray-800">{formatDate(company.updated_at)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <StyledCard
                            icon={Info}
                            title="Información General"
                        >
                            <InfoRow icon={FileText} label="Cédula Jurídica / ID Fiscal" value={company.legal_id} />

                            {company.fiscal_address && (
                                <InfoRow icon={MapPin} label="Dirección Fiscal" value={company.fiscal_address} />
                            )}

                            {company.contact_email && (
                                <InfoRow
                                    icon={Mail}
                                    label="Email de Contacto"
                                    value={company.contact_email}
                                    isLink
                                    href={`mailto:${company.contact_email}`}
                                />
                            )}

                            {company.contact_phone && (
                                <InfoRow
                                    icon={Phone}
                                    label="Teléfono de Contacto"
                                    value={company.contact_phone}
                                    isLink
                                    href={`tel:${company.contact_phone}`}
                                />
                            )}

                            {company.parent_company_name && (
                                <InfoRow icon={Building2} label="Empresa Matriz" value={company.parent_company_name} />
                            )}
                        </StyledCard>

                        <StyledCard
                            icon={FileSignature}
                            title="Representante Legal"
                        >
                            <InfoRow icon={UserSquare} label="Nombre Completo" value={company.legal_representative.full_name} />

                            <InfoRow
                                icon={FileText}
                                label="Identificación"
                                value={`${company.legal_representative.document_type_name || "N/A"}: ${company.legal_representative.identification_number}`}
                            />

                            <InfoRow
                                icon={Mail}
                                label="Email del Representante"
                                value={company.legal_representative.email}
                                isLink
                                href={`mailto:${company.legal_representative.email}`}
                            />

                            <InfoRow
                                icon={Phone}
                                label="Teléfono Principal"
                                value={company.legal_representative.primary_phone}
                                isLink
                                href={`tel:${company.legal_representative.primary_phone}`}
                            />

                            {company.legal_representative.secondary_phone && (
                                <InfoRow
                                    icon={Phone}
                                    label="Teléfono Secundario"
                                    value={company.legal_representative.secondary_phone}
                                    isLink
                                    href={`tel:${company.legal_representative.secondary_phone}`}
                                />
                            )}
                        </StyledCard>
                    </div>

                    <div className="space-y-6">
                        <StyledCard icon={ShieldCheck} title="Estado y Auditoría">
                            <InfoRow
                                icon={company.active ? CheckCircle : XCircle}
                                label="Estado Actual"
                                value={
                                    <Badge
                                        variant={company.active ? "Componentsult" : "destructive"}
                                        className={`${company.active
                                            ? "bg-green-100 text-green-700 border border-green-300"
                                            : "bg-red-100 text-red-700 border border-red-300"
                                            }`}
                                    >
                                        {company.active ? "Activa" : "Inactiva"}
                                    </Badge>
                                }
                            />

                            <InfoRow
                                icon={CalendarDays}
                                label="Fecha de Creación"
                                value={
                                    <div className="flex flex-col">
                                        <span>{formatDate(company.created_at)}</span>
                                        <span className="text-xs text-gray-500 mt-0.5">{formatTime(company.created_at)}</span>
                                    </div>
                                }
                            />

                            <InfoRow
                                icon={CalendarDays}
                                label="Última Actualización"
                                value={
                                    <div className="flex flex-col">
                                        <span>{formatDate(company.updated_at)}</span>
                                        <span className="text-xs text-gray-500 mt-0.5">{formatTime(company.updated_at)}</span>
                                    </div>
                                }
                            />

                            <InfoRow
                                icon={FileText}
                                label="ID de la Empresa"
                                value={<code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono break-all">{company.id}</code>}
                            />
                        </StyledCard>

                        <Card className="shadow-lg border border-gray-200 rounded-xl overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 p-5 border-b">
                                <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
                                    <Building2 className="h-5 w-5 text-blue-600 mr-2" />
                                    Acciones Rápidas
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 space-y-3">
                                <Button onClick={() => setIsEditing(true)} variant="outline" className="w-full justify-start text-gray-700 border-gray-300">
                                    <Edit className="mr-2 h-4 w-4 text-blue-600" />
                                    Editar información
                                </Button>
                                <Button variant="outline" className="w-full justify-start text-gray-700 border-gray-300">
                                    <Download className="mr-2 h-4 w-4 text-blue-600" />
                                    Descargar datos
                                </Button>
                                <Button variant="outline" className="w-full justify-start text-gray-700 border-gray-300">
                                    <Share2 className="mr-2 h-4 w-4 text-blue-600" />
                                    Compartir información
                                </Button>
                                <Separator className="my-2" />
                                <Button
                                    variant="outline"
                                    className={`w-full justify-start ${      company.active
                                        ? "text-red-600 border-red-200 hover:bg-red-50"
                                        : "text-green-600 border-green-200 hover:bg-green-50"
                                        }`}
                                    onClick={toggleActive}
                                >
                                    {company.active ? (
                                        <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                    ) : (
                                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                    )}
                                    {company.active ? "Inactivar empresa" : "Activar empresa"}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </Sidebar >
    )
}
