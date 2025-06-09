"use client"

import { useEffect, useState } from "react"
import { getCompanies } from "@/Services/companies"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/card"
import { Badge } from "@/Components/ui/badge"
import { Skeleton } from "@/Components/ui/skeleton"
import Image from "next/image"
import { Building, Phone, Mail } from "lucide-react"

// Asumimos que el modelo de Prisma para Companies tiene estos campos.
interface Company {
  id: string
  legal_name: string
  trade_name?: string | null
  company_type?: "PdE" | "Transportista" | null
  legal_id: string
  contact_email?: string | null
  contact_phone?: string | null
  logo_url?: string | null
  active?: boolean | null
}

function CompanyCard({ company }: { company: Company }) {
  return (
    <Card className="flex flex-col justify-between">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>{company.trade_name || company.legal_name}</CardTitle>
            <CardDescription>{company.legal_id}</CardDescription>
          </div>
          {company.logo_url ? (
            <Image
              src={company.logo_url || "/placeholder.svg"}
              alt={`Logo de ${company.legal_name}`}
              width={48}
              height={48}
              className="rounded-md object-contain"
            />
          ) : (
            <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center">
              <Building className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          {company.company_type && <Badge variant="secondary">{company.company_type}</Badge>}
          <Badge variant={company.active ? "default" : "destructive"}>{company.active ? "Activa" : "Inactiva"}</Badge>
        </div>
        {company.contact_email && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Mail className="mr-2 h-4 w-4" />
            <span>{company.contact_email}</span>
          </div>
        )}
        {company.contact_phone && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Phone className="mr-2 h-4 w-4" />
            <span>{company.contact_phone}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function CompanyCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="w-12 h-12 rounded-md" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-2/3" />
      </CardContent>
    </Card>
  )
}

export function ShowAllCompanies({ refreshTrigger }: { refreshTrigger: number }) {
  const [companies, setCompanies] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadCompanies = async () => {
      setIsLoading(true)
      try {
        const data = await getCompanies()
        setCompanies(data)
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }
    loadCompanies()
  }, [refreshTrigger])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <CompanyCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (companies.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg">
        <Building className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No hay empresas</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Aún no has registrado ninguna empresa.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {companies.map((company) => (
        <CompanyCard key={company.id} company={company} />
      ))}
    </div>
  )
}
