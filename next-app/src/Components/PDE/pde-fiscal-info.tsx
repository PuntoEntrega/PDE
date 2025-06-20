// v0 was here
"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Badge } from "@/Components/ui/badge"
import { CreditCard, FileText, Building2, DollarSign, Calendar, TrendingUp } from "lucide-react"

interface InfoRowProps {
  icon: React.ElementType
  label: string
  value?: string | React.ReactNode
  className?: string
}

const InfoRow: React.FC<InfoRowProps> = ({ icon: Icon, label, value, className }) => {
  if (value === undefined || value === null || value === "") return null
  return (
    <div className={`flex items-start py-4 ${className}`}>
      <div className="p-2 bg-blue-50 rounded-lg mr-3 mt-0.5 flex-shrink-0 shadow-sm">
        <Icon className="h-4 w-4 text-blue-600" />
      </div>
      <div className="flex-1">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{label}</p>
        <div className="text-sm font-medium text-gray-800 break-words">{value}</div>
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

interface PDEFiscalInfoProps {
  pde: any
}

export function PDEFiscalInfo({ pde }: PDEFiscalInfoProps) {
  // Mock data para información fiscal
  const fiscalData = {
    taxId: "3-101-789456",
    taxRegime: "Régimen Tradicional",
    taxStatus: "Al día",
    lastDeclaration: "2024-03-15",
    monthlyRevenue: "₡2,450,000",
    yearlyRevenue: "₡28,500,000",
    taxRate: "13%",
    nextPayment: "2024-07-15",
    accountingPeriod: "Enero - Diciembre 2024",
    fiscalAddress: "San José, Escazú, San Rafael, 200m norte del Mall Multiplaza",
  }

  const formatCurrency = (amount: string) => {
    return <span className="font-semibold text-green-600">{amount}</span>
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "al día":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
            Al día
          </Badge>
        )
      case "pendiente":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300">
            Pendiente
          </Badge>
        )
      case "moroso":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
            Moroso
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">
            {status}
          </Badge>
        )
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <StyledCard icon={FileText} title="Información Tributaria">
          <InfoRow icon={FileText} label="Cédula Jurídica" value={fiscalData.taxId} />
          <InfoRow icon={Building2} label="Régimen Tributario" value={fiscalData.taxRegime} />
          <InfoRow icon={CreditCard} label="Estado Tributario" value={getStatusBadge(fiscalData.taxStatus)} />
          <InfoRow
            icon={Calendar}
            label="Última Declaración"
            value={new Date(fiscalData.lastDeclaration).toLocaleDateString("es-CR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          />
          <InfoRow
            icon={Calendar}
            label="Próximo Pago"
            value={new Date(fiscalData.nextPayment).toLocaleDateString("es-CR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          />
        </StyledCard>

        <StyledCard icon={Building2} title="Dirección Fiscal">
          <InfoRow icon={Building2} label="Dirección Registrada" value={fiscalData.fiscalAddress} />
          <InfoRow icon={Calendar} label="Período Contable" value={fiscalData.accountingPeriod} />
        </StyledCard>
      </div>

      <div className="space-y-6">
        <StyledCard icon={DollarSign} title="Información Financiera">
          <InfoRow
            icon={TrendingUp}
            label="Ingresos Mensuales Promedio"
            value={formatCurrency(fiscalData.monthlyRevenue)}
          />
          <InfoRow
            icon={TrendingUp}
            label="Ingresos Anuales Estimados"
            value={formatCurrency(fiscalData.yearlyRevenue)}
          />
          <InfoRow icon={DollarSign} label="Tasa de Impuesto" value={fiscalData.taxRate} />
        </StyledCard>

        <Card className="shadow-lg border border-gray-200 rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 p-5 border-b">
            <div className="flex items-center">
              <div className="p-2.5 bg-yellow-100 rounded-lg mr-3 shadow-sm">
                <FileText className="h-5 w-5 text-yellow-600" />
              </div>
              <CardTitle className="text-lg font-semibold text-gray-800">Documentos Fiscales</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Certificación Tributaria</span>
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                  Vigente
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Estado de Cuenta DGT</span>
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                  Actualizado
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Declaración IVA</span>
                <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300">
                  Pendiente
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
