"use client"

import { CardContent } from "@/components/ui/card"

import { CardHeader } from "@/components/ui/card"

import { Card } from "@/components/ui/card"

import { useEffect, useState } from "react"
import { getMyCompanies } from "@/actions/company"
import { CompanyCard, type CompanyWithDetails } from "./company-card"
import { Skeleton } from "@/Components/ui/skeleton"
import Link from "next/link"
import { Button } from "@/Components/ui/button"
import { PlusCircle } from "lucide-react"

export function CompanyList() {
  const [companies, setCompanies] = useState<CompanyWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCompanies() {
      setIsLoading(true)
      setError(null)
      const result = await getMyCompanies()
      if (result.success) {
        setCompanies(result.companies as CompanyWithDetails[]) // Cast needed due to Prisma types
      } else {
        setError(result.message || "Error al cargar empresas.")
      }
      setIsLoading(false)
    }
    loadCompanies()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-start gap-4">
              <Skeleton className="h-16 w-16 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-6 w-1/4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return <p className="text-red-500">{error}</p>
  }

  if (companies.length === 0) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold mb-2">No tienes empresas registradas.</h2>
        <p className="text-muted-foreground mb-4">Comienza creando tu primera empresa.</p>
        <Button asChild>
          <Link href="/companies/create">
            <PlusCircle className="mr-2 h-4 w-4" /> Crear Empresa
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {companies.map((company) => (
        <CompanyCard key={company.id} company={company} />
      ))}
    </div>
  )
}
