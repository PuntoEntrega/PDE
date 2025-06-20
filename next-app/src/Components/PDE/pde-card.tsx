// v0 was here
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/Components/ui/card"
import { Badge } from "@/Components/ui/badge"
import { Button } from "@/Components/ui/button"
import { Mail, Phone, Eye, CheckCircle, XCircle, MapPin, ExternalLink, Star, Package } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/Components/ui/tooltip"

interface PDEData {
  id: string
  name: string
  business_email: string
  whatsapp_contact: string
  province: string
  canton: string
  district: string
  active: boolean
  status: string
  company: {
    trade_name: string
    logo_url?: string
  }
  accepts_xs: boolean
  accepts_s: boolean
  accepts_m: boolean
  accepts_l: boolean
  accepts_xl: boolean
  accepts_xxl: boolean
  accepts_xxxl: boolean
}

interface PDECardProps {
  pde: PDEData
}

export function PDECard({ pde }: PDECardProps) {
  // Función para truncar texto largo
  const truncate = (text: string, length: number) => {
    if (!text) return ""
    return text.length > length ? `${text.substring(0, length)}...` : text
  }

  // Función para obtener el badge de estado
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "under_review":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300">
            En Revisión
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
            Aprobado
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
            Rechazado
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

  // Función para obtener los tamaños aceptados
  const getAcceptedSizes = () => {
    const sizes = []
    if (pde.accepts_xs) sizes.push("XS")
    if (pde.accepts_s) sizes.push("S")
    if (pde.accepts_m) sizes.push("M")
    if (pde.accepts_l) sizes.push("L")
    if (pde.accepts_xl) sizes.push("XL")
    if (pde.accepts_xxl) sizes.push("XXL")
    if (pde.accepts_xxxl) sizes.push("XXXL")
    return sizes.length > 0 ? sizes.join(", ") : "Ninguno"
  }

  return (
    <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden border border-gray-200 group">
      <CardHeader className="bg-gradient-to-br from-blue-50 via-slate-50 to-white p-5 border-b relative">
        <div className="flex items-start gap-5">
          <div className="relative">
            <Avatar className="h-16 w-16 rounded-lg border-2 border-white shadow-md bg-white">
              <AvatarImage
                src={pde.company?.logo_url || "/placeholder.svg?height=64&width=64&query=store+logo"}
                alt={`Logo de ${pde.name}`}
                className="object-contain p-1"
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 rounded-lg">
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
              className={`absolute -bottom-2 -right-2 px-2 py-0.5 text-xs ${
                pde.active
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : "bg-red-100 text-red-700 border border-red-300"
              }`}
            >
              {pde.active ? <CheckCircle className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
              {pde.active ? "Activo" : "Inactivo"}
            </Badge>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">{getStatusBadge(pde.status)}</div>

            <CardTitle
              className="text-lg font-bold text-gray-800 truncate group-hover:text-blue-700 transition-colors"
              title={pde.name}
            >
              {truncate(pde.name, 40)}
            </CardTitle>

            {pde.company?.trade_name && (
              <CardDescription className="text-sm text-gray-600 truncate" title={pde.company.trade_name}>
                {truncate(pde.company.trade_name, 50)}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-grow p-5 space-y-4 text-sm bg-white">
        <div className="flex items-center text-gray-700">
          <div className="p-1.5 bg-blue-50 rounded-md mr-2.5 shadow-sm">
            <MapPin className="h-3.5 w-3.5 text-blue-600" />
          </div>
          <span className="font-medium truncate" title={`${pde.province}, ${pde.canton}, ${pde.district}`}>
            {`${pde.province}, ${pde.canton}, ${pde.district}`}
          </span>
        </div>

        <div className="flex items-center text-gray-700">
          <div className="p-1.5 bg-blue-50 rounded-md mr-2.5 shadow-sm">
            <Mail className="h-3.5 w-3.5 text-blue-600" />
          </div>
          <a
            href={`mailto:${pde.business_email}`}
            className="truncate hover:underline hover:text-blue-600 transition-colors group-hover:text-blue-600 flex items-center"
            title={pde.business_email}
          >
            {truncate(pde.business_email || "", 30)}
            <ExternalLink className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        </div>

        {pde.whatsapp_contact && (
          <div className="flex items-center text-gray-700">
            <div className="p-1.5 bg-blue-50 rounded-md mr-2.5 shadow-sm">
              <Phone className="h-3.5 w-3.5 text-blue-600" />
            </div>
            <a href={`tel:${pde.whatsapp_contact}`} className="hover:underline hover:text-blue-600 transition-colors">
              {pde.whatsapp_contact}
            </a>
          </div>
        )}

        <div className="flex items-center text-gray-700">
          <div className="p-1.5 bg-blue-50 rounded-md mr-2.5 shadow-sm">
            <Package className="h-3.5 w-3.5 text-blue-600" />
          </div>
          <span className="font-medium">Tamaños: {getAcceptedSizes()}</span>
        </div>
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
              <p>Marcar como favorito</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="flex space-x-2">
          <Link href={`/pde/${pde.id}`} passHref>
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
