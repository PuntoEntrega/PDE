// v0 was here
"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Badge } from "@/Components/ui/badge"
import { Info, MapPin, Package, Clock3, CreditCard, CheckCircle, XCircle, Store, Mail, Phone } from "lucide-react"

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
          <a href={href} className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline break-words">
            {value}
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
}: {
  icon: React.ElementType
  title: string
  children: React.ReactNode
}) => (
  <Card className="shadow-lg border border-gray-200 rounded-xl overflow-hidden">
    <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-100 p-5 border-b">
      <div className="flex items-center">
        <div className="p-2.5 bg-blue-100 rounded-lg mr-3 shadow-sm">
          <Icon className="h-5 w-5 text-blue-600" />
        </div>
        <CardTitle className="text-lg font-semibold text-gray-800">{title}</CardTitle>
      </div>
    </CardHeader>
    <CardContent className="p-5 divide-y divide-gray-100">{children}</CardContent>
  </Card>
)

interface PDEGeneralInfoProps {
  pde: any
}

export function PDEGeneralInfo({ pde }: PDEGeneralInfoProps) {
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
    return sizes
  }

  // Función para obtener los servicios disponibles
  const getAvailableServices = () => {
    const services = []
    if (pde.services_json?.cash) services.push("Efectivo")
    if (pde.services_json?.cards) services.push("Tarjetas")
    if (pde.services_json?.sinpe) services.push("SINPE Móvil")
    if (pde.services_json?.parking) services.push("Parqueo")
    if (pde.services_json?.accessibility) services.push("Accesibilidad")
    if (pde.services_json?.guidesPrinting) services.push("Impresión de guías")
    return services
  }

  // Función para obtener el horario formateado
  const getScheduleInfo = () => {
    if (!pde.schedule_json) return "No disponible"

    const days = [
      { key: "monday", name: "Lunes" },
      { key: "tuesday", name: "Martes" },
      { key: "wednesday", name: "Miércoles" },
      { key: "thursday", name: "Jueves" },
      { key: "friday", name: "Viernes" },
      { key: "saturday", name: "Sábado" },
      { key: "sunday", name: "Domingo" },
    ]

    return (
      <div className="space-y-2">
        {days.map((day) => {
          const daySchedule = pde.schedule_json[day.key]
          return (
            <div key={day.key} className="flex justify-between items-center">
              <span className="font-medium text-gray-700">{day.name}:</span>
              <span className={`text-sm ${daySchedule?.isOpen ? "text-green-600" : "text-red-600"}`}>
                {daySchedule?.isOpen ? `${daySchedule.openTime} - ${daySchedule.closeTime}` : "Cerrado"}
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <StyledCard icon={Info} title="Información Básica">
          <InfoRow icon={Store} label="Nombre del Punto de Entrega" value={pde.name} />
          <InfoRow
            icon={Mail}
            label="Email de Contacto"
            value={pde.business_email}
            isLink
            href={`mailto:${pde.business_email}`}
          />
          <InfoRow
            icon={Phone}
            label="WhatsApp de Contacto"
            value={pde.whatsapp_contact}
            isLink
            href={`tel:${pde.whatsapp_contact}`}
          />

        </StyledCard>

        <StyledCard icon={MapPin} title="Ubicación">
          <InfoRow icon={MapPin} label="Provincia" value={pde.province} />
          <InfoRow icon={MapPin} label="Cantón" value={pde.canton} />
          <InfoRow icon={MapPin} label="Distrito" value={pde.district} />
          <InfoRow icon={MapPin} label="Código Postal" value={pde.postal_code} />
          <InfoRow icon={MapPin} label="Dirección Exacta" value={pde.exact_address} />
        </StyledCard>
      </div>

      <div className="space-y-6">
        <StyledCard icon={Package} title="Paquetería">
          <div className="">
            <InfoRow icon={Package} label="Área de Almacenamiento" value={`${pde.storage_area_m2} m²`} />
            <div className="flex flex-wrap gap-2 mt-3">
              {getAcceptedSizes().map((size) => (
                <Badge key={size} variant="outline" className="bg-green-100 text-green-700 border-green-300">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  {size}
                </Badge>
              ))}
              {getAcceptedSizes().length === 0 && (
                <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                  <XCircle className="mr-1 h-3 w-3" />
                  Ningún tamaño aceptado
                </Badge>
              )}
            </div>
          </div>
        </StyledCard>

        <StyledCard icon={CreditCard} title="Servicios Disponibles">
          <div className="py-4">
            <div className="space-y-2">
              {getAvailableServices().map((service) => (
                <div key={service} className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-sm text-gray-700">{service}</span>
                </div>
              ))}
              {getAvailableServices().length === 0 && (
                <div className="flex items-center">
                  <XCircle className="h-4 w-4 text-red-600 mr-2" />
                  <span className="text-sm text-gray-700">No hay servicios disponibles</span>
                </div>
              )}
            </div>
          </div>
        </StyledCard>

        <StyledCard icon={Clock3} title="Horario de Atención">
          <div className="py-4">{getScheduleInfo()}</div>
        </StyledCard>
      </div>
    </div>
  )
}
