// src/app/Components/Companies/company-card.tsx

import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/Components/ui/card"
import { Badge } from "@/Components/ui/badge"
import { Button } from "@/Components/ui/button"
import { Building2, Mail, Phone, Pencil, Eye, CheckCircle, XCircle, Briefcase, ExternalLink, Star } from "lucide-react"
import type { FullCompanyFormData } from "@/lib/schemas/company-schema"
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/Components/ui/tooltip"

type CompanyData = FullCompanyFormData & {
    id: string
    active: boolean
    logo_url?: string
}

interface CompanyCardProps {
    company: CompanyData
}

export function CompanyCard({ company }: CompanyCardProps) {
    // Función para truncar texto largo
    const truncate = (text: string, length: number) => {
        if (!text) return ""
        return text.length > length ? `${text.substring(0, length)}...` : text
    }

    return (
        <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden border border-gray-200 group">
            <CardHeader className="bg-gradient-to-br from-blue-50 via-slate-50 to-white p-5 border-b relative">
                <div className="flex items-start gap-5">
                    <div className="relative">
                        <Avatar className="h-16 w-16 rounded-lg border-2 border-white shadow-md bg-white">
                            <AvatarImage
                                src={company.logo_url || "/placeholder.svg?height=64&width=64&query=company+logo"}
                                alt={`Logo de ${company.legal_name}`}
                                className="object-contain p-1"
                            />
                            <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 rounded-lg">
                                {company.legal_name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()
                                    .slice(0, 2)}
                            </AvatarFallback>
                        </Avatar>

                        <Badge
                            variant={company.active ? "default" : "destructive"}
                            className={`absolute -bottom-2 -right-2 px-2 py-0.5 text-xs ${company.active
                                    ? "bg-green-100 text-green-700 border border-green-300"
                                    : "bg-red-100 text-red-700 border border-red-300"
                                }`}
                        >
                            {company.active ? <CheckCircle className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
                            {company.active ? "Activa" : "Inactiva"}
                        </Badge>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <Badge
                                variant="secondary"
                                className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 border border-blue-300"
                            >
                                <Briefcase className="mr-1 h-3 w-3" />
                                {company.company_type}
                            </Badge>
                        </div>

                        <CardTitle
                            className="text-lg font-bold text-gray-800 truncate group-hover:text-blue-700 transition-colors"
                            title={company.legal_name}
                        >
                            {truncate(company.legal_name, 40)}
                        </CardTitle>

                        {company.trade_name && (
                            <CardDescription className="text-sm text-gray-600 truncate" title={company.trade_name}>
                                {truncate(company.trade_name, 50)}
                            </CardDescription>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-grow p-5 space-y-4 text-sm bg-white">
                <div className="flex items-center text-gray-700">
                    <div className="p-1.5 bg-blue-50 rounded-md mr-2.5 shadow-sm">
                        <Building2 className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                    <span className="font-medium">C.J. {company.legal_id}</span>
                </div>

                <div className="flex items-center text-gray-700">
                    <div className="p-1.5 bg-blue-50 rounded-md mr-2.5 shadow-sm">
                        <Mail className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                    <a
                        href={`mailto:${company.contact_email}`}
                        className="truncate hover:underline hover:text-blue-600 transition-colors group-hover:text-blue-600 flex items-center"
                        title={company.contact_email}
                    >
                        {truncate(company.contact_email || "", 30)}
                        <ExternalLink className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                </div>

                {company.contact_phone && (
                    <div className="flex items-center text-gray-700">
                        <div className="p-1.5 bg-blue-50 rounded-md mr-2.5 shadow-sm">
                            <Phone className="h-3.5 w-3.5 text-blue-600" />
                        </div>
                        <a href={`tel:${company.contact_phone}`} className="hover:underline hover:text-blue-600 transition-colors">
                            {company.contact_phone}
                        </a>
                    </div>
                )}
            </CardContent>

            <CardFooter className="p-5 border-t bg-gray-50 flex justify-between items-center">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600 p-2 h-auto">
                                <Star className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Marcar como favorita</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <div className="flex space-x-2">

                    <Link href={`/companies/${company.id}`} passHref>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white transition-colors">
                                        <Eye className="h-4 w-4 mr-1.5" /> Ver Detalles
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Ver detalles completos</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </Link>
                </div>
            </CardFooter>
        </Card>
    )
}












































